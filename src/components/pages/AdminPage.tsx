import { useEffect, useMemo, useState, type FormEvent } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { OrderStatus, Screen } from '../../types'
import {
  getAdminOrders,
  updateOrderStatus,
  verifyAdminOrder,
  type AccountOrder,
} from '../../services/orders'
import { BrandLogo } from '../BrandLogo'
import { Header } from '../Header'
import { ScreenLink } from '../ScreenLink'
import { pageContentClass, screenClass } from '../../styles/classes'
import { publicErrorMessage } from '../../lib/errors'

const statuses: OrderStatus[] = ['new', 'preparing', 'ready', 'out_for_delivery', 'completed', 'cancelled']
const money = (amount: number) => `₦${amount.toLocaleString()}`
const prettyStatus = (status: string) => status.replaceAll('_', ' ')
const today = () => new Date().toLocaleDateString()

function statusStyle(status: string) {
  if (status === 'completed') return 'bg-emerald-50 text-emerald-700 ring-emerald-200'
  if (status === 'cancelled') return 'bg-red-50 text-red-700 ring-red-200'
  if (status === 'out_for_delivery' || status === 'ready') return 'bg-blue-50 text-blue-700 ring-blue-200'
  return 'bg-amber-50 text-amber-800 ring-amber-200'
}

