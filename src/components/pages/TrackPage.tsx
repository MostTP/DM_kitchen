import type { Screen } from '../../types'
import { BottomNav } from '../BottomNav'
import { Header } from '../Header'
import { Icon } from '../Icon'
import { screenClass } from '../../styles/classes'

export function TrackPage({ screen, onNavigate }: { screen: Screen; onNavigate: (screen: Screen) => void }) {
  return (
    <div className={`${screenClass} pb-[54px]`}>
      <Header title="Track Your Order" onNavigate={onNavigate} rightAction="none" />
      <div className="mx-[10px] mt-[7px] flex h-[31px] min-[700px]:mx-auto min-[700px]:mt-[22px] min-[700px]:max-w-[1124px] min-[700px]:h-[52px]">
        <input className="min-w-0 flex-1 rounded-l-full border border-[#e5ddd6] bg-white px-[10px] text-[8px] text-[#aaa] min-[700px]:px-[14px] min-[700px]:text-xs" defaultValue="Enter Order ID (e.g. DMK-20261120-0012)" />
        <button className="grid w-[34px] place-items-center rounded-r-full border border-l-0 border-[#e5ddd6] bg-white text-[#332821]" aria-label="Search order"><Icon name="search" size={16} /></button>
      </div>
      <div className="mx-[10px] mb-[9px] mt-[11px] min-[700px]:mx-auto min-[700px]:my-[42px] min-[700px]:max-w-[780px]">
        <div className="relative grid grid-cols-4 before:absolute before:left-[8%] before:right-[8%] before:top-[13px] before:h-[2px] before:bg-[linear-gradient(90deg,#ff6b12_0_64%,#eee8e2_64%)]">
          {[1, 2, 3, 4].map((step) => (
            <span key={step} className="z-[1] mx-auto grid h-[27px] w-[27px] place-items-center rounded-full bg-[#fff1e8]">
              <b className={`grid h-[19px] w-[19px] place-items-center rounded-full text-[9px] text-white ${step < 4 ? 'bg-[#ff6b12]' : 'border border-[#ddd4cd] bg-[#f7f3ef]'}`}>{step < 4 ? '✓' : ''}</b>
            </span>
          ))}
        </div>
        <div className="mt-[3px] grid grid-cols-4 text-center text-[6px] leading-[1.15]">
          <strong>Order<br />Received</strong><strong>Payment<br />Confirmed</strong><strong>Preparing<br />Your Order</strong><strong className="text-[#aaa19a]">Out for<br />Delivery</strong>
        </div>
      </div>
      <div className="mx-[10px] mb-[7px] flex h-[133px] flex-col items-center justify-center rounded-[10px] border border-[#eee5dd] bg-white px-2 text-center shadow-[0_2px_8px_rgba(74,49,32,0.05)] min-[700px]:mx-auto min-[700px]:h-[220px] min-[700px]:max-w-[780px] min-[700px]:p-[18px]">
        <div className="relative mb-[2px] grid h-[66px] w-full place-items-center rounded-[8px] bg-[radial-gradient(ellipse_at_50%_80%,#fbe7d6_0_34%,transparent_35%)] text-[43px] leading-none">🛵</div>
        <strong className="text-[9px]">Your order is being prepared!</strong>
        <p className="m-0 mt-[2px] text-[7px] text-[#777]">We’ll notify you once it’s out for delivery.</p>
      </div>
      <div className="mx-[10px] rounded-[9px] border border-[#f1e1d3] bg-[#fff1e3] px-[9px] py-[6px] text-left min-[700px]:mx-auto min-[700px]:max-w-[780px]">
        <div className="mb-[3px] flex justify-between text-[7px]"><span>Order ID</span><strong>DMK-20261120-0042</strong></div>
        <div className="flex justify-between text-[7px]"><span>Order Date</span><strong>Nov 20, 2026 · 11:45 AM</strong></div>
      </div>
      <BottomNav screen={screen} onNavigate={onNavigate} />
    </div>
  )
}
