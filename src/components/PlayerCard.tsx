import { computeTotal } from '../lib/scoring'
import { CategoryControl } from './CategoryControl'
import type { Game, ScoreEntry, SessionPlayer } from '../types'

interface Props {
  game: Game
  player: SessionPlayer
  sessionId: string
  scores: ScoreEntry[]
  isMe: boolean
}

export function PlayerCard({ game, player, sessionId, scores, isMe }: Props) {
  const total = computeTotal(game, player.id, scores)

  return (
    <div className="w-72 shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm">
      <div
        className="flex items-center justify-between rounded-t-xl px-4 py-3 text-white"
        style={{ background: 'var(--game-primary)' }}
      >
        <span className="font-semibold">
          {player.name}
          {isMe && <span className="ml-1 text-xs opacity-80">(you)</span>}
        </span>
        <span className="text-lg font-bold">{total}</span>
      </div>
      <div className="space-y-2 p-3">
        {game.categories.map((cat) => (
          <CategoryControl key={cat.key} category={cat} sessionId={sessionId} playerId={player.id} scores={scores} />
        ))}
      </div>
    </div>
  )
}
