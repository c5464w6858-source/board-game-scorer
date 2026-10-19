import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HoleArt } from '../components/HoleArt'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading, OpenSpot } from '../components/ui'
import { fetchLastMessages } from '../lib/chat'
import { firstName, handicapRange, handicapText, pounds, teeOffIn } from '../lib/format'
import { requestToJoin, withdrawRequest } from '../lib/requests'
import { acceptedPlayers, cancelRound, fetchRound, myRequest, pendingRequests, roundTitle, spotsLeft } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'
import { fetchForecast } from '../lib/weather'
import { TeeChip } from './home/blocks'
import { Scorecard } from './home/Scorecard'

const roundButton = 'grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur'
const primary =
  'inline-flex min-h-12 items-center justify-center rounded-full bg-gradient-to-b from-[#1C8E47] to-green-dark px-5 font-semibold text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_10px_22px_-12px_rgba(19,122,58,0.8)] disabled:opacity-50'
const secondary = 'inline-flex min-h-12 items-center justify-center rounded-full border border-[#D8D5CA] bg-white px-5 font-semibold text-fairway no-underline disabled:opacity-50'

function Seat({ to, children }: { to?: string; children: ReactNode }) {
  const cls = 'flex flex-col items-center gap-1 text-center text-fairway no-underline'
  return to ? <Link to={to} className={cls}>{children}</Link> : <div className={cls}>{children}</div>
}

