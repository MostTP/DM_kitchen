import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(
        process.env.SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY,
      )
    : null;

const DELIVERY_FEE = 1000;

const orderStatuses = new Set([
  "new",
  "preparing",
  "ready",
  "out_for_delivery",
  "completed",
  "cancelled",
]);

function json(request: NextRequest, status: number, body: unknown) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function isEmailConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) return false;
  return !/(example|placeholder|your[_ -]?)/i.test(
    `${SMTP_HOST} ${EMAIL_FROM}`,
  );
}

interface StoredOrder {
  order_id: string;
  customer: { fullName?: string; email?: string } & Record<string, unknown>;
  items: unknown;
  subtotal: number;
  delivery_fee: number;
  total: number;
  payment_status: string;
  status?: string;
  created_at?: string;
}

interface PaystackPayment {
  amount: number;
  currency: string;
  status?: string;
  reference?: string;
}

async function sendConfirmation(order: {
  orderId: string;
  customer: { fullName?: string; email?: string };
  total: number;
}) {
  if (!isEmailConfigured() || !order.customer?.email) return;
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  });
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: order.customer.email,
    subject: `DMK order confirmed — ${order.orderId}`,
    text: `Thank you, ${order.customer.fullName}. Your order ${order.orderId} is confirmed. Total paid: ₦${order.total.toLocaleString()}.`,
  });
}

async function ordersTableReady() {
  if (!supabase) return false;
  const { error } = await supabase.from("orders").select("order_id").limit(1);
  if (error?.code === "PGRST205" || error?.code === "42P01") return false;
  if (error) throw error;
  return true;
}

async function requireUser(request: NextRequest) {
  const authorization = request.headers.get("authorization") || "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice(7)
    : "";
  if (!supabase || !token)
    return {
      error: json(request, supabase ? 401 : 503, {
        error: supabase ? "Sign in to continue" : "Supabase is not configured",
      }),
    };
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user)
    return {
      error: json(request, 401, {
        error: "Your session has expired. Sign in again.",
      }),
    };
  return { user: data.user };
}

function isAdmin(user: { email?: string }) {
  const approved = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return Boolean(user.email && approved.includes(user.email.toLowerCase()));
}

function mapOrder(data: StoredOrder) {
  return {
    orderId: data.order_id,
    customer: data.customer,
    items: data.items,
    subtotal: data.subtotal,
    deliveryFee: data.delivery_fee,
    total: data.total,
    paymentStatus: data.payment_status,
    status: data.status,
    createdAt: data.created_at,
  };
}

function orderResponse(data: StoredOrder) {
  return {
    orderId: data.order_id,
    customer: data.customer,
    items: data.items,
    subtotal: data.subtotal,
    deliveryFee: data.delivery_fee,
    total: data.total,
    paymentStatus: data.payment_status,
  };
}

function createDeliveryToken(orderId: string, userId: string) {
  const expiresAt = Date.now() + 10 * 60 * 1000;
  const payload = Buffer.from(
    JSON.stringify({ orderId, userId, expiresAt }),
  ).toString("base64url");
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const signature = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

function validDeliveryToken(token: string, orderId: string, userId: string) {
  if (!token || !process.env.SUPABASE_SERVICE_ROLE_KEY) return false;
  const [payload, signature, ...rest] = token.split(".");
  if (!payload || !signature || rest.length) return false;
  const expected = crypto
    .createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY)
    .update(payload)
    .digest();
  const received = Buffer.from(signature, "base64url");
  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  )
    return false;
  try {
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return (
      data.orderId === orderId &&
      data.userId === userId &&
      data.expiresAt > Date.now()
    );
  } catch {
    return false;
  }
}

async function paystack(path: string, options: RequestInit = {}) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${secret}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
    signal: AbortSignal.timeout(15000),
  });
  return { response, result: await response.json() };
}

