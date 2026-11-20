import { useState } from 'react'
import type { CustomerDetails, Screen } from '../../types'
import { foodImages } from '../../data/menu'
import { Header } from '../Header'
import { Icon } from '../Icon'
import { screenClass } from '../../styles/classes'

interface CartPageProps {
  rice: string
  plate: string
  quantity: number
  onNavigate: (screen: Screen) => void
}

export function CartPage({ rice, plate, quantity, onNavigate }: CartPageProps) {
  const entries = [
    { image: foodImages.jollof, name: rice, size: `${plate} Plate`, protein: `Chicken · ${quantity} plates`, price: '₦25,000' },
    { image: foodImages.mixed, name: 'Mixed Rice', size: 'Medium Plate', protein: `Beef · ${quantity} plates`, price: '₦25,000' },
  ]

  return (
    <div className={`${screenClass} pb-[60px]`}>
      <Header title="Your Cart" rightAction="trash" onNavigate={onNavigate} />
      <div className="flex-1 px-[10px] pt-[7px] min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[1124px] min-[700px]:px-7 min-[700px]:py-6">
        <div className="space-y-[6px]">
          {entries.map((item, index) => (
            <CartItem key={`${item.name}-${index}`} {...item} />
          ))}
          <CartItem image="" name="Pepsi" size="10 units" protein="" price="₦4,000" drink />
        </div>
        <div className="mt-[7px] rounded-[9px] border border-[#eee5dd] bg-[#fffaf6] px-[9px] py-[6px]">
          <div className="flex justify-between py-[3px] text-[9px]"><span>Subtotal</span><strong>₦54,000</strong></div>
          <div className="flex justify-between py-[3px] text-[9px]"><span>Delivery Fee</span><strong>₦1,000</strong></div>
          <div className="mt-[3px] flex justify-between border-t border-[#eee2d8] pt-[5px] text-[12px] font-bold"><span>Total</span><b className="text-[#ff6417]">₦55,000</b></div>
        </div>
      </div>
      <button
        className="absolute bottom-[8px] left-[10px] right-[10px] h-[36px] rounded-full bg-[#ff6b12] text-[10px] font-bold text-white min-[700px]:relative min-[700px]:bottom-auto min-[700px]:left-auto min-[700px]:right-auto min-[700px]:mx-auto min-[700px]:mt-4 min-[700px]:block min-[700px]:h-[52px] min-[700px]:w-[min(560px,calc(100%-56px))] min-[700px]:text-sm"
        onClick={() => onNavigate('checkout')}
      >
        Proceed to Checkout <b className="ml-1">→</b>
      </button>
    </div>
  )
}

interface CartItemProps {
  image: string
  name: string
  size: string
  protein: string
  price: string
  drink?: boolean
}

function CartItem({ image, name, size, protein, price, drink = false }: CartItemProps) {
  return (
    <article className="grid min-h-[65px] grid-cols-[56px_1fr_auto] items-center gap-[7px] rounded-[10px] border border-[#eee5dd] bg-white p-[6px] shadow-[0_2px_8px_rgba(74,49,32,0.05)] min-[700px]:min-h-[90px] min-[700px]:grid-cols-[76px_1fr_auto]">
      {drink ? (
        <div className="grid h-[51px] w-[51px] place-items-center rounded-lg bg-[#edf4ff] text-[26px] text-[#1052a4] min-[700px]:h-[70px] min-[700px]:w-[70px]">🥤</div>
      ) : (
        <img className="h-[51px] w-[51px] rounded-full object-cover min-[700px]:h-[70px] min-[700px]:w-[70px]" src={image} alt="" />
      )}
      <div className="min-w-0">
        <strong className="block text-[9px] leading-tight">{name}</strong>
        <span className="block text-[8px] leading-[1.25]">{size}</span>
        {protein && <span className="block text-[8px] leading-[1.25]">{protein}</span>}
        <b className="mt-[2px] block text-[9px]">{price}</b>
      </div>
      <div className="flex h-full flex-col items-end justify-between">
        <button className="text-[#918780]" aria-label={`Remove ${name}`}><Icon name="trash" size={12} /></button>
        <div className="flex h-[21px] items-center gap-[7px] rounded-full border border-[#e7e1dc] px-[6px] text-[8px]">
          <button aria-label={`Decrease ${name} quantity`}>−</button><span>10</span><button aria-label={`Increase ${name} quantity`}>+</button>
        </div>
      </div>
    </article>
  )
}

