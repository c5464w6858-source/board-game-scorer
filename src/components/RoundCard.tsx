import { Link } from 'react-router-dom'
import { AvatarStack, MatchBadge } from './ui'
import { formatLabels, shortDate, teeTime } from '../lib/format'
import type { Match } from '../lib/match'
import { acceptedPlayers, roundTitle, spotsLeft, type RoundRow } from '../lib/rounds'

const distance = (miles: number | null | undefined) =>
  miles == null ? null : miles < 0.5 ? 'At your club' : `${miles.toFixed(1)} mi`

// Compact card for the "Picked for you" carousel.
export function RoundCard({ round, match, miles }: { round: RoundRow; match?: Match; miles?: number | null }) {
  const spots = spotsLeft(round)
  const players = [
    { name: round.host?.display_name ?? 'Host', avatarUrl: round.host?.avatar_url },
    ...acceptedPlayers(round).map((p) => ({ name: p.profile?.display_name ?? 'Golfer', avatarUrl: p.profile?.avatar_url })),
  ]
  return (
    <Link
      to={`/rounds/${round.id}`}
      className="flex w-[240px] shrink-0 snap-start flex-col gap-3 rounded-[22px] border border-line bg-card p-4 text-fairway no-underline shadow-[0_12px_24px_-20px_rgba(14,31,22,0.5)]"
    >
      <div className="flex items-center justify-between">
        {match ? <MatchBadge percent={match.percent} /> : <span />}
        {distance(miles) && <span className="text-[13px] text-muted">{distance(miles)}</span>}
      </div>
      <div className="min-w-0">
        <div className="truncate font-display text-[18px] font-bold tracking-[-0.02em]">{roundTitle(round)}</div>
        <div className="truncate text-[13px] text-muted">{round.course_name}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[22px] font-semibold">{teeTime(round.tee_time)}</span>
        <span className="text-sm text-muted">{shortDate(round.tee_time)}</span>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-line-soft pt-3">
        <AvatarStack players={players} total={round.max_players} size={26} />
        <span className="text-[13px] text-muted">
          {spots} {spots === 1 ? 'spot' : 'spots'} · {formatLabels[round.format]}
        </span>
      </div>
    </Link>
  )
}
