import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import heroImg from '../assets/hero-green.jpg'
import { Avatar, Button, Card, ErrorNote, Icon, LinkButton, Loading, OpenSpot } from '../components/ui'
import { fetchLastMessages } from '../lib/chat'
import {
  dateAndTime,
  feeLabel,
  formatLabels,
  handicapRange,
  handicapText,
  shortDate,
  teeTime,
  firstName,
} from '../lib/format'
import { requestToJoin, withdrawRequest } from '../lib/requests'
import { acceptedPlayers, cancelRound, fetchRound, myRequest, pendingRequests, roundTitle, spotsLeft } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-clubhouse p-3.5">
      <div className="text-sm text-muted">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  )
}

export function RoundDetail() {
  const { id = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const state = useAsync(async () => {
    const round = await fetchRound(id)
    if (!round) return null
    const member = round.host_id === me || acceptedPlayers(round).some((p) => p.user_id === me)
    const last = member ? [...(await fetchLastMessages([id])).values()] : []
    return { round, member, last }
  }, [id, me])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (state.loading) return <Loading />
  if (state.error) return <ErrorNote message={state.error} />
  if (!state.data) return <p>Round not found. <Link to="/discover">Find a game</Link></p>

  const { round, member, last } = state.data
  const isHost = round.host_id === me
  const mine = myRequest(round, me)
  const spots = spotsLeft(round)
  const fee = feeLabel(round.green_fee_pence)
  const feeShort = round.green_fee_pence != null ? `£${(round.green_fee_pence / 100).toFixed(0)}` : null
  const players = acceptedPlayers(round)
  const closed = round.cancelled || new Date(round.tee_time) < new Date()

  async function run(fn: () => Promise<void>) {
    setBusy(true)
    setError(null)
    try {
      await fn()
      state.reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: roundTitle(round), url })
      else await navigator.clipboard.writeText(url)
    } catch {
      /* the share sheet was dismissed */
    }
  }

  const seats = Array.from({ length: round.max_players }, (_, i) => i)

  return (
    <div className="-mx-5 -mt-5 flex flex-col pb-28">
      <div className="relative h-[200px]">
        <img src={heroImg} alt="" className="size-full object-cover" />
        <button type="button" aria-label="Back" onClick={() => navigate(-1)} className="absolute top-4 left-4 grid size-11 place-items-center rounded-full bg-white/90">
          <Icon name="back" size={20} />
        </button>
        <button type="button" aria-label="Share round" onClick={share} className="absolute top-4 right-4 grid size-11 place-items-center rounded-full bg-white/90">
          <Icon name="share" size={19} />
        </button>
      </div>

      <div className="relative -mt-6 flex flex-col gap-[18px] rounded-t-3xl bg-clubhouse px-5 pt-[22px]">
        <div>
          <div className="text-[13px] font-semibold text-green">
            {shortDate(round.tee_time)} · Tee off <span className="font-mono">{teeTime(round.tee_time)}</span>
          </div>
          <h1 className="mt-1 mb-0.5 font-display text-[28px] font-extrabold tracking-[-0.03em]">{roundTitle(round)}</h1>
          <div className="text-sm text-muted">
            {[round.course_name, [round.course?.town, round.course?.postcode].filter(Boolean).join(' ')].filter(Boolean).join(' · ')}
          </div>
          {round.cancelled && <p className="mt-2 mb-0 font-semibold text-danger">This round was cancelled.</p>}
        </div>

        <section aria-label="Who's playing" className="grid grid-cols-4 gap-2 text-center">
          {seats.map((i) => {
            if (i === 0)
              return (
                <Link key="host" to={`/golfers/${round.host_id}`} className="flex flex-col items-center gap-1 text-fairway no-underline">
                  <Avatar name={round.host?.display_name ?? 'Host'} src={round.host?.avatar_url} size={56} ring />
                  <span className="font-semibold">{isHost ? 'You' : firstName(round.host?.display_name ?? null)}</span>
                  <span className="text-xs text-muted">Host · <span className="font-mono">{handicapText(round.host?.handicap ?? null)}</span></span>
                </Link>
              )
            const p = players[i - 1]
            if (p)
              return (
                <Link key={p.id} to={`/golfers/${p.user_id}`} className="flex flex-col items-center gap-1 text-fairway no-underline">
                  <Avatar name={p.profile?.display_name ?? 'Golfer'} src={p.profile?.avatar_url} size={56} />
                  <span className="font-semibold">{p.user_id === me ? 'You' : firstName(p.profile?.display_name ?? null)}</span>
                  <span className="text-xs text-muted">HCP <span className="font-mono">{handicapText(p.profile?.handicap ?? null)}</span></span>
                </Link>
              )
            const pendingMine = i === players.length + 1 && mine?.status === 'pending'
            return (
              <div key={`open${i}`} className="flex flex-col items-center gap-1">
                {pendingMine ? <span className="opacity-60"><Avatar name="You" size={56} /></span> : <OpenSpot size={56} />}
                <span className="font-semibold">{pendingMine ? 'You' : 'Open'}</span>
                <span className="text-xs text-muted">
                  {pendingMine ? 'Requested' : handicapRange(round.min_handicap, round.max_handicap)}
                </span>
              </div>
            )
          })}
        </section>

        <section aria-label="Round details" className="grid grid-cols-2 gap-px overflow-hidden rounded-[18px] border border-line bg-line">
          <Detail label="Format" value={formatLabels[round.format]} />
          <Detail label="Holes" value={`${round.holes}${round.walking ? ' · walking' : ''}`} />
          <Detail label="Pace" value={round.pace_note ?? 'Not set'} />
          <Detail label="Green fee" value={fee ?? 'Ask the club'} />
        </section>

        {round.notes && <p className="m-0 text-[15px]">{round.notes}</p>}

        <Card className="flex flex-col gap-2.5 p-3.5">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 font-display text-lg font-bold">Round chat</h2>
            {member ? (
              <Link to={`/rounds/${round.id}/chat`} className="text-sm font-medium text-green">Open chat</Link>
            ) : (
              <span className="text-sm text-muted">Opens once you're in</span>
            )}
          </div>
          {member && last.length === 0 && <p className="m-0 text-sm text-muted">No messages yet.</p>}
          {member && last.map((m) => <p key={m.id} className="m-0 rounded-2xl bg-chip px-3.5 py-2.5">{m.body}</p>)}
        </Card>
        {error && <ErrorNote message={error} />}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-[1000] mx-auto flex max-w-[480px] items-center justify-between gap-3 border-t border-line bg-card px-5 pt-3.5 pb-6">
        {isHost ? (
          <>
            <div>
              <div className="font-semibold">{spots ? `${spots} spot${spots === 1 ? '' : 's'} open` : 'Round is full'}</div>
              <div className="text-sm text-muted">{pendingRequests(round).length} waiting</div>
            </div>
            <div className="flex gap-2">
              {!closed && (
                <Button variant="outline" disabled={busy} onClick={() => confirm('Cancel this round?') && run(() => cancelRound(round.id))}>
                  Cancel
                </Button>
              )}
              <LinkButton to={`/rounds/${round.id}/requests`}>Requests</LinkButton>
            </div>
          </>
        ) : mine?.status === 'pending' ? (
          <>
            <div>
              <div className="font-semibold">Request sent</div>
              <div className="text-sm text-muted">Nothing to pay now.{feeShort && ` ${feeShort} at the club.`}</div>
            </div>
            <Button variant="outline" size="lg" disabled={busy} onClick={() => run(() => withdrawRequest(mine.id))}>Withdraw</Button>
          </>
        ) : mine?.status === 'accepted' ? (
          <>
            <div>
              <div className="font-semibold">You're in</div>
              <div className="text-sm text-muted">{dateAndTime(round.tee_time)}{feeShort && ` · ${feeShort} at the club`}</div>
            </div>
            <LinkButton to={`/rounds/${round.id}/chat`} size="lg">Open chat</LinkButton>
          </>
        ) : mine ? (
          <div className="font-semibold">Request {mine.status}</div>
        ) : (
          <>
            <div className="text-sm text-muted">{closed ? 'This round is closed.' : spots ? `Nothing to pay in the app.${feeShort ? ` ${feeShort} at the club.` : ''}` : 'This round is full.'}</div>
            <Button size="lg" disabled={busy || closed || !spots} onClick={() => run(() => requestToJoin(round.id))}>
              Request to join
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
