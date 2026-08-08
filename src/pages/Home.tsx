import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useGames } from '../hooks/useGames'
import { createSession } from '../lib/sessions'
import type { Game } from '../types'

export function Home() {
  const { games } = useGames()
  const [selected, setSelected] = useState<Game | null>(null)
  const [name, setName] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  async function start() {
    if (!selected || !name.trim()) return
    setBusy(true)
    setError(null)
    try {
      const { joinCode } = await createSession(selected, name.trim())
      navigate(`/session/${joinCode}`)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not start a session')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-900">Board Game Scorer</h1>
        <p className="mt-2 text-slate-500">Pick a game to start a scoring session, synced live across everyone's phones.</p>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {games.map((game) => (
          <button
            key={game.slug}
            onClick={() => setSelected(game)}
            className={`rounded-xl border-2 p-4 text-left transition ${
              selected?.slug === game.slug ? 'border-slate-900' : 'border-transparent'
            }`}
            style={{ background: game.theme.bg, color: game.theme.text }}
          >
            <div className="text-base font-semibold">{game.name}</div>
            <div className="mt-1 text-xs opacity-70">{game.categories.length} score categories</div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="mt-8 rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="mb-3 font-semibold text-slate-800">Start &ldquo;{selected.name}&rdquo;</h2>
          <div className="flex gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && start()}
              placeholder="Your name"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2"
            />
            <button
              onClick={start}
              disabled={busy || !name.trim()}
              className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-40"
            >
              {busy ? 'Starting…' : 'Start'}
            </button>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}

      <p className="mt-10 text-center text-sm text-slate-400">
        Already have a code? <a className="underline" href="/join">Join a session</a>
      </p>
    </div>
  )
}
