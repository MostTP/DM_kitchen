import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { screenPaths } from '../../lib/routes'
import type { Screen } from '../../types'
import { supabase } from '../../lib/supabase'
import type { AccountOrder } from '../../services/orders'
import { authErrorMessage } from '../../lib/errors'
import { BottomNav } from '../BottomNav'
import { BrandLogo } from '../BrandLogo'
import { Header } from '../Header'
import { ScreenLink } from '../ScreenLink'
import { primaryActionClass, screenClass } from '../../styles/classes'

interface AccountPageProps {
  session: Session | null
  orders: AccountOrder[]
  loadingOrders: boolean
  accountError: string
  onNavigate: (screen: Screen) => void
  onRefresh: () => void
  cartCount: number
}

const money = (amount: number) => `₦${amount.toLocaleString()}`
const prettyStatus = (status: string) => status.replaceAll('_', ' ')
const supportWhatsAppNumber = '2348055833975'
const oauthCallbackError = (() => {
  if (typeof window === 'undefined') return ''
  const query = new URLSearchParams(window.location.search)
  const fragment = new URLSearchParams(window.location.hash.slice(1))
  const description =
    query.get('error_description') ??
    fragment.get('error_description') ??
    query.get('error') ??
    fragment.get('error')
  return description ? 'Google sign-in could not be completed. Please try again.' : ''
})()

