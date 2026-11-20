import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import crypto from 'node:crypto'
import nodemailer from 'nodemailer'
import { createClient } from '@supabase/supabase-js'

const app = express()
const port = Number(process.env.PORT || 8787)

app.use(cors({ origin: process.env.APP_ORIGIN || 'http://localhost:5173' }))
app.use(express.json({ limit: '1mb' }))

const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
  : null

function createTransporter() {
  if (!process.env.SMTP_HOST) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true',
    auth: process.env.SMTP_USER ? {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    } : undefined,
  })
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
  if (!supabase) return
  const { error } = await supabase.from('orders').upsert({
    order_id: order.orderId,
    customer: order.customer,
    items: order.items,
    subtotal: order.subtotal,
    delivery_fee: order.deliveryFee,
    total: order.total,
    payment_status: order.paymentStatus,
    paystack_reference: order.reference || null,
  }, { onConflict: 'order_id' })
  if (error) throw error
}

app.post('/api/payments/initialize', async (request, response) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return response.status(503).json({ error: 'Paystack is not configured' })
    }

    const order = request.body
    if (!order?.customer?.email || !order?.total) {
      return response.status(400).json({ error: 'Customer and order total are required' })
    }

    const orderId = order.orderId || `DMK-${Date.now()}`
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: order.customer.email,
        amount: Math.round(order.total * 100),
        reference: orderId,
        currency: 'NGN',
        callback_url: process.env.PAYSTACK_CALLBACK_URL,
        metadata: { order_id: orderId, customer_name: order.customer.fullName },
      }),
    })

    const paystack = await paystackResponse.json()
    if (!paystack.status) {
      return response.status(400).json({ error: paystack.message || 'Paystack initialization failed' })
    }

    const storedOrder = { ...order, orderId, reference: paystack.data.reference, paymentStatus: 'pending' }
    await saveOrder(storedOrder)

    return response.json({
      authorizationUrl: paystack.data.authorization_url,
      reference: paystack.data.reference,
      orderId,
    })
  } catch (error) {
    console.error(error)
    return response.status(500).json({ error: 'Unable to initialize payment' })
  }
})

app.get('/api/payments/verify/:reference', async (request, response) => {
  try {
    if (!process.env.PAYSTACK_SECRET_KEY) {
      return response.status(503).json({ error: 'Paystack is not configured' })
    }

    const paystackResponse = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(request.params.reference)}`, {
      headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` },
    })
    const paystack = await paystackResponse.json()

    if (!paystack.status || paystack.data?.status !== 'success') {
      return response.status(400).json({ error: 'Payment has not been confirmed' })
    }

    if (supabase) {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .eq('paystack_reference', request.params.reference)
        .maybeSingle()
      if (error) throw error

      if (data) {
        await supabase.from('orders').update({ payment_status: 'paid', paid_at: new Date().toISOString() }).eq('order_id', data.order_id)
        const order = {
          orderId: data.order_id,
          customer: data.customer,
          items: data.items,
          subtotal: data.subtotal,
          deliveryFee: data.delivery_fee,
          total: data.total,
          paymentStatus: 'paid',
        }
        await sendConfirmation(order)
        return response.json(order)
      }
    }

    return response.status(404).json({ error: 'Order not found' })
  } catch (error) {
    console.error(error)
    return response.status(500).json({ error: 'Unable to verify payment' })
  }
})

app.post('/api/paystack/webhook', express.raw({ type: '*/*' }), async (request, response) => {
  const signature = request.headers['x-paystack-signature']
  if (process.env.PAYSTACK_SECRET_KEY) {
    const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY).update(request.body).digest('hex')
    if (signature !== expected) return response.sendStatus(401)
  }

  const event = JSON.parse(request.body.toString())
  if (event.event === 'charge.success' && supabase) {
    const reference = event.data?.reference
    const { data, error } = await supabase.from('orders').select('*').eq('paystack_reference', reference).maybeSingle()
    if (!error && data) {
      await supabase.from('orders').update({ payment_status: 'paid', paid_at: new Date().toISOString() }).eq('order_id', data.order_id)
      await sendConfirmation({ orderId: data.order_id, customer: data.customer, items: data.items, subtotal: data.subtotal, deliveryFee: data.delivery_fee, total: data.total, paymentStatus: 'paid' })
    }
  }

  return response.sendStatus(200)
})

app.get('/api/orders/:orderId', async (request, response) => {
  if (!supabase) return response.status(503).json({ error: 'Supabase is not configured' })
  const { data, error } = await supabase.from('orders').select('*').eq('order_id', request.params.orderId).maybeSingle()
  if (error) return response.status(500).json({ error: 'Unable to retrieve order' })
  if (!data) return response.status(404).json({ error: 'Order not found' })

  return response.json({
    orderId: data.order_id,
    customer: data.customer,
    items: data.items,
    subtotal: data.subtotal,
    deliveryFee: data.delivery_fee,
    total: data.total,
    paymentStatus: data.payment_status,
  })
})

app.get('/api/health', (_request, response) => {
  response.json({
    ok: true,
    supabase: Boolean(supabase),
    paystack: Boolean(process.env.PAYSTACK_SECRET_KEY),
    email: Boolean(process.env.SMTP_HOST),
  })
})

app.listen(port, () => console.log(`DMK API listening on http://localhost:${port}`))