async function markOrderPaid(reference: string, payment: PaystackPayment) {
  if (!supabase) return null;
  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("paystack_reference", reference)
    .maybeSingle();
  if (error) throw error;
  if (!order) return null;
  if (
    Number(payment.amount) !== order.total * 100 ||
    payment.currency !== "NGN"
  )
    throw new Error("Payment amount or currency does not match the order");
  if (order.payment_status !== "paid") {
    const { data: updated, error: updateError } = await supabase
      .from("orders")
      .update({ payment_status: "paid", paid_at: new Date().toISOString() })
      .eq("order_id", order.order_id)
      .eq("payment_status", "pending")
      .select("order_id")
      .maybeSingle();
    if (updateError) throw updateError;
    if (updated) {
      try {
        await sendConfirmation(
          orderResponse({ ...order, payment_status: "paid" }),
        );
      } catch (emailError) {
        console.error("Unable to send order confirmation email:", emailError);
      }
    }
  }
  return orderResponse({ ...order, payment_status: "paid" });
}

async function handleWebhook(request: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const signature = request.headers.get("x-paystack-signature");
  if (!secret || !signature)
    return json(request, 401, { error: "Unauthorized" });
  const raw = await request.arrayBuffer();
  const expected = crypto
    .createHmac("sha512", secret)
    .update(Buffer.from(raw))
    .digest();
  const received = Buffer.from(signature, "hex");
  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  )
    return json(request, 401, { error: "Unauthorized" });
  let event: { event?: string; data?: PaystackPayment };
  try {
    event = JSON.parse(Buffer.from(raw).toString("utf8"));
  } catch {
    return json(request, 400, { error: "Invalid webhook payload" });
  }
  if (event.event !== "charge.success") return json(request, 200, { ok: true });
  try {
    if (!(await ordersTableReady()))
      return json(request, 503, {
        error: "Supabase orders table is not ready",
      });
    if (
      !event.data ||
      typeof event.data.reference !== "string" ||
      typeof event.data.amount !== "number" ||
      typeof event.data.currency !== "string"
    ) {
      return json(request, 400, { error: "Invalid payment event" });
    }
    const order = await markOrderPaid(event.data.reference, event.data);
    return order
      ? json(request, 200, { ok: true })
      : json(request, 503, { error: "Order is not available yet" });
  } catch (error) {
    console.error("Unable to process Paystack webhook:", error);
    return json(request, 500, { error: "Unable to process payment event" });
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const route = path.join("/");

  if (route === "health") {
    let ready = false;
    if (supabase) {
      try {
        ready = await ordersTableReady();
      } catch (error) {
        console.error(error);
      }
    }
    return json(request, 200, {
      ok: true,
      supabase: ready,
      supabaseConfigured: Boolean(supabase),
      paystack: Boolean(process.env.PAYSTACK_SECRET_KEY),
      email: isEmailConfigured(),
    });
  }

  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const user = auth.user!;

  if (route === "account/orders") {
    if (!supabase)
      return json(request, 503, { error: "Supabase is not configured" });
    try {
      if (!(await ordersTableReady()))
        return json(request, 503, {
          error: "Supabase orders table is not ready",
        });
      const { data, error } = await supabase
        .from("orders")
        .select(
          "order_id, customer, items, subtotal, delivery_fee, total, status, payment_status, created_at",
        )
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return json(request, 200, { orders: data.map(mapOrder) });
    } catch (error) {
      console.error(error);
      return json(request, 500, { error: "Unable to retrieve your orders" });
    }
  }

  if (route === "admin/orders") {
    if (!isAdmin(user)) return json(request, 403, { error: "Forbidden" });
    try {
      if (!(await ordersTableReady()))
        return json(request, 503, {
          error: "Supabase orders table is not ready",
        });
      const { data, error } = await supabase!
        .from("orders")
        .select(
          "order_id, customer, items, subtotal, delivery_fee, total, status, payment_status, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return json(request, 200, { orders: data.map(mapOrder) });
    } catch (error) {
      console.error(error);
      return json(request, 500, { error: "Unable to retrieve orders" });
    }
  }

  if (route.startsWith("payments/verify/")) {
    const reference = decodeURIComponent(
      route.slice("payments/verify/".length),
    );
    if (!process.env.PAYSTACK_SECRET_KEY)
      return json(request, 503, { error: "Paystack is not configured" });
    try {
      if (!(await ordersTableReady()))
        return json(request, 503, {
          error: "Supabase orders table is not ready",
        });
      const { data: owned, error: ownerError } = await supabase!
        .from("orders")
        .select("order_id")
        .eq("paystack_reference", reference)
        .eq("user_id", user.id)
        .maybeSingle();
      if (ownerError) throw ownerError;
      if (!owned) return json(request, 404, { error: "Order not found" });
      const { response, result } = await paystack(
        `/transaction/verify/${encodeURIComponent(reference)}`,
      );
      if (!response.ok || !result.status || result.data?.status !== "success")
        return json(request, 400, { error: "Payment has not been confirmed" });
      const order = await markOrderPaid(reference, result.data);
      return order
        ? json(request, 200, order)
        : json(request, 404, { error: "Order not found" });
    } catch (error) {
      console.error(error);
      return json(request, 500, { error: "Unable to verify payment" });
    }
  }

  return json(request, 404, { error: "Not found" });
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const route = path.join("/");

  if (route === "paystack/webhook") return handleWebhook(request);

  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const user = auth.user!;
  const body = await request.json().catch(() => null);

  if (route === "payments/initialize") {
    if (!process.env.PAYSTACK_SECRET_KEY)
      return json(request, 503, { error: "Paystack is not configured" });
    if (!supabase)
      return json(request, 503, { error: "Supabase is not configured" });
    try {
      if (!(await ordersTableReady()))
        return json(request, 503, {
          error: "Supabase orders table is not ready",
        });
      const total = Number(body?.total);
      const subtotal = Number(body?.subtotal);
      const method = body?.customer?.fulfillmentMethod;
      const submittedDeliveryFee = Number(body?.deliveryFee);
      const customerName = String(body?.customer?.fullName ?? "").trim();
      const customerPhone = String(body?.customer?.phone ?? "").trim();
      const customerAddress = String(body?.customer?.address ?? "").trim();

      if (!user.email || !customerName || !customerPhone)
        return json(request, 400, { error: "Customer name and phone number are required" });
      if (method !== "delivery" && method !== "collection")
        return json(request, 400, { error: "Select delivery or collection for your order" });
      if (method === "delivery" && !customerAddress)
        return json(request, 400, { error: "A delivery address is required" });

      const items = Array.isArray(body?.items) ? body.items : [];
      const recalculatedSubtotal = items.reduce((sum: number, item: { quantity?: unknown; unitPrice?: unknown }) => {
        const quantity = Number(item.quantity);
        const unitPrice = Number(item.unitPrice);
        if (!Number.isFinite(quantity) || !Number.isFinite(unitPrice) || quantity <= 0 || unitPrice < 0)
          return Number.NaN;
        return sum + quantity * unitPrice;
      }, 0);
      if (!Number.isFinite(recalculatedSubtotal) || recalculatedSubtotal <= 0)
        return json(request, 400, { error: "A valid order is required" });

      const recalculatedDeliveryFee = method === "delivery" ? DELIVERY_FEE : 0;
      const recalculatedTotal = recalculatedSubtotal + recalculatedDeliveryFee;
      if (
        !Number.isFinite(subtotal)
        || !Number.isFinite(submittedDeliveryFee)
        || !Number.isFinite(total)
        || Math.round(subtotal) !== Math.round(recalculatedSubtotal)
        || submittedDeliveryFee !== recalculatedDeliveryFee
        || Math.round(total) !== Math.round(recalculatedTotal)
      ) {
        return json(request, 400, { error: "The order price or delivery fee is invalid" });
      }
      const orderId = `DMK-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
      const { response, result } = await paystack("/transaction/initialize", {
        method: "POST",
        body: JSON.stringify({
          email: user.email,
          amount: Math.round(total * 100),
          reference: orderId,
          currency: "NGN",
          callback_url: process.env.PAYSTACK_CALLBACK_URL,
          metadata: {
            order_id: orderId,
            customer_name: body.customer.fullName,
          },
        }),
      });
      if (!response.ok || !result.status)
        return json(request, 502, {
          error: "Payment provider is temporarily unavailable",
        });
      const stored = {
        ...body,
        orderId,
        userId: user.id,
        customer: { ...body.customer, email: user.email },
        subtotal: recalculatedSubtotal,
        deliveryFee: recalculatedDeliveryFee,
        total: recalculatedTotal,
        reference: result.data.reference,
        paymentStatus: "pending",
      };
      const { error } = await supabase
        .from("orders")
        .insert({
          order_id: stored.orderId,
          user_id: stored.userId,
          customer: stored.customer,
          items: stored.items,
          subtotal: stored.subtotal,
          delivery_fee: stored.deliveryFee,
          total: stored.total,
          payment_status: "pending",
          paystack_reference: stored.reference,
        });
      if (error) throw error;
      return json(request, 200, {
        authorizationUrl: result.data.authorization_url,
        reference: result.data.reference,
        orderId,
      });
    } catch (error) {
      console.error(error);
      return json(request, 500, { error: "Unable to initialize payment" });
    }
  }

  if (route === "admin/orders/verify") {
    if (!isAdmin(user)) return json(request, 403, { error: "Forbidden" });
    const orderId =
      typeof body?.orderId === "string"
        ? body.orderId.trim().toUpperCase()
        : "";
    if (!orderId || orderId.length > 100)
      return json(request, 400, {
        error: "Enter the order code provided by the customer",
      });
    try {
      const { data, error } = await supabase!
        .from("orders")
        .select(
          "order_id, customer, items, subtotal, delivery_fee, total, status, payment_status, created_at",
        )
        .eq("order_id", orderId)
        .maybeSingle();
      if (error) throw error;
      if (!data)
        return json(request, 404, { error: "No order matches that code" });
      const canDeliver = data.payment_status === "paid";
      return json(request, 200, {
        order: mapOrder(data),
        canDeliver,
        verificationToken: canDeliver
          ? createDeliveryToken(data.order_id, user.id)
          : null,
      });
    } catch (error) {
      console.error(error);
      return json(request, 500, { error: "Unable to verify this order" });
    }
  }

  return json(request, 404, { error: "Not found" });
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const route = path.join("/");
  const auth = await requireUser(request);
  if (auth.error) return auth.error;
  const user = auth.user!;
  if (!isAdmin(user)) return json(request, 403, { error: "Forbidden" });

  const match = route.match(/^admin\/orders\/([^/]+)\/status$/);
  if (!match) return json(request, 404, { error: "Not found" });
  const orderId = decodeURIComponent(match[1]).trim().toUpperCase();
  const body = await request.json().catch(() => null);
  const status = body?.status;
  if (!orderStatuses.has(status))
    return json(request, 400, { error: "Choose a valid order status" });

  try {
    if (
      status === "out_for_delivery" &&
      !validDeliveryToken(body?.verificationToken, orderId, user.id)
    )
      return json(request, 403, {
        error:
          "Verify the customer order code before sending it out for delivery",
      });
    const { data: current, error: currentError } = await supabase!
      .from("orders")
      .select("order_id, payment_status, status")
      .eq("order_id", orderId)
      .maybeSingle();
    if (currentError) throw currentError;
    if (!current) return json(request, 404, { error: "Order not found" });
    if (
      ["preparing", "ready", "out_for_delivery", "completed"].includes(
        status,
      ) &&
      current.payment_status !== "paid"
    )
      return json(request, 409, {
        error: "Payment must be confirmed before fulfilling this order",
      });
    if (status === "completed" && current.status !== "out_for_delivery")
      return json(request, 409, {
        error: "An order must be out for delivery before it can be completed",
      });
    const { data, error } = await supabase!
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("order_id", orderId)
      .eq("payment_status", current.payment_status)
      .eq("status", current.status)
      .select(
        "order_id, customer, items, subtotal, delivery_fee, total, status, payment_status, created_at",
      )
      .maybeSingle();
    if (error) throw error;
    if (!data) return json(request, 404, { error: "Order not found" });
    return json(request, 200, { order: mapOrder(data) });
  } catch (error) {
    console.error(error);
    return json(request, 500, { error: "Unable to update order status" });
  }
}