export function AccountPage({
  session,
  orders,
  loadingOrders,
  accountError,
  onNavigate,
  onRefresh,
  cartCount,
}: AccountPageProps) {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeSent, setCodeSent] = useState(false)
  const [authMessage, setAuthMessage] = useState('')
  const [authError, setAuthError] = useState(oauthCallbackError)
  const [authLoading, setAuthLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const [supportOpen, setSupportOpen] = useState(false)
  const [supportName, setSupportName] = useState('')
  const [supportPhone, setSupportPhone] = useState('')
  const [supportOrderId, setSupportOrderId] = useState('')
  const [supportComplaint, setSupportComplaint] = useState('')
  const displayName = String(
    session?.user.user_metadata.full_name ??
    session?.user.user_metadata.name ??
    session?.user.email?.split('@')[0] ??
    'Customer',
  )
  const initials = displayName
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  const activeOrders = orders.filter((order) => !['completed', 'cancelled'].includes(order.status ?? 'new')).length
  const supportMessage = [
    'Hello DMK Support, I need help with a complaint.',
    `Name: ${session ? displayName : supportName.trim()}`,
    session?.user.email ? `Email: ${session.user.email}` : '',
    supportPhone.trim() ? `Phone: ${supportPhone.trim()}` : '',
    supportOrderId.trim() ? `Order ID: ${supportOrderId.trim()}` : '',
    `Complaint: ${supportComplaint.trim()}`,
  ].filter(Boolean).join('\n')
  const supportWhatsAppUrl = `https://wa.me/${supportWhatsAppNumber}?text=${encodeURIComponent(supportMessage)}`

  useEffect(() => {
    if (resendCooldown <= 0) return
    const timer = window.setTimeout(() => setResendCooldown((seconds) => seconds - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendCooldown])

  const requestEmailCode = async () => {
    if (!supabase) {
      setAuthError('Sign-in is temporarily unavailable. Please try again later.')
      return
    }
    if (!email.trim()) {
      setAuthError('Enter your email address.')
      return
    }

    setAuthLoading(true)
    setAuthError('')
    setAuthMessage('')
    if (!sessionStorage.getItem('dmk-after-sign-in')) {
      sessionStorage.setItem('dmk-after-sign-in', 'track')
    }
    const { error } = await supabase.auth.signInWithOtp({ email: email.trim() })
    setAuthLoading(false)
    if (error) {
      setAuthError(authErrorMessage(error, 'Unable to send the sign-in code.'))
      return
    }
    setCodeSent(true)
    setResendCooldown(30)
    setAuthMessage('Check your email for a sign-in code.')
  }

  const verifyEmailCode = async () => {
    if (!supabase) return
    setAuthLoading(true)
    setAuthError('')
    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    })
    setAuthLoading(false)
    if (error) setAuthError(authErrorMessage(error, 'The sign-in code is invalid or has expired.'))
  }

  const signInWithGoogle = async () => {
    if (!supabase) {
      setAuthError('Sign-in is temporarily unavailable. Please try again later.')
      return
    }
    setAuthLoading(true)
    setAuthError('')
    if (!sessionStorage.getItem('dmk-after-sign-in')) {
      sessionStorage.setItem('dmk-after-sign-in', 'track')
    }
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: new URL(screenPaths.track, window.location.origin).toString() },
      })
      if (error) {
        setAuthError(authErrorMessage(error, 'Unable to start Google sign-in.'))
        setAuthLoading(false)
      }
    } catch {
      setAuthError('Unable to start Google sign-in.')
      setAuthLoading(false)
    }
  }

  const signOut = async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) setAuthError(authErrorMessage(error, 'Unable to sign out.'))
  }

  return (
    <div className={`${screenClass}`}>
      <Header title="My Account" rightAction="none" onNavigate={onNavigate} />
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 pt-4 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[960px] min-[700px]:px-7 min-[700px]:py-8">
        {session ? (
          <>
            <section className="overflow-hidden rounded-3xl bg-[#30231c] text-white shadow-[0_12px_30px_rgba(48,35,28,0.16)]">
              <div className="flex items-center gap-4 p-5 min-[700px]:p-7">
                <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#ff791c] text-xl font-bold shadow-inner">
                  {initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#ffd0a9]">DMK Account</p>
                  <h2 className="mt-1 truncate text-xl font-bold">{displayName}</h2>
                  <p className="mt-1 truncate text-sm text-white/70">{session.user.email}</p>
                </div>
                <button
                  type="button"
                  className="min-h-10 shrink-0 rounded-full border border-white/25 px-3 text-xs font-semibold text-white/90 hover:bg-white/10 min-[700px]:px-4 min-[700px]:text-sm"
                  onClick={() => void signOut()}
                >
                  Sign out
                </button>
              </div>
              <div className="grid grid-cols-2 gap-px bg-white/10">
                <div className="bg-white/[0.06] px-5 py-3 min-[700px]:px-7">
                  <strong className="block text-lg">{orders.length}</strong>
                  <span className="text-xs text-white/65">Total orders</span>
                </div>
                <div className="bg-white/[0.06] px-5 py-3 min-[700px]:px-7">
                  <strong className="block text-lg">{activeOrders}</strong>
                  <span className="text-xs text-white/65">In progress</span>
                </div>
              </div>
            </section>

            <section className="mt-7">
              <div className="mb-4 flex items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#e9550b]">Order history</p>
                  <h2 className="mt-1 text-xl font-bold">Your orders</h2>
                </div>
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center gap-2 rounded-full border border-[#eadfd6] bg-white px-4 text-sm font-semibold text-[#514740] disabled:opacity-60"
                  onClick={onRefresh}
                  disabled={loadingOrders}
                  aria-label={loadingOrders ? 'Refreshing orders' : 'Refresh orders'}
                >
                  <span className={loadingOrders ? 'animate-spin' : ''} aria-hidden="true">↻</span>
                  {loadingOrders ? 'Refreshing' : 'Refresh'}
                </button>
              </div>

              {loadingOrders && (
                <p role="status" className="mb-3 rounded-xl bg-[#fff0e7] px-4 py-3 text-sm text-[#8d4a20]">
                  Updating your order history…
                </p>
              )}
              {accountError && (
                <div role="alert" className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-200 bg-white px-4 py-3 text-sm text-red-700">
                  <span>{accountError}</span>
                  <button type="button" className="min-h-9 font-bold underline" onClick={onRefresh} disabled={loadingOrders}>Try again</button>
                </div>
              )}
              {orders.length ? (
                <div className="grid gap-3 min-[700px]:grid-cols-2">
                  {orders.map((order) => (
                    <article key={order.orderId} className="rounded-2xl border border-[#eee5dd] bg-white p-4 shadow-[0_3px_12px_rgba(74,49,32,0.04)]">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[11px] font-semibold uppercase tracking-wide text-[#8b7c72]">Order ID</p>
                          <h3 className="mt-1 break-all text-sm font-bold">{order.orderId}</h3>
                          <p className="mt-1 text-xs text-[#8b7c72]">
                            {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
                          </p>
                        </div>
                        <span className="shrink-0 rounded-full bg-[#fff0e7] px-3 py-1.5 text-xs font-semibold capitalize text-[#e9550b]">
                          {prettyStatus(order.status ?? 'new')}
                        </span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-[#f1e9e3] pt-3">
                        <span className={`rounded-md px-2 py-1 text-xs font-medium capitalize ${order.paymentStatus === 'paid' ? 'bg-green-50 text-green-700' : 'bg-[#f5f1ed] text-[#6f6259]'}`}>
                          {order.paymentStatus} payment
                        </span>
                        <strong className="text-base">{money(order.total)}</strong>
                      </div>
                    </article>
                  ))}
                </div>
              ) : !loadingOrders && !accountError ? (
                <div className="rounded-2xl border border-dashed border-[#e6d8cc] bg-white px-5 py-9 text-center">
                  <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#fff0e7] text-2xl" aria-hidden="true">🧾</span>
                  <h3 className="mt-4 text-base font-bold">No orders yet</h3>
                  <p className="mx-auto mt-1 max-w-xs text-sm text-[#77706a]">When you place an order, its ID and progress will be saved here.</p>
                  <ScreenLink to="menu" onNavigate={onNavigate} className="mt-4 inline-flex min-h-11 items-center rounded-full bg-[#ff701a] px-5 text-sm font-bold text-white">Browse menu</ScreenLink>
                </div>
              ) : null}
            </section>
          </>
        ) : (
          <section className="mx-auto max-w-[520px] overflow-hidden rounded-3xl border border-[#eee5dd] bg-white shadow-[0_12px_35px_rgba(74,49,32,0.08)]">
            <div className="bg-[#30231c] px-6 py-7 text-white min-[700px]:px-8">
              <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-2xl bg-white p-1.5">
                <BrandLogo className="h-full w-full object-contain" />
              </span>
              <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#ffd0a9]">Your kitchen, your orders</p>
              <h2 className="mt-2 text-2xl font-bold">Welcome back</h2>
              <p className="mt-2 text-sm leading-relaxed text-white/70">Sign in to keep your order history and updates together in one place.</p>
            </div>
            <div className="p-6 min-[700px]:p-8">
            <button
              type="button"
              onClick={() => void signInWithGoogle()}
              disabled={authLoading}
              className="flex min-h-12 w-full items-center justify-center gap-3 rounded-xl border border-[#e7e1dc] bg-white px-4 text-sm font-semibold shadow-sm hover:bg-[#fffaf6] disabled:opacity-60"
            >
              <span aria-hidden="true" className="text-base font-bold">G</span>
              Continue with Google
            </button>
            <div className="my-5 flex items-center gap-3 text-xs text-[#918780]">
              <span className="h-px flex-1 bg-[#eee5dd]" />or use email<span className="h-px flex-1 bg-[#eee5dd]" />
            </div>
            <label className="block text-sm font-medium">
              Email address
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="mt-1 h-12 w-full rounded-lg border border-[#eee5dd] px-3 text-base"
              />
            </label>
            {codeSent && (
              <>
                <label className="mt-3 block text-sm font-medium">
                  Email sign-in code
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(event) => setCode(event.target.value)}
                    className="mt-1 h-12 w-full rounded-lg border border-[#eee5dd] px-3 text-base"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void requestEmailCode()}
                  disabled={authLoading || resendCooldown > 0}
                  className="mt-3 min-h-10 text-sm font-semibold text-[#e9550b] underline underline-offset-2 disabled:cursor-not-allowed disabled:text-[#918780] disabled:no-underline"
                >
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                </button>
              </>
            )}
            {authError && <p role="alert" className="mt-3 text-sm text-red-700">{authError}</p>}
            {authMessage && <p role="status" className="mt-3 text-sm text-green-700">{authMessage}</p>}
            <button
              type="button"
              onClick={() => void (codeSent ? verifyEmailCode() : requestEmailCode())}
              disabled={authLoading}
              className={`${primaryActionClass} !static !mt-4 !w-full disabled:opacity-60`}
            >
              {authLoading ? 'Please wait…' : codeSent ? 'Verify code' : 'Email me a sign-in code'}
            </button>
            </div>
          </section>
        )}
        <section className="mx-auto mt-6 w-full max-w-[960px] rounded-2xl border border-[#eee5dd] bg-white p-5 shadow-[0_3px_12px_rgba(74,49,32,0.04)] min-[700px]:p-6">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#e9550b]">Customer care</p>
          <h2 className="mt-1 text-xl font-bold">Need help with an order?</h2>
          <p className="mt-1 text-sm leading-relaxed text-[#77706a]">
            Contact our team on WhatsApp and we’ll be happy to help.
          </p>
          <button
            type="button"
            onClick={() => setSupportOpen(true)}
            className="mt-4 inline-flex min-h-11 items-center justify-center rounded-full bg-[#168b50] px-5 text-sm font-bold text-white hover:bg-[#117541]"
          >
            Contact customer care
          </button>
        </section>
      </div>
      {supportOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/55 sm:items-center sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="support-modal-title"
          onClick={(event) => {
            if (event.target === event.currentTarget) setSupportOpen(false)
          }}
        >
          <section className="flex max-h-[92svh] w-full flex-col overflow-y-auto rounded-t-2xl bg-[#fffaf6] p-5 shadow-2xl sm:max-w-[560px] sm:rounded-2xl sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#e9550b]">Customer care</p>
                <h2 id="support-modal-title" className="mt-1 text-xl font-bold">Tell us how we can help</h2>
                <p className="mt-1 text-sm leading-relaxed text-[#77706a]">
                  Share your complaint and we’ll open a WhatsApp chat with your details ready to send.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSupportOpen(false)}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#eee5dd] text-xl"
                aria-label="Close customer care"
              >
                ×
              </button>
            </div>
            <div className="mt-4 grid gap-3 min-[700px]:grid-cols-2">
              {!session && (
                <label className="block text-sm font-medium">
                  Your name (optional)
                  <input
                    autoComplete="name"
                    value={supportName}
                    onChange={(event) => setSupportName(event.target.value)}
                    className="mt-1 h-11 w-full rounded-lg border border-[#eee5dd] px-3 text-base"
                  />
                </label>
              )}
              <label className="block text-sm font-medium">
                Phone number (optional)
                <input
                  type="tel"
                  autoComplete="tel"
                  value={supportPhone}
                  onChange={(event) => setSupportPhone(event.target.value)}
                  className="mt-1 h-11 w-full rounded-lg border border-[#eee5dd] px-3 text-base"
                />
              </label>
              <label className="block text-sm font-medium">
                Order ID (optional)
                <input
                  value={supportOrderId}
                  onChange={(event) => setSupportOrderId(event.target.value)}
                  className="mt-1 h-11 w-full rounded-lg border border-[#eee5dd] px-3 text-base"
                />
              </label>
            </div>
            <label className="mt-3 block text-sm font-medium">
              Your complaint
              <textarea
                value={supportComplaint}
                onChange={(event) => setSupportComplaint(event.target.value)}
                className="mt-1 min-h-24 w-full rounded-lg border border-[#eee5dd] px-3 py-2 text-base"
                placeholder="Tell us what happened and how we can help."
              />
            </label>
            <a
              href={supportComplaint.trim() ? supportWhatsAppUrl : undefined}
              target="_blank"
              rel="noopener noreferrer"
              aria-disabled={!supportComplaint.trim()}
              onClick={(event) => {
                if (!supportComplaint.trim()) event.preventDefault()
              }}
              className={`mt-4 flex min-h-12 items-center justify-center rounded-full px-5 text-sm font-bold text-white ${
                supportComplaint.trim() ? 'bg-[#168b50] hover:bg-[#117541]' : 'cursor-not-allowed bg-[#9ab7a8]'
              }`}
            >
              Continue to WhatsApp
            </a>
          </section>
        </div>
      )}
      <BottomNav screen="track" onNavigate={onNavigate} cartCount={cartCount} />
    </div>
  )
}
