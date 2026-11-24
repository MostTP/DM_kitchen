import { useState, type FormEvent } from 'react'
import type { CartItem as OrderCartItem, CustomerDetails, FulfillmentMethod, Screen } from '../../types'
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
    <div className={`${screenClass}`}>
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
  onFulfillmentChange: (method: FulfillmentMethod) => void
  onNavigate: (screen: Screen) => void
}

export function CheckoutPage({ customer, receiptEmail, onCustomerChange, onFulfillmentChange, onNavigate }: CheckoutPageProps) {
  const [submitted, setSubmitted] = useState(false)
  const delivery = customer.fulfillmentMethod === 'delivery'
  const collection = customer.fulfillmentMethod === 'collection'
  const update = (field: keyof CustomerDetails, value: string) => onCustomerChange({ ...customer, [field]: value })
  const today = new Date()
  const minDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const phoneValue = customer.phone.trim()
  const phoneDigits = phoneValue.replace(/\D/g, '')
  const errors = {
    fulfillmentMethod: !customer.fulfillmentMethod ? 'Choose delivery or collection.' : '',
    fullName: !customer.fullName.trim() ? 'Enter your full name.' : '',
    phone: !customer.phone.trim()
      ? 'Enter your phone number.'
      : !/^\+?[\d\s()-]+$/.test(phoneValue) || phoneDigits.length < 7 || phoneDigits.length > 15
        ? 'Enter a valid phone number.'
        : '',
    address: delivery && !customer.address.trim() ? 'Enter your delivery address.' : '',
    deliveryDate: !customer.deliveryDate
      ? 'Choose a preferred date.'
      : customer.deliveryDate < minDate
        ? 'Choose today or a future date.'
        : '',
    deliveryTime: !customer.deliveryTime ? 'Choose a preferred time.' : '',
  }
  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitted(true)
    if (Object.values(errors).some(Boolean)) return
    onNavigate('payment')
  }

  return (
    <div className={`${screenClass} min-w-0`}>
      <Header title="Checkout" onNavigate={onNavigate} />
      <form id="checkout-form" noValidate onSubmit={handleSubmit} className={`${pageContentClass} w-full min-w-0 px-4 pb-24 pt-3 min-[700px]:mx-auto min-[700px]:my-3 min-[700px]:max-w-[720px] min-[700px]:p-5`}>
        <fieldset className="min-w-0">
          <legend className="sr-only">Order fulfillment method</legend>
          <div className="grid h-12 grid-cols-2 gap-2 rounded-xl border border-[#eee3da] p-1">
            <button type="button" aria-pressed={delivery} onClick={() => onFulfillmentChange('delivery')} className={`flex min-w-0 items-center justify-center gap-2 rounded-lg text-sm ${delivery ? 'border border-[#ff6b1a] bg-[#fff0e7] font-bold text-[#e9550b]' : 'text-[#685f59]'}`}><Icon name="truck" size={16} />Delivery</button>
            <button type="button" aria-pressed={collection} onClick={() => onFulfillmentChange('collection')} className={`flex min-w-0 items-center justify-center gap-2 rounded-lg text-sm ${collection ? 'border border-[#ff6b1a] bg-[#fff0e7] font-bold text-[#e9550b]' : 'text-[#685f59]'}`}><Icon name="bag" size={16} />Collection</button>
          </div>
          {submitted && errors.fulfillmentMethod && <p className="mt-1 text-sm text-red-700" role="alert">{errors.fulfillmentMethod}</p>}
        </fieldset>
        <h3 className="mb-3 mt-5 text-lg font-bold">Customer Details</h3>
        <CheckoutField
          id="checkout-name"
          label="Full Name"
          icon="person"
          value={customer.fullName}
          error={submitted ? errors.fullName : ''}
          autoComplete="name"
          onChange={(value) => update('fullName', value)}
        />
        <CheckoutField
          id="checkout-phone"
          label="Phone Number"
          icon="phone"
          value={customer.phone}
          error={submitted ? errors.phone : ''}
          type="tel"
          autoComplete="tel"
          onChange={(value) => update('phone', value)}
        />
        {delivery && (
          <CheckoutField
            id="checkout-address"
            label="Delivery Address"
            icon="pin"
            value={customer.address}
            error={submitted ? errors.address : ''}
            autoComplete="street-address"
            onChange={(value) => update('address', value)}
          />
        )}
        <div className="mb-4 grid min-w-0 grid-cols-1 gap-3 min-[420px]:grid-cols-2">
          <DateTimeField
            id="checkout-date"
            label="Preferred Date"
            value={customer.deliveryDate}
            error={submitted ? errors.deliveryDate : ''}
            type="date"
            min={minDate}
            onChange={(value) => update('deliveryDate', value)}
          />
          <DateTimeField
            id="checkout-time"
            label="Preferred Time"
            value={customer.deliveryTime}
            error={submitted ? errors.deliveryTime : ''}
            type="time"
            onChange={(value) => update('deliveryTime', value)}
          />
        </div>
        <div className="mb-4 flex min-w-0 items-start gap-3 rounded-xl border border-[#f1dfd0] bg-white/70 p-3 text-sm text-[#62574f]">
          <span className="mt-0.5 text-[#e9550b]"><Icon name="mail" size={20} /></span>
          <p className="min-w-0">
            Order receipt will be sent to your signed-in account email
            {receiptEmail && <strong className="mt-0.5 block break-all text-[#403831]">{receiptEmail}</strong>}.
          </p>
        </div>
        <label className="mt-2 block text-sm font-medium text-[#514740]">
          Special Instructions (Optional)
          <textarea
            className="mt-1 block min-h-20 w-full min-w-0 resize-y rounded-lg border border-[#eee5dd] bg-white px-3 py-2 text-sm font-normal text-[#554841]"
            value={customer.specialInstructions}
            onChange={(event) => update('specialInstructions', event.target.value)}
            placeholder="Ring the bell, please."
            maxLength={500}
          />
        </label>
      </form>
      <button
        type="submit"
        form="checkout-form"
        className={`${primaryActionClass} disabled:cursor-not-allowed disabled:opacity-50`}
      >
        Continue to Payment <b className="ml-1">→</b>
      </button>
    </div>
  )
}

