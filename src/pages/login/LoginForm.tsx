import { useState, type FormEvent } from 'react'
import { AuthField } from '../../components/AuthField'
import { OAuthButtons } from '../../components/OAuthButtons'
import { Button, ErrorNote, Icon } from '../../components/ui'
import { enabledProviders } from '../../lib/oauth'
import { supabase } from '../../lib/supabase'

type Mode = 'signin' | 'signup' | 'forgot'
export type Tone = 'light' | 'dark'

const ctas: Record<Mode, string> = { signin: 'Sign in', signup: 'Create account', forgot: 'Send reset link' }

function ModeSwitch({ mode, onChange, tone }: { mode: Mode; onChange: (m: Mode) => void; tone: Tone }) {
  const track = tone === 'dark' ? 'bg-fairway-2' : 'bg-segment'
  const on = tone === 'dark' ? 'bg-flag text-fairway font-semibold' : 'bg-card font-semibold shadow-sm'
  const off = tone === 'dark' ? 'text-muted-dark' : 'text-muted'
  return (
    <div role="radiogroup" aria-label="Sign in or create an account" className={`flex rounded-full p-1 ${track}`}>
      {(['signin', 'signup'] as const).map((m) => (
        <button
          key={m}
          type="button"
          role="radio"
          aria-checked={mode === m}
          onClick={() => onChange(m)}
          className={`min-h-11 flex-1 rounded-full px-3 text-[15px] ${mode === m ? on : off}`}
        >
          {m === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      ))}
    </div>
  )
}

// Sign in, create account and forgot password, shared by every login layout.
export function LoginForm({ tone = 'light' }: { tone?: Tone }) {
  const [mode, setMode] = useState<Mode>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const dark = tone === 'dark'

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

  return (
    <div className="flex flex-col gap-4">
      {mode === 'forgot' ? (
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Back to sign in"
            onClick={() => switchTo('signin')}
            className={`grid size-11 shrink-0 place-items-center rounded-full border ${dark ? 'border-fairway-line bg-fairway-2 text-white' : 'border-line bg-card'}`}
          >
            <Icon name="back" size={20} />
          </button>
          <h2 className="m-0 font-display text-[22px] font-bold tracking-[-0.02em]">Reset your password</h2>
        </div>
      ) : (
        <ModeSwitch mode={mode} onChange={switchTo} tone={tone} />
      )}

      {mode !== 'forgot' && enabledProviders.length > 0 && (
        <>
          <OAuthButtons onError={setError} />
          <div className={`flex items-center gap-3 text-[13px] ${dark ? 'text-muted-dark' : 'text-muted'}`} role="separator">
            <span className={`h-px flex-1 ${dark ? 'bg-fairway-line' : 'bg-line'}`} />
            or with email
            <span className={`h-px flex-1 ${dark ? 'bg-fairway-line' : 'bg-line'}`} />
          </div>
        </>
      )}

      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <AuthField
          tone={tone}
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
            tone={tone}
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
            className={`-mt-1 min-h-11 self-end text-sm font-medium ${dark ? 'text-flag' : 'text-green'}`}
          >
            Forgot password?
          </button>
        )}
        {mode === 'forgot' && (
          <p className={`m-0 text-sm ${dark ? 'text-muted-dark' : 'text-muted'}`}>
            Enter your email and we'll send you a link to set a new password.
          </p>
        )}
        <Button type="submit" variant={dark ? 'flag' : 'primary'} size="lg" full disabled={busy}>
          {busy ? 'One moment…' : ctas[mode]}
        </Button>
      </form>

      {error && <ErrorNote message={error} />}
      {notice && (
        <p role="status" className="m-0 rounded-2xl bg-green-tint px-4 py-3 text-sm text-green-dark">
          {notice}
        </p>
      )}
    </div>
  )
}

export function FreeLine({ tone = 'light' }: { tone?: Tone }) {
  return (
    <p className={`m-0 flex items-center justify-center gap-2 text-center text-[13px] ${tone === 'dark' ? 'text-muted-dark' : 'text-muted'}`}>
      <Icon name="shield" size={16} />
      Free to join. Hosting is always free.
    </p>
  )
}
