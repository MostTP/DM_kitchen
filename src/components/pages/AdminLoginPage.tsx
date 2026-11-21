import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabase'
import { getAdminOrders } from '../../services/orders'
import type { Screen } from '../../types'
import { Header } from '../Header'
import { ScreenLink } from '../ScreenLink'
import { primaryActionClass, screenClass } from '../../styles/classes'

export function AdminLoginPage({
  onNavigate,
}: {
  onNavigate: (screen: Screen) => void
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const signIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!supabase) {
      setError('Sign-in is not configured.')
      return
    }

    setLoading(true)
    setError('')
    sessionStorage.setItem('dmk-after-sign-in', 'admin')

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    })

    if (signInError || !data.session) {
      sessionStorage.removeItem('dmk-after-sign-in')
      setLoading(false)
      setError(signInError?.message ?? 'Unable to sign in.')
      return
    }

    try {
      await getAdminOrders(data.session.access_token)
      sessionStorage.removeItem('dmk-after-sign-in')
      onNavigate('admin')
    } catch (requestError) {
      sessionStorage.removeItem('dmk-after-sign-in')
      await supabase.auth.signOut()
      setError(requestError instanceof Error ? requestError.message : 'Unable to verify admin access.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`${screenClass} pb-[60px]`}>
      <Header title="Admin Sign In" backTarget="track" onNavigate={onNavigate} rightAction="none" />
      <div className="flex-1 overflow-y-auto px-4 py-8 min-[700px]:mx-auto min-[700px]:w-full min-[700px]:max-w-[520px] min-[700px]:pt-16">
        <form onSubmit={(event) => void signIn(event)} className="rounded-3xl border border-[#eee5dd] bg-white p-6 shadow-[0_12px_35px_rgba(74,49,32,0.08)] min-[700px]:p-8">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-[#30231c] text-lg font-black text-white">DMK</div>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.14em] text-[#e9550b]">Staff access</p>
          <h2 className="mt-2 text-2xl font-bold">Admin dashboard</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#77706a]">Sign in with your admin email and password to manage orders.</p>

          <label className="mt-6 block text-sm font-medium">
            Admin email
            <input
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 h-12 w-full rounded-lg border border-[#eee5dd] px-3 text-base"
            />
          </label>
          <label className="mt-4 block text-sm font-medium">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 h-12 w-full rounded-lg border border-[#eee5dd] px-3 text-base"
            />
          </label>
          {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={loading} className={`${primaryActionClass} !static !mt-6 !w-full disabled:opacity-60`}>
            {loading ? 'Checking admin access…' : 'Sign in to admin'}
          </button>
          <p className="mt-4 text-center text-xs text-[#8b7c72]">Admin access is limited to approved email addresses.</p>
          <ScreenLink to="track" onNavigate={onNavigate} className="mt-4 flex min-h-10 items-center justify-center text-sm font-semibold text-[#8b4a20] underline underline-offset-4">
            Back to account
          </ScreenLink>
        </form>
      </div>
    </div>
  )
}