function CheckoutField({
  id,
  label,
  icon,
  value,
  error,
  type = 'text',
  autoComplete,
  onChange,
}: {
  id: string
  label: string
  icon: string
  value: string
  error: string
  type?: 'text' | 'tel'
  autoComplete?: string
  onChange: (value: string) => void
}) {
  return (
    <label htmlFor={id} className="mb-4 grid min-w-0 grid-cols-[40px_minmax(0,1fr)] items-start gap-3 text-base font-semibold text-[#514740]">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-[#fff0e7] text-[#f06418]">
        <Icon name={icon} size={21} />
      </span>
      <span className="min-w-0">{label}
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          required
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className="mt-2 block h-12 w-full min-w-0 rounded-lg border border-[#eee5dd] bg-white px-3 text-base font-normal text-[#403831] focus:border-[#f07830] focus:outline-none focus:ring-4 focus:ring-[#ff791c]/10"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {error && <span id={`${id}-error`} className="mt-1 block text-xs font-normal text-red-700">{error}</span>}
      </span>
    </label>
  )
}

function DateTimeField({
  id,
  label,
  value,
  error,
  type,
  min,
  onChange,
}: {
  id: string
  label: string
  value: string
  error: string
  type: 'date' | 'time'
  min?: string
  onChange: (value: string) => void
}) {
  return (
    <label htmlFor={id} className="block min-w-0 text-sm font-semibold text-[#514740]">
      {label}
      <input
        id={id}
        type={type}
        required
        min={min}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-1 block h-12 w-full min-w-0 appearance-none rounded-lg border border-[#eee5dd] bg-white px-3 text-base font-normal text-[#403831] focus:border-[#f07830] focus:outline-none focus:ring-4 focus:ring-[#ff791c]/10"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {error && <span id={`${id}-error`} className="mt-1 block text-xs font-normal text-red-700">{error}</span>}
    </label>
  )
}
