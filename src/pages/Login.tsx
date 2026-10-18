import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import heroImg from '../assets/hero-green.jpg'
import { AuthField } from '../components/AuthField'
import { OAuthButtons } from '../components/OAuthButtons'
import { Button, ErrorNote, Icon, Logo, Segmented } from '../components/ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

type Mode = 'signin' | 'signup' | 'forgot'

export function Login() {
  const { session } = useAuth()
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/" replace />

  function switchTo(next: Mode) {
    setMode(next)
    setError(null)
    setNotice(null)
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : mode === 'signup'
          ? await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } })
          : await supabase.auth.resetPasswordForEmail(email, {
              redirectTo: `${window.location.origin}/reset-password`,
            })
    setBusy(false)
    if (error) return setError(error.message)
    if (mode === 'signup') setNotice(`We've sent a link to ${email}. Open it to finish signing up.`)
    if (mode === 'forgot') setNotice(`If ${email} has an account, a reset link is on its way.`)
  }

  const cta = { signin: 'Sign in', signup: 'Create account', forgot: 'Send reset link' }[mode]

  return (
    <main className="mx-auto flex min-h-full max-w-[480px] flex-col bg-clubhouse">
      <section aria-label="BuddyGolf" className="relative h-[220px] shrink-0 overflow-hidden bg-fairway text-white">
        <img src={heroImg} alt="" className="size-full object-cover opacity-80" />
        <div className="absolute inset-0 bg-gradient-to-t from-fairway via-fairway/40 to-transparent" />
        <div className="absolute top-5 left-5 flex items-center gap-2.5">
          <Logo size={36} />
          <span className="font-display text-xl font-bold tracking-[-0.02em]">BuddyGolf</span>
        </div>
        <div className="absolute inset-x-5 bottom-9">
          <h1 className="m-0 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.04em]">
            Find your four.
          </h1>
          <p className="mt-2 mb-0 text-[15px] text-muted-dark">
            Host rounds, join games and play with golfers who match your pace.
          </p>
        </div>
      </section>

      <div className="relative -mt-6 flex flex-1 flex-col gap-4 rounded-t-[28px] bg-clubhouse px-5 pt-5 pb-6">
        {mode === 'forgot' ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Back to sign in"
              onClick={() => switchTo('signin')}
              className="grid size-11 shrink-0 place-items-center rounded-full border border-line bg-card"
            >
              <Icon name="back" size={20} />
            </button>
            <h2 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em]">Reset your password</h2>
          </div>
        ) : (
          <Segmented
            label="Sign in or create an account"
            value={mode}
            onChange={switchTo}
            options={[
              { value: 'signin', label: 'Sign in' },
              { value: 'signup', label: 'Create account' },
            ]}
          />
        )}

        {mode !== 'forgot' && (
          <>
            <OAuthButtons onError={setError} />
            <div className="flex items-center gap-3 text-[13px] text-muted" role="separator">
              <span className="h-px flex-1 bg-line" />
              or with email
              <span className="h-px flex-1 bg-line" />
            </div>
          </>
        )}

        <form onSubmit={submit} className="flex flex-col gap-3.5">
          <AuthField
            label="Email"
            type="email"
            required
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          {mode !== 'forgot' && (
            <AuthField
              label="Password"
              type="password"
              required
              minLength={6}
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'signup' ? 'At least 6 characters' : ''}
            />
          )}
          {mode === 'signin' && (
            <button
              type="button"
              onClick={() => switchTo('forgot')}
              className="-mt-1 min-h-11 self-end text-sm font-medium text-green"
            >
              Forgot password?
            </button>
          )}
          {mode === 'forgot' && (
            <p className="m-0 text-sm text-muted">Enter your email and we'll send you a link to set a new password.</p>
          )}
          <Button type="submit" size="lg" full disabled={busy}>
            {busy ? 'One moment…' : cta}
          </Button>
        </form>

        {error && <ErrorNote message={error} />}
        {notice && (
          <p role="status" className="m-0 rounded-2xl bg-green-tint px-4 py-3 text-sm text-green-dark">
            {notice}
          </p>
        )}

        <p className="mt-auto mb-0 flex items-center justify-center gap-2 pt-4 text-center text-[13px] text-muted">
          <Icon name="shield" size={16} />
          Free to join. Hosting is always free.
        </p>
      </div>
    </main>
  )
}
