import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { Button, ErrorNote, Logo } from '../components/ui'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

const field = 'min-h-12 rounded-2xl border border-line bg-card px-4'

export function Login() {
  const { session } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<{ text: string; error: boolean } | null>(null)
  const [busy, setBusy] = useState(false)

  if (session) return <Navigate to="/" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    setBusy(true)
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    setBusy(false)
    if (error) setMessage({ text: error.message, error: true })
    else if (mode === 'signup') setMessage({ text: 'Check your email to confirm your account.', error: false })
  }

  return (
    <main className="mx-auto flex min-h-full max-w-[480px] flex-col justify-center gap-6 bg-clubhouse px-5 py-10">
      <div className="flex flex-col gap-3">
        <Logo size={48} />
        <h1 className="m-0 font-display text-[34px] leading-[1.05] font-extrabold tracking-[-0.04em]">
          Find your four.
        </h1>
        <p className="m-0 text-muted">Host rounds, join games and play with golfers who match your pace.</p>
      </div>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input type="email" required autoComplete="email" aria-label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className={field} />
        <input type="password" required minLength={6} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} aria-label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className={field} />
        <Button type="submit" size="lg" full disabled={busy}>
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </Button>
      </form>
      {message &&
        (message.error ? (
          <ErrorNote message={message.text} />
        ) : (
          <p role="status" className="m-0 rounded-2xl bg-green-tint px-4 py-3 text-sm text-green-dark">{message.text}</p>
        ))}
      <button type="button" className="min-h-11 self-start text-sm font-medium text-green underline" onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}>
        {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
      </button>
    </main>
  )
}
