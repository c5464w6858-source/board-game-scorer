import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { findSessionByCode } from '../lib/sessions'

export function Join() {
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  async function go() {
    if (!code.trim()) return
    setBusy(true)
    setError(null)
    try {
      const session = await findSessionByCode(code.trim())
      if (!session) {
        setError(`No session found for "${code.trim().toUpperCase()}"`)
        return
      }
      navigate(`/session/${session.join_code}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-16 text-center">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Join a session</h1>
      <input
        autoFocus
        value={code}
        onChange={(e) => setCode(e.target.value.toUpperCase())}
        onKeyDown={(e) => e.key === 'Enter' && go()}
        placeholder="e.g. TR-4821"
        className="w-full rounded-lg border border-slate-300 px-4 py-3 text-center text-lg tracking-wider"
      />
      <button
        onClick={go}
        disabled={busy || !code.trim()}
        className="mt-4 w-full rounded-lg bg-slate-900 px-4 py-3 font-medium text-white disabled:opacity-40"
      >
        {busy ? 'Looking up…' : 'Join'}
      </button>
      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </div>
  )
}
