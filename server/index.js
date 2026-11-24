import dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })
dotenv.config()

const app = express()
const port = Number(process.env.PORT || 8787)
const allowedOrigins = (process.env.APP_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null

app.use(cors({ origin: allowedOrigins }))

function createTransporter() {
  if (!isEmailConfigured()) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
      : undefined,
  })
}

function isEmailConfigured() {
  const { SMTP_HOST, SMTP_USER, SMTP_PASS, EMAIL_FROM } = process.env
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !EMAIL_FROM) return false
  return !/(example|placeholder|your[_ -]?)/i.test(`${SMTP_HOST} ${EMAIL_FROM}`)
}

async function sendConfirmation(order) {
  const transporter = createTransporter()
  if (!transporter || !order.customer?.email) return

  await transporter.sendMail({
    from: process.env.EMAIL_FROM || 'DMK <orders@example.com>',
    to: order.customer.email,
    subject: `DMK order confirmed — ${order.orderId}`,
    text: `Thank you, ${order.customer.fullName}. Your order ${order.orderId} is confirmed. Total paid: ₦${order.total.toLocaleString()}.`,
  })
}

async function saveOrder(order) {
  const { error } = await supabase.from('orders').insert({
    order_id: order.orderId,
    user_id: order.userId,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    payment_status: 'pending',
    paystack_reference: order.reference,
  })
  if (error) throw error
}

function requireUser(request, response, next) {
  const authorization = request.get('authorization') || ''
  const token = authorization.startsWith('Bearer ') ? authorization.slice(7) : ''
  if (!supabase || !token) {
    return response.status(supabase ? 401 : 503).json({
      error: supabase ? 'Sign in to continue' : 'Supabase is not configured',
    })
  }

  supabase.auth.getUser(token).then(({ data, error }) => {
    if (error || !data.user) {
      return response.status(401).json({ error: 'Your session has expired. Sign in again.' })
    }
    request.user = data.user
    return next()
  }).catch((error) => {
    console.error('Unable to verify user session:', error)
    return response.status(500).json({ error: 'Unable to verify user session' })
  })
}

function isAdmin(user) {
  const approvedEmails = (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
  return Boolean(user.email && approvedEmails.includes(user.email.toLowerCase()))
}

function requireAdmin(request, response, next) {
  if (!isAdmin(request.user)) return response.sendStatus(403)
  return next()
}

function createDeliveryVerificationToken(orderId, userId) {
  const expiresAt = Date.now() + 10 * 60 * 1000
  const payload = Buffer.from(JSON.stringify({ orderId, userId, expiresAt })).toString('base64url')
  const signature = crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY)
    .update(payload)
    .digest('base64url')
  return `${payload}.${signature}`
}

function isValidDeliveryVerificationToken(token, orderId, userId) {
  if (typeof token !== 'string' || !process.env.SUPABASE_SERVICE_ROLE_KEY) return false
  const [payload, signature, ...rest] = token.split('.')
  if (!payload || !signature || rest.length) return false

  const expected = crypto
    .createHmac('sha256', process.env.SUPABASE_SERVICE_ROLE_KEY)
    .update(payload)
    .digest()
  const received = Buffer.from(signature, 'base64url')
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) return false

  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
    return data.orderId === orderId && data.userId === userId && data.expiresAt > Date.now()
  } catch {
    return false
  }
}

function mapOrder(data) {
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
  }
}

async function ordersTableReady() {
  if (!supabase) return false
  const { error } = await supabase.from('orders').select('order_id').limit(1)
  if (error?.code === 'PGRST205' || error?.code === '42P01') return false
  if (error) throw error
  return true
}

