import type { CartItem, CustomerDetails, Order, OrderStatus } from '../types'
import { PublicError } from '../lib/errors'

export type AccountOrder = Pick<
  Order,
  'orderId' | 'customer' | 'items' | 'subtotal' | 'deliveryFee' | 'total' | 'paymentStatus' | 'status' | 'createdAt'
>

async function getError(response: Response, fallback: string) {
  const body = await response.json().catch(() => null)
  if (response.status >= 500) return new PublicError(fallback)
  const safeMessage = typeof body?.error === 'string' ? body.error : ''
  return new PublicError(safeMessage || fallback)
}

async function fetchApi(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    return await fetch(input, init)
  } catch (error) {
    if (error instanceof TypeError) {
      throw new PublicError(
        "We couldn't connect just now. Please try again in a moment.",
        { cause: error },
      )
    }
    throw error
  }
}

export async function initializeOrder(order: Order, accessToken: string): Promise<{ authorizationUrl: string; reference: string; orderId: string }> {
  const response = await fetchApi('/api/payments/initialize', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify(order),
  })

  if (!response.ok) throw await getError(response, 'Unable to start payment')

  return response.json()
}

export async function verifyOrder(reference: string, accessToken: string): Promise<Order> {
  const response = await fetchApi(`/api/payments/verify/${encodeURIComponent(reference)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw await getError(response, 'Unable to verify payment')

  return response.json()
}

export async function getAccountOrders(accessToken: string): Promise<{ orders: AccountOrder[] }> {
  const response = await fetchApi('/api/account/orders', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!response.ok) throw await getError(response, 'Unable to load your orders')

  return response.json()
}

export async function getAdminOrders(accessToken: string): Promise<AccountOrder[]> {
  const response = await fetchApi('/api/admin/orders', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (response.status === 403) {
    throw new PublicError('This account is not authorized for admin access.')
  }
  if (!response.ok) throw await getError(response, 'Unable to load admin orders')
  const result: { orders: AccountOrder[] } = await response.json()
  return result.orders
}

export async function verifyAdminOrder(
  orderId: string,
  accessToken: string,
): Promise<{ order: AccountOrder; canDeliver: boolean; verificationToken: string | null }> {
  const response = await fetchApi('/api/admin/orders/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ orderId }),
  })
  if (!response.ok) throw await getError(response, 'Unable to verify this order')
  return response.json()
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus,
  accessToken: string,
  verificationToken?: string,
): Promise<AccountOrder> {
  const response = await fetchApi(`/api/admin/orders/${encodeURIComponent(orderId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ status, verificationToken }),
  })
  if (!response.ok) throw await getError(response, 'Unable to update order status')
  const result: { order: AccountOrder } = await response.json()
  return result.order
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
