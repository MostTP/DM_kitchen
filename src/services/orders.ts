import type { CustomerDetails, Order } from '../types'

export async function initializeOrder(order: Order): Promise<{ authorizationUrl: string; reference: string }> {
  const response = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })

  if (!response.ok) {
    throw new Error('Unable to start payment')
  }

  return response.json()
}

export async function verifyOrder(reference: string): Promise<Order> {
  const response = await fetch(`/api/payments/verify/${encodeURIComponent(reference)}`)

  if (!response.ok) {
    throw new Error('Unable to verify payment')
  }

  return response.json()
}

export async function trackOrder(orderId: string): Promise<Order> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`)

  if (!response.ok) {
    throw new Error('Order not found')
  }

  return response.json()
}

export async function createLocalDemoOrder(customer: CustomerDetails): Promise<Order> {
  return {
    orderId: `DMK-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-0042`,
    customer,
    items: [],
    subtotal: 54000,
    deliveryFee: 1000,
    total: 55000,
    paymentStatus: 'pending',
  }
}
