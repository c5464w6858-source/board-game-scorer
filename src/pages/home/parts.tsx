import { Link } from 'react-router-dom'
import { Avatar, AvatarStack, Icon } from '../../components/ui'
import { formatLabels, greeting, firstName, longDate, shortDate, shortName, teeTime } from '../../lib/format'
import type { Match } from '../../lib/match'
import { roundTitle, spotsLeft, type RoundRow } from '../../lib/rounds'
import { distanceText, lineup } from './helpers'
import type { HomeData } from './useHomeData'

export function Greeting({ name, onDark }: { name: string | null; onDark?: boolean }) {
  return (
    <div>
      <div className={`text-[13px] ${onDark ? 'text-white/75' : 'text-muted'}`}>{longDate(new Date())}</div>
      <h1 className="m-0 font-display text-[26px] leading-tight font-extrabold tracking-[-0.03em]">
        {greeting()}, {firstName(name)}
      </h1>
    </div>
  )
}

export function Bell({ waiting, className }: { waiting: HomeData['waiting']; className: string }) {
  return (
    <Link
      to={waiting.length ? `/rounds/${waiting[0].round.id}/requests` : '/chats'}
      aria-label={waiting.length ? `${waiting.length} join requests waiting` : 'Notifications'}
      className={`relative grid size-11 shrink-0 place-items-center rounded-full ${className}`}
    >
      <Icon name="bell" size={20} />
      {waiting.length > 0 && <span className="absolute top-[9px] right-2.5 size-[9px] rounded-full border-2 border-white bg-alert" />}
    </Link>
  )
}

export function RequestRow({ round, request }: HomeData['waiting'][number]) {
  return (
    <Link to={`/rounds/${round.id}/requests`} className="flex items-center gap-3 p-3.5 text-fairway no-underline">
      <Avatar name={request.profile?.display_name ?? 'Golfer'} src={request.profile?.avatar_url} size={40} />
      <div className="min-w-0 flex-1 text-[15px] leading-snug">
        <strong className="font-semibold">{shortName(request.profile?.display_name ?? null)}</strong> <span className="text-muted">wants to join</span>{' '}
        <strong className="font-semibold">{roundTitle(round)}</strong>
      </div>
      <span className="shrink-0 rounded-full bg-fairway px-3 py-1.5 text-sm font-semibold text-white">Review</span>
    </Link>
  )
}

// "Picked for you" card with a coloured strip for the game format.
export function PickCard({ round, match, miles, className = '' }: { round: RoundRow; match: Match; miles: number | null; className?: string }) {
  return (
    <Link to={`/rounds/${round.id}`} className={`flex w-[232px] shrink-0 snap-start flex-col overflow-hidden text-fairway no-underline ${className}`}>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between text-xs">
          <span className="rounded-full border border-line px-2 py-0.5 font-medium text-muted">{formatLabels[round.format]}</span>
          <span className="font-mono font-semibold text-green-dark">{match.percent}% match</span>
        </div>
        <div className="min-w-0">
          <div className="truncate font-display text-[18px] font-bold tracking-[-0.02em]">{roundTitle(round)}</div>
          <div className="truncate text-[13px] text-muted">{distanceText(miles) ? `${distanceText(miles)} · ` : ''}{round.course_name}</div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="font-mono text-[22px] font-semibold">{teeTime(round.tee_time)}</span>
          <span className="text-sm text-muted">{shortDate(round.tee_time)}</span>
        </div>
        <div className="mt-auto flex items-center justify-between border-t border-line-soft pt-3">
          <AvatarStack players={lineup(round)} total={round.max_players} size={26} />
          <span className="text-[13px] text-muted">{spotsLeft(round)} {spotsLeft(round) === 1 ? 'spot' : 'spots'} open</span>
        </div>
      </div>
    </Link>
  )
}
