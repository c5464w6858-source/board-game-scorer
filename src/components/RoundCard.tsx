import { Link } from 'react-router-dom'
import { MatchBadge } from './ui'
import { Chip } from './ui'
import { dateAndTime, handicapRange } from '../lib/format'
import type { Match } from '../lib/match'
import { roundTitle, spotsLeft, type RoundRow } from '../lib/rounds'

// Compact card for the "Picked for you" carousel and lists.
export function RoundCard({ round, match, miles }: { round: RoundRow; match?: Match; miles?: number | null }) {
  const spots = spotsLeft(round)
  return (
    <Link
      to={`/rounds/${round.id}`}
      className="flex w-[236px] shrink-0 flex-col gap-2.5 rounded-[20px] border border-line bg-card p-3.5 text-fairway no-underline"
    >
      <div className="flex items-center justify-between">
        {match ? <MatchBadge percent={match.percent} /> : <span />}
        {miles != null && <span className="font-mono text-[13px] text-muted">{miles.toFixed(1)} mi</span>}
      </div>
      <div>
        <div className="font-semibold">{round.course_name}</div>
        <div className="text-[13px] text-muted">
          {dateAndTime(round.tee_time)} · {spots} {spots === 1 ? 'spot' : 'spots'}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {(round.min_handicap != null || round.max_handicap != null) && (
          <Chip outline>{handicapRange(round.min_handicap, round.max_handicap)}</Chip>
        )}
        {round.walking && <Chip outline>Walking</Chip>}
        {!round.walking && roundTitle(round) !== round.course_name && <Chip outline>{roundTitle(round)}</Chip>}
      </div>
    </Link>
  )
}
