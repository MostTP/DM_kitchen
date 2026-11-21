import { useState } from 'react'
import type { Screen } from '../../types'
import { Header } from '../Header'
import { Icon } from '../Icon'
import { ScreenLink } from '../ScreenLink'
import { primaryActionClass, screenClass } from '../../styles/classes'

interface PaymentPageProps {
  total: number
  onNavigate: (screen: Screen) => void
  onPay: () => Promise<void>
}

export function PaymentPage({ total, onNavigate, onPay }: PaymentPageProps) {
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
      <section className="mx-4 mt-5 flex items-start gap-3 rounded-xl border border-[#eee5dd] bg-white p-4 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[680px]">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#fff0e7] text-[#e9550b]">
          <Icon name="lock" size={22} />
        </span>
        <div>
          <h3 className="text-sm font-bold">Secure payment with Paystack</h3>
          <p className="mt-1 text-sm leading-relaxed text-[#716a64]">Choose card, bank transfer, USSD, or another available option on the secure Paystack page.</p>
        </div>
      </section>
      {error && <p role="alert" className="mx-3 mt-2 text-center text-[10px] text-red-700">{error}</p>}
      <button className={primaryActionClass} onClick={() => void pay()} disabled={loading}>
        {loading ? 'Connecting to Paystack…' : <>Continue to Paystack <b className="ml-2">→</b></>}
      </button>
    </div>
  )
}

export function SuccessPage({ orderId, onNavigate }: { orderId: string; onNavigate: (screen: Screen) => void }) {
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState('')

  const copyOrderCode = async () => {
    try {
      await navigator.clipboard.writeText(orderId)
      setCopied(true)
      setCopyError('')
    } catch {
      setCopied(false)
      setCopyError('Copy was unavailable. Select and copy the order code above.')
    }
  }

  return (
    <div className={`${screenClass} pb-2`}>
      <Header back={false} title="" rightAction="none" onNavigate={onNavigate} />
      <div className="relative flex min-h-0 flex-1 flex-col items-center overflow-y-auto px-4 pb-6 pt-5 text-center min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[620px] min-[700px]:justify-center">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[100px] bg-[linear-gradient(0deg,rgba(255,235,214,.8),transparent)]" />
        <div className="relative z-[1] mb-4 grid h-14 w-14 place-items-center rounded-full bg-[#20b968] text-3xl font-bold text-white shadow-[0_0_0_8px_#e8f7ed]">✓</div>
        <h1 className="relative z-[1] text-2xl font-extrabold leading-tight min-[700px]:text-3xl">Order placed successfully!</h1>
        <p className="relative z-[1] mt-2 text-sm text-[#6f6963]">Keep this code and show it to staff when your order is delivered.</p>
        <section className="relative z-[1] mt-6 w-full rounded-2xl border border-[#f1d4c4] bg-white p-5 text-left shadow-[0_8px_25px_rgba(50,30,20,0.07)] min-[700px]:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#a95625]">Your order code</p>
          <strong className="mt-2 block break-all font-mono text-lg font-extrabold tracking-wide text-[#30231c] min-[700px]:text-xl">{orderId}</strong>
          <button type="button" onClick={() => void copyOrderCode()} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#fff0e7] px-5 text-sm font-bold text-[#a94817] transition hover:bg-[#ffe5d4]">
            {copied ? 'Copied order code ✓' : 'Copy order code'}
          </button>
          {copyError && <p role="alert" className="mt-2 text-xs text-red-700">{copyError}</p>}
        </section>
        <p className="relative z-[1] mt-3 max-w-md text-xs leading-relaxed text-[#77706a]">The delivery team can use this code to find and verify your order. Never share your account password or payment details.</p>
        <ScreenLink
          to="track"
          onNavigate={onNavigate}
          className="z-[1] mt-5 inline-flex h-12 w-full max-w-[380px] items-center justify-center rounded-full bg-[#ff6b12] text-sm font-bold text-white"
        >
          Track my order <b className="ml-2">→</b>
        </ScreenLink>
        <ScreenLink to="home" onNavigate={onNavigate} className="z-[1] mt-2 inline-flex h-11 w-full max-w-[380px] items-center justify-center rounded-full border border-[#f3ddca] bg-[#fff8f1] text-sm font-semibold">⌂ Back to home</ScreenLink>
      </div>
    </div>
  )
}