async function getPaystackResponse(path, options = {}) {
  const response = await fetch(`https://api.paystack.co${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal: AbortSignal.timeout(15000),
  })
  const result = await response.json()
  return { response, result }
}

function orderResponse(data) {
  return {
    orderId: data.order_id,
    customer: data.customer,
    items: data.items,
    subtotal: data.subtotal,
    deliveryFee: data.delivery_fee,
    total: data.total,
    paymentStatus: data.payment_status,
  }
}

async function markOrderPaid(reference, payment) {
  const { data: order, error: findError } = await supabase
    .from('orders')
    .select('*')
    .eq('paystack_reference', reference)
    .maybeSingle()
  if (findError) throw findError
  if (!order) return null

  if (
    Number(payment.amount) !== order.total * 100 ||
    payment.currency !== 'NGN'
  ) {
    throw new Error('Payment amount or currency does not match the order')
  }

  if (order.payment_status !== 'paid') {
    const { data: updated, error: updateError } = await supabase
      .from('orders')
      .update({ payment_status: 'paid', paid_at: new Date().toISOString() })
      .eq('order_id', order.order_id)
      .eq('payment_status', 'pending')
      .select('order_id')
      .maybeSingle()
    if (updateError) throw updateError

    if (updated) {
      try {
        await sendConfirmation(orderResponse({ ...order, payment_status: 'paid' }))
      } catch (error) {
        console.error('Unable to send order confirmation email:', error)
      }
    }
  }

  return orderResponse({ ...order, payment_status: 'paid' })
}

app.post(
  '/api/paystack/webhook',
  express.raw({ type: 'application/json', limit: '1mb' }),
  async (request, response) => {
    const secret = process.env.PAYSTACK_SECRET_KEY
    const signature = request.get('x-paystack-signature')
    if (!secret || !Buffer.isBuffer(request.body) || !signature) {
      return response.sendStatus(401)
    }

    const expected = crypto.createHmac('sha512', secret).update(request.body).digest()
    let received
    try {
      received = Buffer.from(signature, 'hex')
    } catch {
      return response.sendStatus(401)
    }
    if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
      return response.sendStatus(401)
    }

    let event
    try {
      event = JSON.parse(request.body.toString('utf8'))
    } catch {
      return response.status(400).json({ error: 'Invalid webhook payload' })
    }

    if (event.event !== 'charge.success') return response.sendStatus(200)

    try {
      if (!(await ordersTableReady())) {
        return response.status(503).json({ error: 'Supabase orders table is not ready' })
      }
      const order = await markOrderPaid(event.data?.reference, event.data)
      if (!order) return response.status(503).json({ error: 'Order is not available yet' })
      return response.sendStatus(200)
    } catch (error) {
      console.error('Unable to process Paystack webhook:', error)
      return response.status(500).json({ error: 'Unable to process payment event' })
    }
  },
)

app.use(express.json({ limit: '1mb' }))

app.post('/api/payments/initialize', requireUser, async (request, response) => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return response.status(503).json({ error: 'Paystack is not configured' })
  }
  if (!supabase) {
    return response.status(503).json({ error: 'Supabase is not configured' })
  }
  try {
    if (!(await ordersTableReady())) {
      return response.status(503).json({ error: 'Supabase orders table is not ready' })
    }
  } catch (error) {
    console.error('Unable to check Supabase orders table:', error)
    return response.status(503).json({ error: 'Unable to access the Supabase orders table' })
  }

  const order = request.body
  const total = Number(order?.total)
  const customerName = String(order?.customer?.fullName ?? '').trim()
  const customerPhone = String(order?.customer?.phone ?? '').trim()
  const fulfillmentMethod = order?.customer?.fulfillmentMethod
  const customerAddress = String(order?.customer?.address ?? '').trim()
  const deliveryDate = String(order?.customer?.deliveryDate ?? '')
  const deliveryTime = String(order?.customer?.deliveryTime ?? '')
  const dateParts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(deliveryDate)
  const parsedDate = dateParts
    ? new Date(Date.UTC(Number(dateParts[1]), Number(dateParts[2]) - 1, Number(dateParts[3])))
    : null
  const validDeliveryDate = Boolean(
    dateParts &&
    parsedDate &&
    parsedDate.getUTCFullYear() === Number(dateParts[1]) &&
    parsedDate.getUTCMonth() === Number(dateParts[2]) - 1 &&
    parsedDate.getUTCDate() === Number(dateParts[3]),
  )
  const phoneDigits = customerPhone.replace(/\D/g, '')
  if (
    !request.user.email ||
    !customerName ||
    !customerPhone ||
    !Number.isFinite(total) ||
    total <= 0 ||
    !Number.isSafeInteger(Math.round(total * 100))
  ) {
    return response.status(400).json({ error: 'Customer details and a valid order total are required' })
  }
  if (!/^\+?[\d\s()-]+$/.test(customerPhone) || phoneDigits.length < 7 || phoneDigits.length > 15) {
    return response.status(400).json({ error: 'Enter a valid phone number' })
  }
  if (fulfillmentMethod !== 'delivery' && fulfillmentMethod !== 'collection') {
    return response.status(400).json({ error: 'Select delivery or collection for your order' })
  }
  if (fulfillmentMethod === 'delivery' && !customerAddress) {
    return response.status(400).json({ error: 'A delivery address is required' })
  }
  if (!validDeliveryDate || !/^([01]\d|2[0-3]):[0-5]\d$/.test(deliveryTime)) {
    return response.status(400).json({ error: 'Select a valid preferred date and time' })
  }

  try {
    const orderId = `DMK-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
    const { response: paystackResponse, result: paystack } = await getPaystackResponse(
      '/transaction/initialize',
      {
        method: 'POST',
        body: JSON.stringify({
          email: request.user.email,
          amount: Math.round(total * 100),
          reference: orderId,
          currency: 'NGN',
          callback_url: process.env.PAYSTACK_CALLBACK_URL,
          metadata: { order_id: orderId, customer_name: order.customer.fullName },
        }),
      },
    )

    if (!paystackResponse.ok || !paystack.status) {
      return response.status(502).json({ error: 'Payment provider is temporarily unavailable' })
    }

    const storedOrder = {
      ...order,
      orderId,
      userId: request.user.id,
      customer: {
        ...order.customer,
        email: request.user.email,
      },
      total,
      reference: paystack.data.reference,
      paymentStatus: 'pending',
    }
    await saveOrder(storedOrder)

    return response.json({
      authorizationUrl: paystack.data.authorization_url,
      reference: paystack.data.reference,
      orderId,
    })
  } catch (error) {
    console.error('Unable to initialize payment:', error)
    return response.status(500).json({ error: 'Unable to initialize payment' })
  }
})

