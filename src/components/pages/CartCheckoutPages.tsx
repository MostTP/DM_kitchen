import { useState } from 'react'
import type { CartItem as OrderCartItem, CustomerDetails, Screen } from '../../types'
import { Header } from '../Header'
import { Icon } from '../Icon'
import { ScreenLink } from '../ScreenLink'
import { QuantityControl } from '../QuantityControl'
import { pageContentClass, primaryActionClass, screenClass } from '../../styles/classes'

interface CartPageProps {
  items: OrderCartItem[]
  deliveryFee: number
  onNavigate: (screen: Screen) => void
  onItemQuantityChange: (item: OrderCartItem, quantity: number) => void
}

const currency = (amount: number) => `₦${amount.toLocaleString()}`

export function CartPage({ items, deliveryFee, onNavigate, onItemQuantityChange }: CartPageProps) {
  const subtotal = items.reduce((total, item) => total + item.quantity * item.unitPrice, 0)
  return (
    <div className={`${screenClass} pb-[60px]`}>
      <Header title="Your Cart" rightAction="none" onNavigate={onNavigate} />
      <div className={`${pageContentClass} px-4 pt-3 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[1124px] min-[700px]:px-7 min-[700px]:py-6`}>
        {items.length > 0 ? (
          <div className="space-y-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onQuantityChange={(quantity) => onItemQuantityChange(item, quantity)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-[#eee5dd] bg-white p-6 text-center">
            <p className="text-base font-semibold">Your cart is empty</p>
            <ScreenLink to="menu" onNavigate={onNavigate} className="mt-3 inline-flex min-h-10 items-center text-sm font-bold text-[#e9550b]">Browse the menu</ScreenLink>
          </div>
        )}
        <div className="mt-4 rounded-xl border border-[#eee5dd] bg-[#fffaf6] px-4 py-3">
          <div className="flex justify-between py-1 text-sm"><span>Subtotal</span><strong>{currency(subtotal)}</strong></div>
          <div className="flex justify-between py-1 text-sm"><span>Delivery Fee</span><strong>{currency(deliveryFee)}</strong></div>
          <div className="mt-2 flex justify-between border-t border-[#eee2d8] pt-3 text-base font-bold"><span>Total</span><b className="text-[#ff6417]">{currency(subtotal + deliveryFee)}</b></div>
        </div>
      </div>
      {items.length > 0 && (
        <ScreenLink to="checkout" onNavigate={onNavigate} className={primaryActionClass}>
          Proceed to Checkout <b className="ml-1">→</b>
        </ScreenLink>
      )}
    </div>
  )
}

function CartItem({ item, onQuantityChange }: { item: OrderCartItem; onQuantityChange: (quantity: number) => void }) {
  const isDrink = item.description === 'Drink'
  return (
    <article className="grid min-h-[88px] grid-cols-[64px_1fr_auto] items-center gap-3 rounded-xl border border-[#eee5dd] bg-white p-3 shadow-[0_2px_8px_rgba(74,49,32,0.05)] min-[700px]:min-h-[100px] min-[700px]:grid-cols-[76px_1fr_auto]">
      {isDrink ? (
        <div className="grid h-14 w-14 place-items-center rounded-lg bg-[#edf4ff] text-3xl text-[#1052a4] min-[700px]:h-[70px] min-[700px]:w-[70px]">🥤</div>
      ) : (
        <img className="h-14 w-14 rounded-full object-cover min-[700px]:h-[70px] min-[700px]:w-[70px]" src={item.image} alt="" />
      )}
      <div className="min-w-0">
        <strong className="block text-sm leading-tight">{item.name}</strong>
        <span className="mt-1 block text-xs text-[#70665f]">{item.description} · {item.quantity} {item.quantity === 1 ? 'item' : 'items'}</span>
        <b className="mt-1 block text-sm">{currency(item.quantity * item.unitPrice)}</b>
      </div>
      <div className="flex h-full flex-col items-end justify-between">
        <button type="button" className="text-[#918780]" aria-label={`Remove ${item.name}`} onClick={() => onQuantityChange(0)}><Icon name="trash" size={16} /></button>
        <QuantityControl label={item.name} quantity={item.quantity} onChange={onQuantityChange} />
      </div>
    </article>
  )
}

