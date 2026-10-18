import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarStack, Icon } from '../../components/ui'
import { formatLabels, greeting, firstName, longDate, shortDate, shortName, teeTime } from '../../lib/format'
import type { Match } from '../../lib/match'
import { decideRequest } from '../../lib/requests'
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

// The host's pending join requests, made to stand out: it's the one thing on
// Home that needs an answer. Accept and decline work in place.
export function WaitingCard({ waiting, onDone, className }: { waiting: HomeData['waiting']; onDone: () => void; className: string }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function decide(requestId: string, status: 'accepted' | 'declined') {
    setBusy(requestId)
    setError(null)
    try {
      await decideRequest(requestId, status)
      onDone()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Lime edge marks this as the card that needs an answer. */}
      <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-flag" />
      <ul className="m-0 flex list-none flex-col divide-y divide-line-soft p-0">
        {waiting.slice(0, 3).map(({ round, request }) => (
          <li key={request.id} className="flex flex-col gap-3 py-4 pr-4 pl-5">
            <Link to={`/rounds/${round.id}/requests`} className="flex items-center gap-3 text-fairway no-underline">
              <Avatar name={request.profile?.display_name ?? 'Golfer'} src={request.profile?.avatar_url} size={44} />
              <div className="min-w-0 flex-1">
                <div className="text-[15px]">
                  <strong className="font-semibold">{shortName(request.profile?.display_name ?? null)}</strong>
                  {request.profile?.handicap != null && (
                    <span className="text-muted"> · HCP <span className="font-mono">{request.profile.handicap.toFixed(1)}</span></span>
                  )}
                </div>
                <div className="truncate text-[13px] text-muted">
                  For {roundTitle(round)} · {shortDate(round.tee_time)} <span className="font-mono">{teeTime(round.tee_time)}</span>
                </div>
              </div>
            </Link>
            {request.message && <p className="m-0 rounded-2xl bg-chip px-3.5 py-2 text-sm">“{request.message}”</p>}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={busy === request.id}
                onClick={() => decide(request.id, 'declined')}
                className="min-h-11 rounded-full border border-line bg-card font-semibold text-fairway disabled:opacity-50"
              >
                Decline
              </button>
              <button
                type="button"
                disabled={busy === request.id || spotsLeft(round) === 0}
                onClick={() => decide(request.id, 'accepted')}
                className="min-h-11 rounded-full bg-green font-semibold text-white disabled:opacity-50"
              >
                {spotsLeft(round) === 0 ? 'Round full' : 'Accept'}
              </button>
            </div>
          </li>
        ))}
      </ul>
      {waiting.length > 3 && (
        <Link to={`/rounds/${waiting[3].round.id}/requests`} className="block border-t border-line-soft py-3 text-center text-sm font-semibold text-green no-underline">
          See {waiting.length - 3} more
        </Link>
      )}
      {error && <p role="alert" className="m-0 mx-4 mb-4 rounded-2xl bg-danger/10 px-3.5 py-2 text-sm text-danger">{error}</p>}
    </div>
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