interface CheckoutPageProps {
  customer: CustomerDetails
  onCustomerChange: (customer: CustomerDetails) => void
  onNavigate: (screen: Screen) => void
}

export function CheckoutPage({ customer, onCustomerChange, onNavigate }: CheckoutPageProps) {
  const [delivery, setDelivery] = useState(true)
  const update = (field: keyof CustomerDetails, value: string) => onCustomerChange({ ...customer, [field]: value })

  return (
    <div className={`${screenClass} pb-[60px]`}>
      <Header title="Checkout" onNavigate={onNavigate} />
      <form className="flex-1 overflow-y-auto px-[10px] pb-2 pt-[6px] min-[700px]:mx-auto min-[700px]:my-3 min-[700px]:w-full min-[700px]:max-w-[720px] min-[700px]:p-5">
        <div className="grid h-[37px] grid-cols-2 gap-[5px] rounded-[9px] border border-[#eee3da] p-[3px]">
          <button type="button" onClick={() => setDelivery(true)} className={`flex items-center justify-center gap-[5px] rounded-[7px] text-[9px] ${delivery ? 'border border-[#ff6b1a] bg-[#fff0e7] font-bold text-[#e9550b]' : 'text-[#685f59]'}`}><Icon name="truck" size={14} />Delivery</button>
          <button type="button" onClick={() => setDelivery(false)} className={`flex items-center justify-center gap-[5px] rounded-[7px] text-[9px] ${!delivery ? 'border border-[#ff6b1a] bg-[#fff0e7] font-bold text-[#e9550b]' : 'text-[#685f59]'}`}><Icon name="bag" size={14} />Collection</button>
        </div>
        <h3 className="mb-[5px] mt-[8px] text-[10px] font-bold">Customer Details</h3>
        <CheckoutField label="Full Name" icon="♙" value={customer.fullName} onChange={(value) => update('fullName', value)} />
        <CheckoutField label="Phone Number" icon="♧" value={customer.phone} onChange={(value) => update('phone', value)} />
        <CheckoutField label="Email Address" icon="✉" value={customer.email} onChange={(value) => update('email', value)} />
        <CheckoutField label={delivery ? 'Delivery Address' : 'Collection Location'} icon="⌖" value={customer.address} onChange={(value) => update('address', value)} />
        <CheckoutField label="Preferred Date & Time" icon="▦" value={customer.deliveryDate} onChange={(value) => update('deliveryDate', value)} />
        <label className="mt-[1px] block text-[8px] font-medium text-[#514740]">
          Special Instructions (Optional)
          <textarea
            className="mt-[3px] block h-[39px] w-full resize-none rounded-[7px] border border-[#eee5dd] bg-white px-[8px] py-[6px] text-[8px] font-normal text-[#554841]"
            value={customer.specialInstructions}
            onChange={(event) => update('specialInstructions', event.target.value)}
            placeholder="Ring the bell, please."
          />
        </label>
      </form>
      <button
        className="absolute bottom-[8px] left-[10px] right-[10px] h-[36px] rounded-full bg-[#ff6b12] text-[10px] font-bold text-white min-[700px]:relative min-[700px]:bottom-auto min-[700px]:left-auto min-[700px]:right-auto min-[700px]:mx-auto min-[700px]:mt-4 min-[700px]:block min-[700px]:h-[52px] min-[700px]:w-[min(560px,calc(100%-56px))] min-[700px]:text-sm"
        onClick={() => onNavigate('payment')}
      >
        Continue to Payment <b className="ml-1">→</b>
      </button>
    </div>
  )
}

function CheckoutField({ label, icon, value, onChange }: { label: string; icon: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mb-[4px] grid grid-cols-[21px_1fr] items-center gap-[5px] text-[8px] font-medium text-[#514740]">
      <span className="grid h-[18px] w-[18px] place-items-center rounded-full bg-[#fff0e7] text-[10px] text-[#f06418]">{icon}</span>
      <span>{label}
        <input
          className="mt-[2px] block h-[29px] w-full rounded-[7px] border border-[#eee5dd] bg-white px-[8px] text-[8px] font-normal text-[#403831]"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  )
}