interface CheckoutPageProps {
  customer: CustomerDetails
  receiptEmail: string
  onCustomerChange: (customer: CustomerDetails) => void
  onNavigate: (screen: Screen) => void
}

export function CheckoutPage({ customer, receiptEmail, onCustomerChange, onNavigate }: CheckoutPageProps) {
  const [delivery, setDelivery] = useState(true)
  const update = (field: keyof CustomerDetails, value: string) => onCustomerChange({ ...customer, [field]: value })

  return (
    <div className={`${screenClass} pb-[60px]`}>
      <Header title="Checkout" onNavigate={onNavigate} />
      <form className={`${pageContentClass} px-4 pb-3 pt-3 min-[700px]:mx-auto min-[700px]:my-3 min-[700px]:w-full min-[700px]:max-w-[720px] min-[700px]:p-5`}>
        <div className="grid h-12 grid-cols-2 gap-2 rounded-xl border border-[#eee3da] p-1">
          <button type="button" onClick={() => setDelivery(true)} className={`flex items-center justify-center gap-2 rounded-lg text-sm ${delivery ? 'border border-[#ff6b1a] bg-[#fff0e7] font-bold text-[#e9550b]' : 'text-[#685f59]'}`}><Icon name="truck" size={16} />Delivery</button>
          <button type="button" onClick={() => setDelivery(false)} className={`flex items-center justify-center gap-2 rounded-lg text-sm ${!delivery ? 'border border-[#ff6b1a] bg-[#fff0e7] font-bold text-[#e9550b]' : 'text-[#685f59]'}`}><Icon name="bag" size={16} />Collection</button>
        </div>
        <h3 className="mb-3 mt-5 text-lg font-bold">Customer Details</h3>
        <CheckoutField label="Full Name" icon="person" value={customer.fullName} onChange={(value) => update('fullName', value)} />
        <CheckoutField label="Phone Number" icon="phone" value={customer.phone} onChange={(value) => update('phone', value)} />
        <CheckoutField label={delivery ? 'Delivery Address' : 'Collection Location'} icon="pin" value={customer.address} onChange={(value) => update('address', value)} />
        <CheckoutField label="Preferred Date & Time" icon="calendar" value={customer.deliveryDate} onChange={(value) => update('deliveryDate', value)} />
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-[#f1dfd0] bg-white/70 p-3 text-sm text-[#62574f]">
          <span className="mt-0.5 text-[#e9550b]"><Icon name="mail" size={20} /></span>
          <p className="min-w-0">
            Order receipt will be sent to your signed-in account email
            {receiptEmail && <strong className="mt-0.5 block break-all text-[#403831]">{receiptEmail}</strong>}.
          </p>
        </div>
        <label className="mt-2 block text-sm font-medium text-[#514740]">
          Special Instructions (Optional)
          <textarea
            className="mt-1 block min-h-20 w-full resize-y rounded-lg border border-[#eee5dd] bg-white px-3 py-2 text-sm font-normal text-[#554841]"
            value={customer.specialInstructions}
            onChange={(event) => update('specialInstructions', event.target.value)}
            placeholder="Ring the bell, please."
          />
        </label>
      </form>
      <ScreenLink to="payment" onNavigate={onNavigate} className={primaryActionClass}>
        Continue to Payment <b className="ml-1">→</b>
      </ScreenLink>
    </div>
  )
}

function CheckoutField({ label, icon, value, onChange }: { label: string; icon: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="mb-4 grid grid-cols-[40px_1fr] items-center gap-3 text-base font-semibold text-[#514740]">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0e7] text-[#f06418]">
        <Icon name={icon} size={21} />
      </span>
      <span>{label}
        <input
          className="mt-2 block h-12 w-full rounded-lg border border-[#eee5dd] bg-white px-3 text-base font-normal text-[#403831] focus:border-[#f07830] focus:outline-none focus:ring-4 focus:ring-[#ff791c]/10"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </label>
  )
}
