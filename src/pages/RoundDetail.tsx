import { useState, type ReactNode } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { HoleArt } from '../components/HoleArt'
import { PhotoPage } from '../components/PhotoPage'
import { RoundTags } from '../components/RoundTags'
import { Section } from '../components/Section'
import { glassCard, limeButton as lime, primaryButton as primary, roundButton, secondaryButton as secondary } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading, OpenSpot, type IconName } from '../components/ui'
import { fetchLastMessages } from '../lib/chat'
import { firstName, handicapRange, handicapText, pounds, teeOffIn } from '../lib/format'
import { requestToJoin, withdrawRequest } from '../lib/requests'
import { acceptedPlayers, cancelRound, fetchRound, myRequest, pendingRequests, roundTitle, setUrgent, spotsLeft } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'
import { fetchForecast } from '../lib/weather'
import { TeeChip } from './home/blocks'
import { Scorecard } from './home/Scorecard'
import { NeedPlayer } from './NeedPlayer'

// How this round relates to you. Each state gets its own colour, used for the
// header badge and the action bar, so they're easy to tell apart.
type Mode = 'open' | 'pending' | 'in' | 'host' | 'other'
const looks: Record<Mode, { badge: string; icon: IconName; bar: string; note: string; edge: string }> = {
  open: { badge: 'border border-white/25 bg-white/15 text-white backdrop-blur', icon: 'tee', bar: glassCard, note: 'text-muted', edge: 'ring-2 ring-green/45' },
  pending: {
    badge: 'bg-amber text-fairway',
    icon: 'clock',
    bar: 'rounded-[22px] border border-amber/50 bg-[#FFF4E0] shadow-[0_12px_28px_-16px_rgba(14,31,22,0.4)]',
    note: 'text-[#7A5414]',
    edge: 'ring-2 ring-amber/80',
  },
  in: {
    badge: 'bg-flag text-fairway',
    icon: 'check',
    bar: 'rounded-[22px] bg-fairway text-white shadow-[0_16px_32px_-16px_rgba(14,31,22,0.7)]',
    note: 'text-muted-dark',
    edge: 'ring-2 ring-[#9BCB3C]',
  },
  host: {
    badge: 'bg-white text-fairway',
    icon: 'flag',
    bar: 'rounded-[22px] bg-fairway text-white shadow-[0_16px_32px_-16px_rgba(14,31,22,0.7)]',
    note: 'text-muted-dark',
    edge: 'ring-2 ring-fairway/80',
  },
  other: { badge: 'border border-white/20 bg-white/10 text-white/80', icon: 'close', bar: glassCard, note: 'text-muted', edge: 'ring-2 ring-line' },
}

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
  // Scoring opens two hours before tee off and stays open for a day.
  const teeAt = new Date(round.tee_time).getTime()
  const roundDay = !round.cancelled && Date.now() > teeAt - 2 * 3600_000 && Date.now() < teeAt + 24 * 3600_000
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

  // An urgent round you could fill opens as the "Need a player" alert.
  if (round.urgent && !isHost && !mine && spots > 0 && !closed) {
    return <NeedPlayer round={round} forecast={forecast} busy={busy} error={error} onJoin={() => run(() => requestToJoin(round.id))} />
  }

  const seats = Array.from({ length: round.max_players }, (_, i) => i)

  // What the pinned action bar says and offers, depending on who you are.
  let status: { title: string; note: string }
  let actions: ReactNode
  let mode: Mode
  let badge: string
  if (roundDay && (isHost || mine?.status === 'accepted')) {
    mode = isHost ? 'host' : 'in'
    badge = isHost ? "You're hosting" : "You're in"
    status = { title: "It's round day", note: 'Scores update live for the group' }
    actions = <Link to={`/rounds/${round.id}/score`} className={lime}>Scorecard</Link>
  } else if (isHost) {
    mode = 'host'
    badge = "You're hosting"
    status = { title: spots ? `${spots} spot${spots === 1 ? '' : 's'} open` : 'Round full', note: waiting ? `${waiting} waiting on you` : 'No requests yet' }
    actions = (
      <Link to={`/rounds/${round.id}/requests`} className={lime}>
        Requests{waiting ? ` · ${waiting}` : ''}
      </Link>
    )
  } else if (mine?.status === 'pending') {
    mode = 'pending'
    badge = 'Request sent'
    status = { title: 'Request sent', note: fee ? `${fee} at the club if you're in` : 'Nothing to pay now' }
    actions = (
      <button type="button" className={secondary} disabled={busy} onClick={() => run(() => withdrawRequest(mine.id))}>
        Withdraw
      </button>
    )
  } else if (mine?.status === 'accepted') {
    mode = 'in'
    badge = "You're in"
    status = { title: "You're in", note: fee ? `${fee} at the club on the day` : 'Pay the club on the day' }
    actions = <Link to={`/rounds/${round.id}/chat`} className={lime}>Open chat</Link>
  } else if (mine) {
    mode = 'other'
    badge = mine.status === 'declined' ? 'Not this time' : 'Request withdrawn'
    status = { title: `Request ${mine.status}`, note: 'Plenty more games to join' }
    actions = <Link to="/discover" className={secondary}>Find a game</Link>
  } else {
    mode = closed || !spots ? 'other' : 'open'
    badge = closed ? 'Closed' : spots ? `Open game · ${spots} spot${spots === 1 ? '' : 's'}` : 'Full'
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
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${looks[mode].badge}`}>
                <Icon name={looks[mode].icon} size={15} />
                {badge}
              </span>
              {round.urgent && !closed && (
                <span className="inline-flex items-center gap-1 rounded-full bg-flag px-2.5 py-1 text-[12px] font-semibold text-fairway">
                  <Icon name="bell" size={13} /> Need a player
                </span>
              )}
              <span className="text-[13px] font-semibold text-flag">{round.cancelled ? 'Cancelled' : teeOffIn(round.tee_time)}</span>
            </div>
            <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">{roundTitle(round)}</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">
              {[round.course_name, [round.course?.town, round.course?.postcode].filter(Boolean).join(' ')].filter(Boolean).join(' · ')}
            </p>
            <div className="mt-2.5 empty:hidden"><RoundTags round={round} onDark /></div>
          </div>
        </div>
      }
    >
      {round.cancelled && (
        <p role="status" className="relative m-0 rounded-2xl bg-danger/10 px-4 py-3 text-sm font-semibold text-danger">This round was cancelled.</p>
      )}

      <Section title="Who's playing" icon="user" action={<span className="text-sm text-muted">{players.length + 1} of {round.max_players}</span>}>
        <div className={`${glassCard} grid gap-2 px-3 py-4 ${looks[mode].edge}`} style={{ gridTemplateColumns: `repeat(${round.max_players}, minmax(0, 1fr))` }}>
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
                  <span className={`rounded-full p-[3px] ${p.user_id === me ? 'ring-[2.5px] ring-green' : ''}`}>
                    <Avatar name={p.profile?.display_name ?? 'Golfer'} src={p.profile?.avatar_url} size={50} />
                  </span>
                  <span className="text-[14px] font-semibold">{p.user_id === me ? 'You' : firstName(p.profile?.display_name ?? null)}</span>
                  <span className="text-[12px] text-muted">HCP <span className="font-mono">{handicapText(p.profile?.handicap ?? null)}</span></span>
                </Seat>
              )
            const pendingMine = i === players.length + 1 && mine?.status === 'pending'
            return (
              <Seat key={`open${i}`}>
                {pendingMine ? (
                  <span className="rounded-full p-[3px] ring-[2.5px] ring-amber"><span className="block opacity-70"><Avatar name={mine?.profile?.display_name ?? 'You'} src={mine?.profile?.avatar_url} size={50} /></span></span>
                ) : (
                  <span className="p-[3px]"><OpenSpot size={50} /></span>
                )}
                <span className="text-[14px] font-semibold">{pendingMine ? 'You' : 'Open'}</span>
                <span className={`text-[12px] ${pendingMine ? 'font-semibold text-[#7A5414]' : 'text-muted'}`}>{pendingMine ? 'Requested' : handicapRange(round.min_handicap, round.max_handicap)}</span>
              </Seat>
            )
          })}
        </div>
      </Section>

      <Section title="The round" icon="tee">
        <div className={`${glassCard} overflow-hidden ${looks[mode].edge}`}>
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
            {(isHost || mine?.status === 'accepted') && !round.cancelled && (
              <Link to={`/rounds/${round.id}/score`} className="inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-green no-underline">
                <Icon name="flag" size={16} /> Open the scorecard
              </Link>
            )}
            {(isHost || mine?.status === 'accepted') && closed && !round.cancelled && (
              <Link to={`/rounds/${round.id}/recap`} className="-mt-2 inline-flex min-h-11 items-center gap-1.5 self-start text-sm font-semibold text-green no-underline">
                <Icon name="check" size={16} /> Recap and kudos
              </Link>
            )}
            {isHost && !closed && (spots > 0 || round.urgent) && (
              <div className={`flex items-center gap-3 rounded-2xl px-3.5 py-3 ${round.urgent ? 'bg-fairway text-white' : 'bg-[#F1EFE8]'}`}>
                <Icon name="bell" size={18} className={round.urgent ? 'text-flag' : 'text-green'} />
                <span className="min-w-0 flex-1 text-[14px]">
                  <span className="block font-semibold">{round.urgent ? 'Need a player is on' : 'Short of a player?'}</span>
                  <span className={`block text-[12px] ${round.urgent ? 'text-white/70' : 'text-muted'}`}>
                    {round.urgent ? 'The first golfer to say yes gets the spot' : 'Mark it urgent and the first to say yes is in'}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => setUrgent(round.id, !round.urgent))}
                  className={`min-h-10 shrink-0 rounded-full px-3.5 text-[13px] font-semibold disabled:opacity-50 ${round.urgent ? 'border border-white/25' : 'bg-fairway text-flag'}`}
                >
                  {round.urgent ? 'Turn off' : 'Need a player'}
                </button>
              </div>
            )}
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
        <div className={`${glassCard} flex flex-col gap-2 p-4 ${looks[mode].edge}`}>
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
        <div className={`${looks[mode].bar} ${looks[mode].edge} flex items-center justify-between gap-3 py-2.5 pr-2.5 pl-4`}>
          <div className="min-w-0">
            <div className="truncate font-semibold">{status.title}</div>
            <div className={`truncate text-[13px] ${looks[mode].note}`}>{status.note}</div>
          </div>
          <div className="flex shrink-0 gap-2">{actions}</div>
        </div>
      </div>
    </PhotoPage>
  )
}
