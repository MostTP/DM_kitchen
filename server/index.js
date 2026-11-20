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
const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null

app.use(cors({ origin: process.env.APP_ORIGIN || 'http://localhost:5173' }))

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

app.post('/api/payments/initialize', async (request, response) => {
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
  if (
    !order?.customer?.email ||
    !Number.isFinite(total) ||
    total <= 0 ||
    !Number.isSafeInteger(Math.round(total * 100))
  ) {
    return response.status(400).json({ error: 'A customer email and valid order total are required' })
  }

  try {
    const orderId = `DMK-${Date.now()}-${crypto.randomBytes(3).toString('hex')}`
    const { response: paystackResponse, result: paystack } = await getPaystackResponse(
      '/transaction/initialize',
      {
        method: 'POST',
        body: JSON.stringify({
          email: order.customer.email,
          amount: Math.round(total * 100),
          reference: orderId,
          currency: 'NGN',
          callback_url: process.env.PAYSTACK_CALLBACK_URL,
          metadata: { order_id: orderId, customer_name: order.customer.fullName },
        }),
      },
    )

    if (!paystackResponse.ok || !paystack.status) {
      return response.status(502).json({ error: paystack.message || 'Paystack initialization failed' })
    }

    const storedOrder = {
      ...order,
      orderId,
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

app.get('/api/payments/verify/:reference', async (request, response) => {
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

app.get('/api/orders/:orderId', async (request, response) => {
  if (!supabase) return response.status(503).json({ error: 'Supabase is not configured' })

  try {
    if (!(await ordersTableReady())) {
      return response.status(503).json({ error: 'Supabase orders table is not ready' })
    }
    const { data, error } = await supabase
      .from('orders')
      .select('order_id, status, payment_status, total, created_at')
      .eq('order_id', request.params.orderId)
      .maybeSingle()
    if (error) throw error
    if (!data) return response.status(404).json({ error: 'Order not found' })

    return response.json({
      orderId: data.order_id,
      status: data.status,
      paymentStatus: data.payment_status,
      total: data.total,
      createdAt: data.created_at,
    })
  } catch (error) {
    console.error('Unable to retrieve order:', error)
    return response.status(500).json({ error: 'Unable to retrieve order' })
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
