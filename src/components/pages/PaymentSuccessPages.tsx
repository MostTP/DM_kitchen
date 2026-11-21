import { useState } from 'react'
import type { Screen } from '../../types'
import { Header } from '../Header'
import { primaryActionClass, screenClass } from '../../styles/classes'

interface PaymentPageProps {
  total: number
  onNavigate: (screen: Screen) => void
  onPay: () => Promise<void>
}

const paymentMethods = [
  { icon: '◉', label: 'Card Payment', brand: 'VISA  ●●' },
  { icon: '▤', label: 'Bank Transfer', brand: '' },
  { icon: '▯', label: 'USSD', brand: '' },
  { icon: 'ϟ', label: 'Pay with Paystack', brand: '' },
]

export function PaymentPage({ total, onNavigate, onPay }: PaymentPageProps) {
  const [selected, setSelected] = useState('Card Payment')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const pay = async () => {
    setLoading(true)
    setError('')
    try {
      await onPay()
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Unable to start payment.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${screenClass} pb-[60px]`}>
      <Header title="Payment" onNavigate={onNavigate} rightAction="none" />
      <div className="mx-4 mt-3 flex h-20 flex-col items-center justify-center rounded-xl border border-[#eee5dd] bg-[#fffaf6] min-[700px]:mx-auto min-[700px]:mt-7 min-[700px]:h-[110px] min-[700px]:max-w-[1124px]">
        <span className="text-sm">Amount to Pay</span>
        <strong className="text-2xl leading-tight">₦{total.toLocaleString()}</strong>
      </div>
      <h3 className="mx-4 mb-2 mt-4 text-base font-bold min-[700px]:mx-auto min-[700px]:mt-[22px] min-[700px]:max-w-[680px]">Choose Payment Method</h3>
      <div className="space-y-2 px-4 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[680px]">
        {paymentMethods.map((method) => {
          const active = selected === method.label
          return (
            <button
              key={method.label}
              onClick={() => setSelected(method.label)}
              className={`grid h-14 w-full grid-cols-[32px_1fr_auto] items-center rounded-xl border bg-white px-3 text-left ${active ? 'border-[#ff6b1a]' : 'border-[#eee5dd]'}`}
            >
              <span className={`grid h-6 w-6 place-items-center rounded-full text-sm ${active ? 'bg-[#ff701a] text-white' : 'bg-[#f5f0ec] text-[#81766f]'}`}>{active ? '✓' : method.icon}</span>
              <strong className="text-sm">{method.label}</strong>
              {method.brand && <span className="mr-1 text-xs font-black italic text-[#2353a3]">{method.brand}</span>}
              {active && <span className="ml-1 grid h-5 w-5 place-items-center rounded-full bg-[#ff711a] text-xs text-white">✓</span>}
            </button>
          )
        })}
      </div>
      <div className="mt-4 text-center text-xs text-[#716a64]"><span className="mr-1 text-[#ff941c]">♙</span>Your payment is secure and encrypted.</div>
      {error && <p role="alert" className="mx-3 mt-2 text-center text-[10px] text-red-700">{error}</p>}
      <button className={primaryActionClass} onClick={() => void pay()} disabled={loading}>
        {loading ? 'Connecting to Paystack…' : <>Pay Now <b className="ml-1">→</b></>}
      </button>
    </div>
  )
}

const qrRows = [
  '1111111001011',
  '1000001011101',
  '1011101010011',
  '1011101001110',
  '1011101010101',
  '1000001011010',
  '1111111010101',
  '0000000010110',
  '1101011110101',
  '0110110011100',
  '1011101011011',
  '0010110100101',
  '1101011101110',
]

export function SuccessPage({ orderId, onNavigate }: { orderId: string; onNavigate: (screen: Screen) => void }) {
  return (
    <div className={`${screenClass} pb-2`}>
      <Header back={false} title="" rightAction="none" onNavigate={onNavigate} />
      <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-[14px] pb-2 pt-[8px] text-center">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px] bg-[linear-gradient(0deg,rgba(255,235,214,.8),transparent)]" />
        <div className="mb-[5px] grid h-[48px] w-[48px] place-items-center rounded-full bg-[#20b968] text-[29px] font-bold text-white shadow-[0_0_0_8px_#e8f7ed]">✓</div>
        <h1 className="mb-[4px] mt-[5px] text-[20px] font-bold leading-[1.05]">Order Placed<br />Successfully!</h1>
        <p className="mb-[3px] text-[8px]">Your Order ID is:</p>
        <strong className="mb-[7px] flex items-center gap-2 rounded-full border border-[#f1d4c4] bg-[#fff0e8] px-[10px] py-[5px] text-[8px]">{orderId}<span aria-hidden="true">▢</span></strong>
        <div className="grid h-[119px] w-[119px] grid-cols-[repeat(13,minmax(0,1fr))] grid-rows-[repeat(13,minmax(0,1fr))] gap-[2px] rounded-[5px] border border-[#eee5dd] bg-white p-[7px] shadow-[0_3px_14px_rgba(50,30,20,0.08)]">
          {qrRows.flatMap((row, rowIndex) => [...row].map((cell, columnIndex) => (
            <span key={`${rowIndex}-${columnIndex}`} className={cell === '1' ? 'bg-[#191715]' : 'bg-white'} />
          )))}
        </div>
        <small className="mt-[5px] text-[7px] leading-tight text-[#6f6963]">Scan this QR code<br />at pickup or delivery</small>
        <button
          className="z-[1] mt-[9px] h-[35px] w-full max-w-[330px] rounded-full bg-[#ff6b12] text-[10px] font-bold text-white"
          onClick={() => onNavigate('track')}
        >
          Track My Order <b className="ml-1">→</b>
        </button>
        <button className="z-[1] mt-[5px] h-[28px] w-full max-w-[330px] rounded-full border border-[#f3ddca] bg-[#fff8f1] text-[8px] font-semibold" onClick={() => onNavigate('home')}>⌂ Back to Home</button>
        <div className="pointer-events-none absolute bottom-0 left-0 h-[68px] w-[65px] bg-[url('https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=240&q=70')] bg-cover bg-center opacity-90" />
        <div className="pointer-events-none absolute bottom-0 right-0 h-[68px] w-[65px] bg-[url('https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=240&q=70')] bg-cover bg-center opacity-90" />
      </div>
    </div>
  )
}