export function AdminPage({
  session,
  onNavigate,
}: {
  session: Session | null
  onNavigate: (screen: Screen) => void
}) {
  const [orders, setOrders] = useState<AccountOrder[]>([])
  const [loadedFor, setLoadedFor] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)
  const [busyOrder, setBusyOrder] = useState('')
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all')
  const [overviewFilter, setOverviewFilter] = useState<'all' | 'today' | 'attention' | 'active' | 'paid'>('all')
  const [orderCode, setOrderCode] = useState('')
  const [verifiedOrder, setVerifiedOrder] = useState<AccountOrder | null>(null)
  const [verificationToken, setVerificationToken] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState('')
  const isLoading = Boolean(session && loadedFor !== session.access_token)
  const currentDate = today()

  useEffect(() => {
    let active = true
    if (!session) return () => { active = false }

    getAdminOrders(session.access_token)
      .then((result) => {
        if (active) {
          setOrders(result)
          setLoadedFor(session.access_token)
          setError('')
          setRefreshing(false)
        }
      })
      .catch((requestError: unknown) => {
        if (active) {
          setLoadedFor(session.access_token)
          setError(publicErrorMessage(requestError, 'Unable to load orders.'))
          setRefreshing(false)
        }
      })
    return () => { active = false }
  }, [session, refreshKey])

  const filteredOrders = useMemo(() => {
    const term = search.trim().toLowerCase()
    return orders.filter((order) => {
      const matchesStatus = statusFilter === 'all' || (order.status ?? 'new') === statusFilter
      const matchesOverview = overviewFilter === 'all' ||
        (overviewFilter === 'today' && order.createdAt && new Date(order.createdAt).toLocaleDateString() === currentDate) ||
        (overviewFilter === 'attention' && order.status === 'new' && order.paymentStatus === 'paid') ||
        (overviewFilter === 'active' && order.paymentStatus === 'paid' && !['completed', 'cancelled'].includes(order.status ?? 'new')) ||
        (overviewFilter === 'paid' && order.paymentStatus === 'paid')
      const matchesSearch = !term || [
        order.orderId,
        order.customer.fullName,
        order.customer.phone,
        order.customer.email,
      ].some((value) => value?.toLowerCase().includes(term))
      return matchesStatus && matchesOverview && matchesSearch
    })
  }, [orders, search, statusFilter, overviewFilter, currentDate])

  const todayOrders = orders.filter((order) => order.createdAt && new Date(order.createdAt).toLocaleDateString() === currentDate).length
  const activeOrders = orders.filter((order) => order.paymentStatus === 'paid' && !['completed', 'cancelled'].includes(order.status ?? 'new')).length
  const paidRevenue = orders
    .filter((order) => order.paymentStatus === 'paid')
    .reduce((total, order) => total + order.total, 0)
  const needsAttention = orders.filter((order) => order.status === 'new' && order.paymentStatus === 'paid').length

  const openOverview = (filter: typeof overviewFilter) => {
    setOverviewFilter((current) => current === filter ? 'all' : filter)
    setSearch('')
    setStatusFilter('all')
    document.getElementById('admin-orders')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const verifyCode = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!session) return
    setVerifying(true)
    setVerificationError('')
    setVerifiedOrder(null)
    setVerificationToken(null)
    try {
      const result = await verifyAdminOrder(orderCode, session.access_token)
      setVerifiedOrder(result.order)
      setVerificationToken(result.verificationToken)
      setOrders((current) => current.map((order) => order.orderId === result.order.orderId ? result.order : order))
    } catch (requestError) {
      setVerificationError(publicErrorMessage(requestError, 'Unable to verify this order.'))
    } finally {
      setVerifying(false)
    }
  }

  const changeStatus = async (orderId: string, status: OrderStatus) => {
    if (!session) return
    setBusyOrder(orderId)
    setError('')
    try {
      const updated = await updateOrderStatus(
        orderId,
        status,
        session.access_token,
        verifiedOrder?.orderId === orderId ? verificationToken ?? undefined : undefined,
      )
      setOrders((current) => current.map((order) => order.orderId === orderId ? updated : order))
      if (verifiedOrder?.orderId === orderId) setVerifiedOrder(updated)
      if (status === 'out_for_delivery') setVerificationToken(null)
    } catch (requestError) {
      setError(publicErrorMessage(requestError, 'Unable to update order.'))
      if (status === 'out_for_delivery') setVerificationToken(null)
    } finally {
      setBusyOrder('')
    }
  }

  const refreshOrders = () => {
    if (!session || refreshing) return
    setRefreshing(true)
    setRefreshKey((current) => current + 1)
  }

  return (
    <div className={`${screenClass} pb-2`}>
      <Header title="DMK Operations" backTarget="track" onNavigate={onNavigate} rightAction="none" />
      <div className={`${pageContentClass} px-4 pb-8 pt-4 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[1280px] min-[700px]:px-8 min-[700px]:py-7`}>
        {!session ? (
          <section className="mx-auto max-w-xl rounded-3xl border border-[#eee5dd] bg-white p-7 text-center shadow-sm">
            <div className="mx-auto grid h-14 w-14 place-items-center overflow-hidden rounded-2xl bg-white p-2 shadow-sm">
              <BrandLogo className="h-full w-full object-contain" />
            </div>
            <h2 className="mt-4 text-xl font-bold">Staff access required</h2>
            <p className="mt-2 text-sm text-[#77706a]">Sign in with an approved admin account to manage orders.</p>
            <ScreenLink to="admin-login" onNavigate={onNavigate} className="mt-5 inline-flex min-h-11 items-center rounded-full bg-[#ff701a] px-5 text-sm font-bold text-white">
              Admin sign in
            </ScreenLink>
          </section>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-[26px] bg-[#30231c] px-5 py-6 text-white shadow-[0_16px_38px_rgba(48,35,28,0.16)] min-[700px]:px-8 min-[700px]:py-8">
              <div className="pointer-events-none absolute -right-10 -top-20 h-56 w-56 rounded-full bg-[#ff791c]/20 blur-3xl" />
              <div className="relative flex flex-wrap items-end justify-between gap-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#ffbe8e]">De_Mayor Kitchen · Staff</p>
                  <h1 className="mt-2 text-2xl font-extrabold tracking-tight min-[700px]:text-3xl">Orders & fulfilment</h1>
                  <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/65">Keep an eye on incoming orders, verify customer codes, and manage delivery progress.</p>
                </div>
                <button
                  type="button"
                  onClick={refreshOrders}
                  disabled={refreshing || isLoading}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 text-sm font-semibold text-white transition hover:bg-white/15 disabled:opacity-60"
                >
                  <span className={refreshing || isLoading ? 'animate-spin' : ''} aria-hidden="true">↻</span>
                  {refreshing || isLoading ? 'Updating…' : 'Refresh orders'}
                </button>
              </div>
            </section>

            {error && (
              <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </p>
            )}

            <section aria-label="Order overview" className="mt-5 grid grid-cols-2 gap-3 min-[900px]:grid-cols-4">
              <MetricCard label="Orders today" value={todayOrders} icon="◷" detail="Received today" onClick={() => openOverview('today')} active={overviewFilter === 'today'} />
              <MetricCard label="Needs attention" value={needsAttention} icon="✳" detail="Paid · not started" accent onClick={() => openOverview('attention')} active={overviewFilter === 'attention'} />
              <MetricCard label="Active orders" value={activeOrders} icon="↗" detail="Paid · being fulfilled" onClick={() => openOverview('active')} active={overviewFilter === 'active'} />
              <MetricCard label="Paid revenue" value={money(paidRevenue)} icon="₦" detail="Recent 200 orders" onClick={() => openOverview('paid')} active={overviewFilter === 'paid'} />
            </section>

            <section className="mt-5 rounded-2xl border border-[#f1dfd0] bg-gradient-to-br from-[#fff8f1] to-white p-4 shadow-[0_5px_18px_rgba(74,49,32,0.04)] min-[700px]:p-5">
              <div className="mb-4 flex items-start gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#ffeadb] text-lg text-[#e9550b]" aria-hidden="true">✓</span>
                <div>
                  <h2 className="font-bold">Verify a customer’s order code</h2>
                  <p className="mt-1 text-sm leading-relaxed text-[#77706a]">Ask the customer for the Order ID shown on their confirmation or account. Verify it before handing the order to a courier.</p>
                </div>
              </div>
              <form onSubmit={(event) => void verifyCode(event)} className="flex flex-col gap-2 min-[700px]:flex-row">
                <label className="sr-only" htmlFor="delivery-order-code">Customer order code</label>
                <input
                  id="delivery-order-code"
                  value={orderCode}
                  onChange={(event) => {
                    setOrderCode(event.target.value)
                    setVerifiedOrder(null)
                    setVerificationToken(null)
                    setVerificationError('')
                  }}
                  placeholder="e.g. DMK-1732190400000-a1b2c3"
                  autoCapitalize="characters"
                  autoComplete="off"
                  required
                  className="box-border h-12 min-h-12 w-full shrink-0 rounded-xl border border-[#e8d9cd] bg-white px-4 font-mono text-base leading-normal tracking-wide outline-none transition placeholder:font-sans placeholder:tracking-normal focus:border-[#f07830] focus:ring-4 focus:ring-[#ff791c]/10 min-[700px]:min-w-0 min-[700px]:flex-1 min-[700px]:text-sm"
                />
                <button type="submit" disabled={verifying} className="inline-flex h-12 min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-xl bg-[#e95c13] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[#d9500c] disabled:opacity-60 min-[700px]:w-auto min-[700px]:min-w-40">
                  {verifying ? 'Checking code…' : 'Verify code'}
                </button>
              </form>
              {verificationError && <p role="alert" className="mt-3 text-sm font-medium text-red-700">{verificationError}</p>}
              {verifiedOrder && (
                <div role="status" className={`mt-4 rounded-xl border p-4 ${verificationToken ? 'border-emerald-200 bg-emerald-50/80' : 'border-amber-200 bg-amber-50/80'}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-lg font-bold ${verificationToken ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'}`} aria-hidden="true">
                        {verificationToken ? '✓' : '!'}
                      </span>
                      <div>
                        <p className={`font-bold ${verificationToken ? 'text-emerald-900' : 'text-amber-900'}`}>
                          {verificationToken ? 'Code verified · payment confirmed' : 'Order found · payment not confirmed'}
                        </p>
                        <p className="mt-1 break-all font-mono text-xs text-[#514740]">{verifiedOrder.orderId}</p>
                        <p className="mt-2 text-sm text-[#514740]">
                          {verifiedOrder.customer.fullName} · {verifiedOrder.customer.phone}
                        </p>
                      </div>
                    </div>
                    <strong className="pl-12 text-lg">{money(verifiedOrder.total)}</strong>
                  </div>
                  <div className="mt-3 grid gap-2 border-t border-black/10 pt-3 text-sm min-[700px]:grid-cols-2">
                    <p><span className="font-semibold">Items:</span> {verifiedOrder.items.map((item) => `${item.quantity} × ${item.name}`).join(', ') || 'No items listed'}</p>
                    <p><span className="font-semibold">Delivery:</span> {verifiedOrder.customer.address || 'Address not provided'}</p>
                  </div>
                  {!verificationToken && <p className="mt-3 text-sm font-semibold text-amber-900">Do not hand over this order until payment is confirmed in the system.</p>}
                </div>
              )}
            </section>

            <section id="admin-orders" className="mt-7 scroll-mt-4">
              <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.13em] text-[#e9550b]">Kitchen queue</p>
                  <h2 className="mt-1 text-xl font-bold">Recent orders <span className="text-sm font-medium text-[#8b7c72]">({orders.length})</span></h2>
                </div>
                <span className="text-xs text-[#8b7c72]">Showing up to 200 most recent</span>
              </div>
              <div className="mb-4 grid gap-2 min-[700px]:grid-cols-[minmax(240px,1fr)_220px]">
                <label className="relative block">
                  <span className="sr-only">Search orders</span>
                  <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#8b7c72]" aria-hidden="true">⌕</span>
                  <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search ID, customer, phone or email" className="h-11 w-full rounded-xl border border-[#e9e0d9] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#f07830] focus:ring-4 focus:ring-[#ff791c]/10" />
                </label>
                <label>
                  <span className="sr-only">Filter by status</span>
                  <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as 'all' | OrderStatus)} className="h-11 w-full rounded-xl border border-[#e9e0d9] bg-white px-3 text-sm capitalize outline-none focus:border-[#f07830]">
                    <option value="all">All order statuses</option>
                    {statuses.map((status) => <option key={status} value={status}>{prettyStatus(status)}</option>)}
                  </select>
                </label>
              </div>

              {isLoading ? (
                <div role="status" className="rounded-2xl border border-[#eee5dd] bg-white p-6 text-sm text-[#77706a]">Loading recent orders…</div>
              ) : filteredOrders.length ? (
                <div className="grid gap-3 min-[1000px]:grid-cols-2">
                  {filteredOrders.map((order) => {
                    const isVerified = verifiedOrder?.orderId === order.orderId && Boolean(verificationToken)
                    return (
                      <article key={order.orderId} className="overflow-hidden rounded-2xl border border-[#ece3dc] bg-white shadow-[0_4px_16px_rgba(74,49,32,0.045)]">
                        <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f1eae4] px-4 py-4 min-[700px]:px-5">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="break-all font-mono text-sm font-bold text-[#30231c]">{order.orderId}</h3>
                              {isVerified && <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">Code verified</span>}
                            </div>
                            <p className="mt-1 text-xs text-[#8b7c72]">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'Date unavailable'}</p>
                          </div>
                          <span className={`rounded-full px-3 py-1.5 text-xs font-bold capitalize ring-1 ring-inset ${statusStyle(order.status ?? 'new')}`}>
                            {prettyStatus(order.status ?? 'new')}
                          </span>
                        </div>
                        <div className="px-4 py-4 min-[700px]:px-5">
                          <div className="flex flex-wrap items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold">{order.customer.fullName}</p>
                              <a href={`tel:${order.customer.phone}`} className="mt-1 inline-block text-sm font-medium text-[#a94817] underline underline-offset-2">{order.customer.phone || 'No phone provided'}</a>
                              <p className="mt-1 break-all text-xs text-[#77706a]">{order.customer.email}</p>
                            </div>
                            <div className="text-right">
                              <strong className="text-lg">{money(order.total)}</strong>
                              <p className={`mt-1 text-xs font-bold uppercase tracking-wide ${order.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>{order.paymentStatus} payment</p>
                            </div>
                          </div>
                          <div className="mt-3 rounded-xl bg-[#faf7f4] px-3 py-3">
                            <ul className="space-y-1.5 text-sm">
                              {order.items.map((item) => (
                                <li key={item.id} className="flex justify-between gap-3">
                                  <span className="min-w-0">{item.quantity} × {item.name}</span>
                                  <span className="shrink-0 font-medium">{money(item.quantity * item.unitPrice)}</span>
                                </li>
                              ))}
                            </ul>
                            <p className="mt-2 border-t border-[#eae2dc] pt-2 text-xs leading-relaxed text-[#71655e]">
                              <span className="font-bold text-[#50453e]">{order.customer.address || 'No delivery address provided'}</span>
                              {order.customer.deliveryDate && <span> · {order.customer.deliveryDate}</span>}
                              {order.customer.specialInstructions && <span className="block mt-1">Note: {order.customer.specialInstructions}</span>}
                            </p>
                          </div>
                          <label className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold">
                            Update status
                            <select
                              value={(order.status ?? 'new') as OrderStatus}
                              disabled={busyOrder === order.orderId}
                              onChange={(event) => void changeStatus(order.orderId, event.target.value as OrderStatus)}
                              className="min-h-10 flex-1 rounded-lg border border-[#e7e1dc] bg-white px-3 capitalize disabled:opacity-60"
                            >
                              {statuses.map((status) => {
                                const paid = order.paymentStatus === 'paid'
                                const disabled =
                                  (['preparing', 'ready', 'out_for_delivery', 'completed'].includes(status) && !paid) ||
                                  (status === 'out_for_delivery' && !isVerified) ||
                                  (status === 'completed' && order.status !== 'out_for_delivery')
                                return <option key={status} value={status} disabled={disabled}>{prettyStatus(status)}{status === 'out_for_delivery' && !isVerified ? ' · verify code first' : ''}</option>
                              })}
                            </select>
                            {busyOrder === order.orderId && <span className="text-xs font-normal text-[#77706a]">Saving…</span>}
                          </label>
                          {order.status !== 'out_for_delivery' && order.paymentStatus === 'paid' && !isVerified && (
                            <p className="mt-2 text-xs text-[#8b7c72]">Verify this customer’s code before setting “Out for delivery”.</p>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-[#dfd3ca] bg-white px-5 py-10 text-center">
                  <span className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#fff0e7] text-xl text-[#e9550b]" aria-hidden="true">▤</span>
                  <h3 className="mt-3 font-bold">{orders.length ? 'No matching orders' : 'No orders to show yet'}</h3>
                  <p className="mt-1 text-sm text-[#77706a]">{orders.length ? 'Try another search or status filter.' : 'New customer orders will appear here.'}</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  )
}

function MetricCard({
  label,
  value,
  icon,
  detail,
  accent = false,
  active = false,
  onClick,
}: {
  label: string
  value: string | number
  icon: string
  detail: string
  accent?: boolean
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-2xl border p-4 text-left shadow-[0_4px_16px_rgba(74,49,32,0.04)] transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9550b] min-[700px]:p-5 ${active ? 'border-[#e9550b] ring-2 ring-[#ff791c]/20' : accent ? 'border-[#f4d0b9] bg-[#fff8f1]' : 'border-[#ece3dc] bg-white'}`}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-semibold text-[#77706a] min-[700px]:text-sm">{label}</p>
        <span className={`grid h-8 w-8 place-items-center rounded-lg text-sm font-bold ${accent ? 'bg-[#ffeadb] text-[#e9550b]' : 'bg-[#f5f0ec] text-[#66574d]'}`} aria-hidden="true">{icon}</span>
      </div>
      <strong className="mt-3 block truncate text-xl font-extrabold tracking-tight min-[700px]:text-2xl">{value}</strong>
      <span className="mt-1 block text-[11px] text-[#8b7c72]">{detail}</span>
    </button>
  )
}