app.get('/api/payments/verify/:reference', requireUser, async (request, response) => {
  if (!process.env.PAYSTACK_SECRET_KEY) {
    return response.status(503).json({ error: 'Paystack is not configured' })
  }
  if (!supabase) {
    return response.status(503).json({ error: 'Supabase is not configured' })
  }

  try {
    if (!(await ordersTableReady())) {
      return response.status(503).json({ error: 'Supabase orders table is not ready' })
    }
    const { data: ownedOrder, error: ownerError } = await supabase
      .from('orders')
      .select('order_id')
      .eq('paystack_reference', request.params.reference)
      .eq('user_id', request.user.id)
      .maybeSingle()
    if (ownerError) throw ownerError
    if (!ownedOrder) return response.status(404).json({ error: 'Order not found' })

    const { response: paystackResponse, result: paystack } = await getPaystackResponse(
      `/transaction/verify/${encodeURIComponent(request.params.reference)}`,
    )
    if (
      !paystackResponse.ok ||
      !paystack.status ||
      paystack.data?.status !== 'success'
    ) {
      return response.status(400).json({ error: 'Payment has not been confirmed' })
    }

    const order = await markOrderPaid(request.params.reference, paystack.data)
    if (!order) return response.status(404).json({ error: 'Order not found' })
    return response.json(order)
  } catch (error) {
    console.error('Unable to verify payment:', error)
    return response.status(500).json({ error: 'Unable to verify payment' })
  }
})

app.get('/api/account/orders', requireUser, async (request, response) => {
  if (!supabase) return response.status(503).json({ error: 'Supabase is not configured' })

  try {
    if (!(await ordersTableReady())) {
      return response.status(503).json({ error: 'Supabase orders table is not ready' })
    }
    const { data, error } = await supabase
      .from('orders')
      .select('order_id, customer, items, subtotal, delivery_fee, total, status, payment_status, created_at')
      .eq('user_id', request.user.id)
      .order('created_at', { ascending: false })
    if (error) throw error

    return response.json({ orders: data.map(mapOrder) })
  } catch (error) {
    console.error('Unable to retrieve customer orders:', error)
    return response.status(500).json({ error: 'Unable to retrieve your orders' })
  }
})