export function RoundDetail() {
  const { id = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const state = useAsync(async () => {
    const round = await fetchRound(id)
    if (!round) return null
    const member = round.host_id === me || acceptedPlayers(round).some((p) => p.user_id === me)
    const [last, forecast] = await Promise.all([
      member ? fetchLastMessages([id]).then((m) => [...m.values()]) : Promise.resolve([]),
      round.course ? fetchForecast(round.course.lat, round.course.lon, round.tee_time) : Promise.resolve(null),
    ])
    return { round, member, last, forecast }
  }, [id, me])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (state.loading) return <Loading />
  if (state.error) return <ErrorNote message={state.error} />
  if (!state.data) return <p>Round not found. <Link to="/discover">Find a game</Link></p>

  const { round, member, last, forecast } = state.data
  const isHost = round.host_id === me
  const mine = myRequest(round, me)
  const spots = spotsLeft(round)
  const fee = round.green_fee_pence != null ? pounds(round.green_fee_pence) : null
  const players = acceptedPlayers(round)
  const closed = round.cancelled || new Date(round.tee_time) < new Date()
  const waiting = pendingRequests(round).length

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

  // What the pinned action bar says and offers, depending on who you are.
  let status: { title: string; note: string }
  let actions: ReactNode
  if (isHost) {
    status = { title: spots ? `${spots} spot${spots === 1 ? '' : 's'} open` : 'Round full', note: waiting ? `${waiting} waiting on you` : 'No requests yet' }
    actions = (
      <Link to={`/rounds/${round.id}/requests`} className={primary}>
        Requests{waiting ? ` · ${waiting}` : ''}
      </Link>
    )
  } else if (mine?.status === 'pending') {
    status = { title: 'Request sent', note: fee ? `${fee} at the club if you're in` : 'Nothing to pay now' }
    actions = (
      <button type="button" className={secondary} disabled={busy} onClick={() => run(() => withdrawRequest(mine.id))}>
        Withdraw
      </button>
    )
  } else if (mine?.status === 'accepted') {
    status = { title: "You're in", note: fee ? `${fee} at the club on the day` : 'Pay the club on the day' }
    actions = <Link to={`/rounds/${round.id}/chat`} className={primary}>Open chat</Link>
  } else if (mine) {
    status = { title: `Request ${mine.status}`, note: 'Plenty more games to join' }
    actions = <Link to="/discover" className={secondary}>Find a game</Link>
  } else {
    status = {
      title: closed ? 'Round closed' : spots ? 'Free to request' : 'Round full',
      note: closed || !spots ? 'Try another game' : fee ? `${fee} at the club` : 'Pay the club on the day',
    }
    actions = (
      <button type="button" className={primary} disabled={busy || closed || !spots} onClick={() => run(() => requestToJoin(round.id))}>
        Request to join
      </button>
    )
  }

  return (
    <PhotoPage
      header={
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
              <Icon name="back" size={20} />
            </button>
            <button type="button" aria-label="Share round" onClick={share} className={roundButton}>
              <Icon name="share" size={19} />
            </button>
          </div>
          <div className="flex items-center justify-between gap-2">
            <TeeChip iso={round.tee_time} />
            {forecast && (
              <span className="rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-xs backdrop-blur">
                <span className="font-mono">{forecast.temp}°</span> · {forecast.label}
              </span>
            )}
          </div>
          <div>
            <div className="text-[13px] font-semibold text-flag">{round.cancelled ? 'Cancelled' : teeOffIn(round.tee_time)}</div>
            <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">{roundTitle(round)}</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">
              {[round.course_name, [round.course?.town, round.course?.postcode].filter(Boolean).join(' ')].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
      }
    >
      {round.cancelled && (
        <p role="status" className="relative m-0 rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">This round was cancelled.</p>
      )}

      <Section title="Who's playing" icon="user" action={<span className="text-sm text-muted">{players.length + 1} of {round.max_players}</span>}>
        <div className={`${glassCard} grid gap-2 px-3 py-4`} style={{ gridTemplateColumns: `repeat(${round.max_players}, minmax(0, 1fr))` }}>
          {seats.map((i) => {
            if (i === 0)
              return (
                <Seat key="host" to={`/golfers/${round.host_id}`}>
                  <span className="rounded-full p-[3px] ring-[2.5px] ring-flag">
                    <Avatar name={round.host?.display_name ?? 'Host'} src={round.host?.avatar_url} size={50} />
                  </span>
                  <span className="text-[14px] font-semibold">{isHost ? 'You' : firstName(round.host?.display_name ?? null)}</span>
                  <span className="text-[12px] text-muted">Host · <span className="font-mono">{handicapText(round.host?.handicap ?? null)}</span></span>
                </Seat>
              )
            const p = players[i - 1]
            if (p)
              return (
                <Seat key={p.id} to={`/golfers/${p.user_id}`}>
                  <span className="p-[3px]"><Avatar name={p.profile?.display_name ?? 'Golfer'} src={p.profile?.avatar_url} size={50} /></span>
                  <span className="text-[14px] font-semibold">{p.user_id === me ? 'You' : firstName(p.profile?.display_name ?? null)}</span>
                  <span className="text-[12px] text-muted">HCP <span className="font-mono">{handicapText(p.profile?.handicap ?? null)}</span></span>
                </Seat>
              )
            const pendingMine = i === players.length + 1 && mine?.status === 'pending'
            return (
              <Seat key={`open${i}`}>
                <span className="p-[3px]">{pendingMine ? <span className="block opacity-60"><Avatar name="You" size={50} /></span> : <OpenSpot size={50} />}</span>
                <span className="text-[14px] font-semibold">{pendingMine ? 'You' : 'Open'}</span>
                <span className="text-[12px] text-muted">{pendingMine ? 'Requested' : handicapRange(round.min_handicap, round.max_handicap)}</span>
              </Seat>
            )
          })}
        </div>
      </Section>

      <Section title="The round" icon="tee">
        <div className={`${glassCard} overflow-hidden`}>
          <HoleArt className="block h-[124px] w-full" />
          <div className="flex flex-col gap-3 p-4">
            <Scorecard round={round} />
            {round.pace_note && (
              <div className="flex items-center justify-between text-[14px]">
                <span className="text-muted">Pace</span>
                <span className="font-semibold">{round.pace_note}</span>
              </div>
            )}
            {round.notes && <p className="m-0 rounded-2xl bg-[#F1EFE8] px-3.5 py-2.5 text-[14px]">“{round.notes}”</p>}
            <p className="m-0 flex items-center gap-2 text-[13px] text-green-dark">
              <Icon name="shield" size={16} />
              Nothing to pay in the app.{fee ? ` ${fee} at the club on the day.` : ' Pay the club on the day.'}
            </p>
            {isHost && !closed && (
              <button
                type="button"
                disabled={busy}
                onClick={() => confirm('Cancel this round? Everyone in it will see it as cancelled.') && run(() => cancelRound(round.id))}
                className="min-h-11 self-start text-sm font-semibold text-danger disabled:opacity-50"
              >
                Cancel round
              </button>
            )}
          </div>
        </div>
      </Section>

      <Section
        title="Round chat"
        icon="chat"
        action={member ? <Link to={`/rounds/${round.id}/chat`} className="text-sm font-semibold text-green no-underline">Open</Link> : undefined}
      >
        <div className={`${glassCard} flex flex-col gap-2 p-4`}>
          {!member ? (
            <p className="m-0 flex items-center gap-2 text-[14px] text-muted">
              <Icon name="lock" size={16} /> The chat opens once you're in.
            </p>
          ) : last.length === 0 ? (
            <p className="m-0 text-[14px] text-muted">No messages yet. Say hello.</p>
          ) : (
            last.map((m) => <p key={m.id} className="m-0 rounded-2xl bg-[#F1EFE8] px-3.5 py-2.5 text-[14px]">{m.body}</p>)
          )}
        </div>
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      {/* Pinned just above the tab bar so it's never hidden. */}
      <div className="h-24" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom)))] z-[900] mx-auto max-w-[480px] bg-gradient-to-t from-[#ECEAE3] via-[#ECEAE3]/90 to-transparent px-5 pt-6 pb-3">
        <div className={`${glassCard} flex items-center justify-between gap-3 py-2.5 pr-2.5 pl-4`}>
          <div className="min-w-0">
            <div className="truncate font-semibold">{status.title}</div>
            <div className="truncate text-[13px] text-muted">{status.note}</div>
          </div>
          <div className="flex shrink-0 gap-2">{actions}</div>
        </div>
      </div>
    </PhotoPage>
  )
}
