import { Link } from 'react-router-dom'
import { AvatarStack } from './ui'
import { formatLabels, shortDate, teeTime } from '../lib/format'
import type { Match } from '../lib/match'
import { acceptedPlayers, roundTitle, spotsLeft, type RoundRow } from '../lib/rounds'

const distance = (miles: number | null | undefined) =>
  miles == null ? null : miles < 0.5 ? 'At your club' : `${miles.toFixed(1)} mi`

// "Picked for you" card, drawn as frosted glass on the dark Home surface.
export function RoundCard({ round, match, miles }: { round: RoundRow; match?: Match; miles?: number | null }) {
  const spots = spotsLeft(round)
  const players = [
    { name: round.host?.display_name ?? 'Host', avatarUrl: round.host?.avatar_url },
    ...acceptedPlayers(round).map((p) => ({ name: p.profile?.display_name ?? 'Golfer', avatarUrl: p.profile?.avatar_url })),
  ]
  return (
    <Link
      to={`/rounds/${round.id}`}
      className="flex w-[232px] shrink-0 snap-start flex-col gap-3 rounded-[24px] border border-white/12 bg-white/[0.07] p-4 text-white no-underline backdrop-blur-xl"
    >
      <div className="flex items-center justify-between text-[13px]">
        {match ? <span className="font-mono font-semibold text-flag">{match.percent}% match</span> : <span />}
        {distance(miles) && <span className="text-muted-dark">{distance(miles)}</span>}
      </div>
      <div className="min-w-0">
        <div className="truncate font-display text-[18px] font-bold tracking-[-0.02em]">{roundTitle(round)}</div>
        <div className="truncate text-[13px] text-muted-dark">{round.course_name}</div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono text-[22px] font-semibold">{teeTime(round.tee_time)}</span>
        <span className="text-sm text-muted-dark">{shortDate(round.tee_time)}</span>
      </div>
      <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-3">
        <AvatarStack players={players} total={round.max_players} size={26} onDark />
        <span className="text-[13px] text-muted-dark">
          {spots} {spots === 1 ? 'spot' : 'spots'} · {formatLabels[round.format]}
        </span>
      </div>
    </Link>
  )
}
