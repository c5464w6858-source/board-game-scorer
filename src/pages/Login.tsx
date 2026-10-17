import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export function Login() {
  const { session } = useAuth()
  const [mode, setMode] = useState<'signin' | 'signup'>('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  if (session) return <Navigate to="/" replace />

  async function submit(e: FormEvent) {
    e.preventDefault()
    setMessage(null)
    const { error } =
      mode === 'signin'
        ? await supabase.auth.signInWithPassword({ email, password })
        : await supabase.auth.signUp({ email, password })
    if (error) setMessage(error.message)
    else if (mode === 'signup') setMessage('Check your email to confirm your account.')
  }

  return (
    <main className="mx-auto flex min-h-full max-w-sm flex-col justify-center gap-4 p-6">
      <h1 className="text-3xl font-bold">BuddyGolf</h1>
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded border border-green-300 p-2"
        />
        <input
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="rounded border border-green-300 p-2"
        />
        <button className="rounded bg-green-700 p-2 font-semibold text-white">
          {mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
      </form>
      {message && <p className="text-sm">{message}</p>}
      <button
        className="text-sm underline"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Need an account? Sign up' : 'Have an account? Sign in'}
      </button>
    </main>
  )
}