const orderStatuses = new Set([
  'new',
  'preparing',
  'ready',
  'out_for_delivery',
  'completed',
  'cancelled',
])

app.post('/api/admin/orders/verify', requireUser, requireAdmin, async (request, response) => {
  const orderId = typeof request.body?.orderId === 'string'
    ? request.body.orderId.trim().toUpperCase()
    : ''
  if (!orderId || orderId.length > 100) {
    return response.status(400).json({ error: 'Enter the order code provided by the customer' })
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('order_id, customer, items, subtotal, delivery_fee, total, status, payment_status, created_at')
      .eq('order_id', orderId)
      .maybeSingle()
    if (error) throw error
    if (!data) return response.status(404).json({ error: 'No order matches that code' })

    const canDeliver = data.payment_status === 'paid'
    return response.json({
      order: mapOrder(data),
      canDeliver,
      verificationToken: canDeliver
        ? createDeliveryVerificationToken(data.order_id, request.user.id)
        : null,
    })
  } catch (error) {
    console.error('Unable to verify delivery order:', error)
    return response.status(500).json({ error: 'Unable to verify this order' })
  }
})

app.get('/api/admin/orders', requireUser, requireAdmin, async (_request, response) => {
  try {
    if (!(await ordersTableReady())) {
      return response.status(503).json({ error: 'Supabase orders table is not ready' })
    }
    const { data, error } = await supabase
      .from('orders')
      .select('order_id, customer, items, subtotal, delivery_fee, total, status, payment_status, created_at')
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    return response.json({ orders: data.map(mapOrder) })
  } catch (error) {
    console.error('Unable to retrieve admin orders:', error)
    return response.status(500).json({ error: 'Unable to retrieve orders' })
  }
})

app.patch('/api/admin/orders/:orderId/status', requireUser, requireAdmin, async (request, response) => {
  const status = request.body?.status
  if (!orderStatuses.has(status)) {
    return response.status(400).json({ error: 'Choose a valid order status' })
  }

  try {
    const orderId = request.params.orderId.trim().toUpperCase()
    if (status === 'out_for_delivery' && !isValidDeliveryVerificationToken(
      request.body?.verificationToken,
      orderId,
      request.user.id,
    )) {
      return response.status(403).json({ error: 'Verify the customer order code before sending it out for delivery' })
    }

    const { data: current, error: currentError } = await supabase
      .from('orders')
      .select('order_id, payment_status, status')
      .eq('order_id', orderId)
      .maybeSingle()
    if (currentError) throw currentError
    if (!current) return response.status(404).json({ error: 'Order not found' })
    if (['preparing', 'ready', 'out_for_delivery', 'completed'].includes(status) && current.payment_status !== 'paid') {
      return response.status(409).json({ error: 'Payment must be confirmed before fulfilling this order' })
    }
    if (status === 'completed' && current.status !== 'out_for_delivery') {
      return response.status(409).json({ error: 'An order must be out for delivery before it can be completed' })
    }

    const { data, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('order_id', orderId)
      .eq('payment_status', current.payment_status)
      .eq('status', current.status)
      .select('order_id, customer, items, subtotal, delivery_fee, total, status, payment_status, created_at')
      .maybeSingle()
    if (error) throw error
    if (!data) return response.status(404).json({ error: 'Order not found' })
    return response.json({ order: mapOrder(data) })
  } catch (error) {
    console.error('Unable to update order status:', error)
    return response.status(500).json({ error: 'Unable to update order status' })
  }
})

app.get('/api/health', async (_request, response) => {
  let supabaseReady = false
  if (supabase) {
    try {
      supabaseReady = await ordersTableReady()
    } catch (error) {
      console.error('Unable to check Supabase:', error)
    }
  }

  response.json({
    ok: true,
    supabase: supabaseReady,
    supabaseConfigured: Boolean(supabase),
    paystack: Boolean(process.env.PAYSTACK_SECRET_KEY),
    email: isEmailConfigured(),
  })
})

app.listen(port, () => console.log(`DMK API listening on http://localhost:${port}`))
