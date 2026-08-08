import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSessionData } from '../hooks/useSessionData'
import { getMyPlayerId } from '../lib/device'
import { joinSession } from '../lib/sessions'
import { PlayerCard } from '../components/PlayerCard'

export function Session() {
  const { joinCode = '' } = useParams()
  const { loading, error, session, game, players, scores, refresh } = useSessionData(joinCode)
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [joining, setJoining] = useState(false)

  useEffect(() => {
    setMyPlayerId(getMyPlayerId(joinCode))
  }, [joinCode])

  useEffect(() => {
    if (game) {
      document.documentElement.style.setProperty('--game-primary', game.theme.primary)
      document.documentElement.style.setProperty('--game-accent', game.theme.accent)
      document.documentElement.style.setProperty('--game-bg', game.theme.bg)
      document.documentElement.style.setProperty('--game-text', game.theme.text)
    }
  }, [game])

  if (loading) return <Centered>Loading…</Centered>
  if (error || !session || !game) return <Centered>{error ?? 'Session not found'}</Centered>

  const iKnowMyself = myPlayerId && players.some((p) => p.id === myPlayerId)

  if (!iKnowMyself) {
    return (
      <Centered>
        <div className="w-full max-w-xs rounded-xl border border-slate-200 bg-white p-6 text-center">
          <p className="mb-1 text-sm text-slate-500">Joining</p>
          <h1 className="mb-4 text-xl font-bold">{game.name}</h1>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-center"
          />
          <button
            disabled={joining || !name.trim()}
            onClick={async () => {
              setJoining(true)
              const player = await joinSession(session.id, joinCode, name.trim())
              setMyPlayerId(player.id)
              await refresh()
              setJoining(false)
            }}
            className="mt-3 w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white disabled:opacity-40"
          >
            {joining ? 'Joining…' : 'Join session'}
          </button>
        </div>
      </Centered>
    )
  }

  return (
    <div style={{ background: 'var(--game-bg)' }} className="min-h-screen">
      <header className="px-4 py-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wide" style={{ color: 'var(--game-text)' }}>
          {game.name}
        </p>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--game-text)' }}>
          Join code: {session.join_code}
        </h1>
      </header>

      <div className="flex gap-4 overflow-x-auto px-4 pb-10">
        {players.map((p) => (
          <PlayerCard key={p.id} game={game} player={p} sessionId={session.id} scores={scores} isMe={p.id === myPlayerId} />
        ))}
      </div>
    </div>
  )
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-4">{children}</div>
}
