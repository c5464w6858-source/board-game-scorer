import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, primaryButton, roundButton, secondaryButton } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading, OpenSpot } from '../components/ui'
import { firstName, handicapText, shortName, teeOffIn } from '../lib/format'
import { fetchStats } from '../lib/profiles'
import { decideRequest } from '../lib/requests'
import { acceptedPlayers, fetchRound, pendingRequests, roundTitle, spotsLeft } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'
import { TeeChip } from './home/blocks'

const statChip = 'inline-flex items-center gap-1 rounded-full bg-[#F1EFE8] px-2.5 py-1 text-[12px] font-semibold text-fairway'

export function HostRequests() {
  const { id = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const state = useAsync(async () => {
    const round = await fetchRound(id)
    if (!round) return null
    const stats = new Map(
      await Promise.all(pendingRequests(round).map(async (q) => [q.user_id, await fetchStats(q.user_id)] as const)),
    )
    return { round, stats }
  }, [id])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (state.loading) return <Loading />
  if (state.error) return <ErrorNote message={state.error} />
  if (!state.data) return <p>Round not found.</p>
  const { round, stats } = state.data
  if (round.host_id !== me) return <p>Only the host can see requests. <Link to={`/rounds/${id}`}>Back to the round</Link></p>

  const pending = pendingRequests(round)
  const players = acceptedPlayers(round)
  const spots = spotsLeft(round)
  const seats = Array.from({ length: round.max_players }, (_, i) => i)

  async function decide(requestId: string, status: 'accepted' | 'declined') {
    setBusy(requestId)
    setError(null)
    try {
      await decideRequest(requestId, status)
      state.reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  async function share() {
    const url = `${window.location.origin}/rounds/${round.id}`
    try {
      if (navigator.share) await navigator.share({ title: roundTitle(round), url })
      else await navigator.clipboard.writeText(url)
    } catch {
      /* the share sheet was dismissed */
    }
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
            <span className="text-[13px] font-semibold text-flag">{teeOffIn(round.tee_time)}</span>
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-fairway">
                <Icon name="flag" size={15} />
                You're hosting
              </span>
              {pending.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber px-3 py-1 text-[13px] font-semibold text-fairway">
                  <Icon name="clock" size={15} />
                  {pending.length} waiting
                </span>
              )}
            </div>
            <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">Requests</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">
              {roundTitle(round)} · {spots ? `${spots} spot${spots === 1 ? '' : 's'} open` : 'Your round is full'}
            </p>
          </div>
        </div>
      }
    >
      <Section title="Waiting on you" icon="clock" badge={pending.length || undefined}>
        {pending.length === 0 ? (
          <div className={`${glassCard} flex flex-col items-center gap-3 px-5 py-6 text-center text-fairway`}>
            <span className="grid size-12 place-items-center rounded-full bg-green-tint text-green"><Icon name="check" size={22} /></span>
            <div>
              <div className="font-display text-[18px] font-bold">You're all caught up</div>
              <p className="mt-1 mb-0 text-[14px] text-muted">New requests will show here. Share the round to fill your spots.</p>
            </div>
            <button type="button" onClick={share} className={`${primaryButton} gap-2`}>
              <Icon name="share" size={17} />
              Share round
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {pending.map((q) => {
              const s = stats.get(q.user_id)
              return (
                <div key={q.id} className={`${glassCard} flex flex-col gap-3 p-4 text-fairway ring-2 ring-amber/80`}>
                  <Link to={`/golfers/${q.user_id}`} className="flex items-center gap-3 text-fairway no-underline">
                    <span className="rounded-full p-[3px] ring-[2.5px] ring-amber">
                      <Avatar name={q.profile?.display_name ?? 'Golfer'} src={q.profile?.avatar_url} size={50} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[18px] font-bold tracking-[-0.01em]">{shortName(q.profile?.display_name ?? null)}</div>
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        <span className={statChip}>HCP <span className="font-mono">{handicapText(q.profile?.handicap ?? null)}</span></span>
                        {!s?.rounds ? (
                          <span className={statChip}>New golfer</span>
                        ) : (
                          <span className={statChip}><span className="font-mono">{s.rounds}</span> rounds</span>
                        )}
                        {s?.showsUpPct != null && (
                          <span className={statChip}>Shows up <span className="font-mono">{Math.round(s.showsUpPct)}%</span></span>
                        )}
                      </div>
                    </div>
                    <span className="text-muted"><Icon name="back" size={18} className="rotate-180" /></span>
                  </Link>
                  {q.message && (
                    <p className="relative m-0 rounded-2xl rounded-tl-md bg-[#FFF4E0] px-3.5 py-2.5 text-[14px] text-[#5A3E0E]">“{q.message}”</p>
                  )}
                  <div className="flex gap-2">
                    <button type="button" className={`${secondaryButton} flex-1`} disabled={busy === q.id} onClick={() => decide(q.id, 'declined')}>
                      Decline
                    </button>
                    <button type="button" className={`${primaryButton} flex-1 gap-1.5`} disabled={busy === q.id || !spots} onClick={() => decide(q.id, 'accepted')}>
                      <Icon name="check" size={17} />
                      Accept
                    </button>
                  </div>
                  {!spots && <p className="m-0 text-[13px] text-muted">Your round is full. Decline, or free up a spot first.</p>}
                </div>
              )
            })}
          </div>
        )}
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <Section title="Your group" icon="user" action={<span className="text-[13px] text-muted">{players.length + 1} of {round.max_players}</span>}>
        <div className={`${glassCard} grid gap-2 px-3 py-4 text-fairway`} style={{ gridTemplateColumns: `repeat(${round.max_players}, minmax(0, 1fr))` }}>
          {seats.map((i) => {
            if (i === 0)
              return (
                <div key="host" className="flex flex-col items-center gap-1 text-center">
                  <span className="rounded-full p-[3px] ring-[2.5px] ring-green">
                    <Avatar name={round.host?.display_name ?? 'You'} src={round.host?.avatar_url} size={50} />
                  </span>
                  <span className="text-[14px] font-semibold">You</span>
                  <span className="text-[12px] font-semibold text-green-dark">Host</span>
                </div>
              )
            const p = players[i - 1]
            if (p)
              return (
                <Link key={p.id} to={`/golfers/${p.user_id}`} className="flex flex-col items-center gap-1 text-center text-fairway no-underline">
                  <span className="rounded-full p-[3px] ring-[2.5px] ring-flag">
                    <Avatar name={p.profile?.display_name ?? 'Golfer'} src={p.profile?.avatar_url} size={50} />
                  </span>
                  <span className="text-[14px] font-semibold">{firstName(p.profile?.display_name ?? null)}</span>
                  <span className="text-[12px] text-muted">HCP <span className="font-mono">{handicapText(p.profile?.handicap ?? null)}</span></span>
                </Link>
              )
            return (
              <div key={`open${i}`} className="flex flex-col items-center gap-1 text-center">
                <span className="p-[3px]"><OpenSpot size={50} /></span>
                <span className="text-[14px] font-semibold">Open</span>
                <span className="text-[12px] text-muted">Spot {i + 1}</span>
              </div>
            )
          })}
        </div>
        <Link to={`/rounds/${round.id}`} className="relative self-start text-[14px] font-semibold text-green no-underline">
          View the round
        </Link>
      </Section>
    </PhotoPage>
  )
}
