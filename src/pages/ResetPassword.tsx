import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AuthField } from '../components/AuthField'
import { Button, ErrorNote, Loading } from '../components/ui'
import { AuthShell } from './login/AuthShell'
import { useAuth } from '../lib/auth'
import { supabase } from '../lib/supabase'

// The emailed reset link signs the golfer in, then lands here to choose a new password.
export function ResetPassword() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) setError(error.message)
    else navigate('/', { replace: true })
  }

  return (
    <AuthShell label="Choose a new password" title="New password" subtitle="Pick one you’ll remember, then get back to your golf.">
      {loading ? (
        <Loading />
      ) : !session ? (
        <p className="m-0 text-[15px]">
          This reset link has expired or was already used. <Link to="/login" className="font-semibold text-green-dark">Request a new one</Link>.
        </p>
      ) : (
        <form onSubmit={submit} className="flex flex-col gap-4">
          <AuthField
            label="New password"
            type="password"
            tone="glass"
            required
            minLength={6}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          {error && <ErrorNote message={error} />}
          <Button type="submit" size="lg" full disabled={busy}>
            {busy ? 'Saving…' : 'Save password'}
          </Button>
        </form>
      )}
    </AuthShell>
  )
}
