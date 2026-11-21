import type { CartItem, CustomerDetails, Order } from '../types'

export interface TrackedOrder {
  orderId: string
  status: string
  paymentStatus: Order['paymentStatus']
  total: number
  createdAt: string
}

async function getError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null)
  return new Error(typeof body?.error === 'string' ? body.error : fallback)
}

export async function initializeOrder(order: Order): Promise<{ authorizationUrl: string; reference: string; orderId: string }> {
  const response = await fetch('/api/payments/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })

  if (!response.ok) throw await getError(response, 'Unable to start payment')

  return response.json()
}

export async function verifyOrder(reference: string): Promise<Order> {
  const response = await fetch(`/api/payments/verify/${encodeURIComponent(reference)}`)

  if (!response.ok) throw await getError(response, 'Unable to verify payment')

  return response.json()
}

export async function trackOrder(orderId: string): Promise<TrackedOrder> {
  const response = await fetch(`/api/orders/${encodeURIComponent(orderId)}`)

  if (!response.ok) throw await getError(response, 'Unable to find order')

  return response.json()
}

export async function createLocalDemoOrder(
  customer: CustomerDetails,
  items: CartItem[],
  deliveryFee: number,
): Promise<Order> {
  const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  return {
    orderId: `DMK-${new Date().toISOString().slice(0, 10).replaceAll('-', '')}-0042`,
    customer,
    items,
    subtotal,
    deliveryFee,
    total: subtotal + deliveryFee,
    paymentStatus: 'pending',
  }
}
