import { useState } from 'react'
import type { Screen } from '../../types'
import { BottomNav } from '../BottomNav'
import { Header } from '../Header'
import { Icon } from '../Icon'
import { trackOrder, type TrackedOrder } from '../../services/orders'
import { screenClass } from '../../styles/classes'

export function TrackPage({ screen, onNavigate }: { screen: Screen; onNavigate: (screen: Screen) => void }) {
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState<TrackedOrder | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!orderId.trim()) {
      setError('Enter your order ID to track it.')
      return
    }

    setLoading(true)
    setError('')
    try {
      setOrder(await trackOrder(orderId.trim()))
    } catch (requestError) {
      setOrder(null)
      setError(requestError instanceof Error ? requestError.message : 'Unable to find order.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${screenClass} pb-[54px]`}>
      <Header title="Track Your Order" onNavigate={onNavigate} rightAction="none" />
      <div className="mx-[10px] mt-[7px] flex h-[31px] min-[700px]:mx-auto min-[700px]:mt-[22px] min-[700px]:max-w-[1124px] min-[700px]:h-[52px]">
        <input
          className="min-w-0 flex-1 rounded-l-full border border-[#e5ddd6] bg-white px-[10px] text-[8px] text-[#332821] placeholder:text-[#aaa] min-[700px]:px-[14px] min-[700px]:text-xs"
          value={orderId}
          onChange={(event) => setOrderId(event.target.value)}
          onKeyDown={(event) => event.key === 'Enter' && (event.preventDefault(), void handleSearch())}
          placeholder="Enter your order ID"
          aria-label="Order ID"
        />
        <button
          className="grid w-[34px] place-items-center rounded-r-full border border-l-0 border-[#e5ddd6] bg-white text-[#332821] disabled:opacity-50"
          onClick={() => void handleSearch()}
          disabled={loading}
          aria-label="Search order"
        >
          <Icon name="search" size={16} />
        </button>
      </div>
      {error && <p role="alert" className="mx-[10px] mt-1 text-[9px] text-red-700">{error}</p>}
      <div className="mx-[10px] mb-[9px] mt-[11px] min-[700px]:mx-auto min-[700px]:my-[42px] min-[700px]:max-w-[780px]">
        <div className="relative grid grid-cols-4 before:absolute before:left-[8%] before:right-[8%] before:top-[13px] before:h-[2px] before:bg-[linear-gradient(90deg,#ff6b12_0_64%,#eee8e2_64%)]">
          {[1, 2, 3, 4].map((step) => (
            <span key={step} className="z-[1] mx-auto grid h-[27px] w-[27px] place-items-center rounded-full bg-[#fff1e8]">
              <b className={`grid h-[19px] w-[19px] place-items-center rounded-full text-[9px] text-white ${step <= (order?.paymentStatus === 'paid' ? 3 : 1) ? 'bg-[#ff6b12]' : 'border border-[#ddd4cd] bg-[#f7f3ef]'}`}>{step <= (order?.paymentStatus === 'paid' ? 3 : 1) ? '✓' : ''}</b>
            </span>
          ))}
        </div>
        <div className="mt-[3px] grid grid-cols-4 text-center text-[6px] leading-[1.15]">
          <strong>Order<br />Received</strong><strong>Payment<br />Confirmed</strong><strong>Preparing<br />Your Order</strong><strong className="text-[#aaa19a]">Out for<br />Delivery</strong>
        </div>
      </div>
      <div className="mx-[10px] mb-[7px] flex h-[133px] flex-col items-center justify-center rounded-[10px] border border-[#eee5dd] bg-white px-2 text-center shadow-[0_2px_8px_rgba(74,49,32,0.05)] min-[700px]:mx-auto min-[700px]:h-[220px] min-[700px]:max-w-[780px] min-[700px]:p-[18px]">
        <div className="relative mb-[2px] grid h-[66px] w-full place-items-center rounded-[8px] bg-[radial-gradient(ellipse_at_50%_80%,#fbe7d6_0_34%,transparent_35%)] text-[43px] leading-none">🛵</div>
        <strong className="text-[9px]">{loading ? 'Looking up your order…' : order ? `Order ${order.status.replaceAll('_', ' ')}` : 'Your order status will appear here.'}</strong>
        <p className="m-0 mt-[2px] text-[7px] text-[#777]">{order ? `Payment ${order.paymentStatus}. Total ₦${order.total.toLocaleString()}.` : 'Enter your order ID above to get the latest update.'}</p>
      </div>
      {order && (
        <div className="mx-[10px] rounded-[9px] border border-[#f1e1d3] bg-[#fff1e3] px-[9px] py-[6px] text-left min-[700px]:mx-auto min-[700px]:max-w-[780px]">
          <div className="flex justify-between text-[7px]"><span>Order ID</span><strong>{order.orderId}</strong></div>
          <div className="mt-[3px] flex justify-between text-[7px]"><span>Order Date</span><strong>{new Date(order.createdAt).toLocaleString()}</strong></div>
        </div>
      )}
      <BottomNav screen={screen} onNavigate={onNavigate} />
    </div>
  )
}
