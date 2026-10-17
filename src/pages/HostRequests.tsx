import { Link, useParams } from 'react-router-dom'
import { Avatar, Button, Card, Empty, ErrorNote, Loading, ScreenHeader, SectionLabel } from '../components/ui'
import { handicapText, shortName } from '../lib/format'
import { fetchStats } from '../lib/profiles'
import { decideRequest } from '../lib/requests'
import { acceptedPlayers, fetchRound, pendingRequests, roundTitle, spotsLeft } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'
import { useState } from 'react'

export function HostRequests() {
  const { id = '' } = useParams()
  const me = useUserId()
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
  const spots = spotsLeft(round)

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

  return (
    <div className="flex flex-col gap-4">
      <ScreenHeader center={roundTitle(round)} />
      <h1 className="m-0 font-display text-[30px] font-extrabold tracking-[-0.03em]">Requests</h1>
      <p className="m-0 text-muted">{spots ? `${spots} spot${spots === 1 ? '' : 's'} open` : 'Your round is full'} · {acceptedPlayers(round).length + 1} of {round.max_players} in</p>
      {error && <ErrorNote message={error} />}

      <SectionLabel>Waiting on you</SectionLabel>
      {pending.length === 0 ? (
        <Empty title="No requests right now">
          <p className="m-0 text-sm text-muted">We'll show new requests here. Share the round to fill your spots.</p>
        </Empty>
      ) : (
        <div className="flex flex-col gap-3">
          {pending.map((q) => {
            const s = stats.get(q.user_id)
            return (
              <Card key={q.id} className="flex flex-col gap-3 p-4">
                <Link to={`/golfers/${q.user_id}`} className="flex items-center gap-3 text-fairway no-underline">
                  <Avatar name={q.profile?.display_name ?? 'Golfer'} src={q.profile?.avatar_url} size={48} />
                  <div className="flex-1">
                    <div className="font-semibold">{shortName(q.profile?.display_name ?? null)}</div>
                    <div className="text-sm text-muted">
                      HCP <span className="font-mono">{handicapText(q.profile?.handicap ?? null)}</span> ·{' '}
                      {s?.showsUpPct == null ? 'New' : <>shows up <span className="font-mono">{Math.round(s.showsUpPct)}%</span></>}
                      {s ? <> · <span className="font-mono">{s.rounds}</span> rounds</> : null}
                    </div>
                  </div>
                </Link>
                {q.message && <p className="m-0 rounded-2xl bg-chip px-3.5 py-2.5 text-sm">{q.message}</p>}
                <div className="flex gap-2">
                  <Button variant="outline" full disabled={busy === q.id} onClick={() => decide(q.id, 'declined')}>Decline</Button>
                  <Button full disabled={busy === q.id || !spots} onClick={() => decide(q.id, 'accepted')}>Accept</Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
