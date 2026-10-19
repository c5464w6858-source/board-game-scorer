import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, primaryButton, roundButton, secondaryButton } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading } from '../components/ui'
import { firstName, shortDate } from '../lib/format'
import { fetchKudos, giveKudos, kudosTags, takeBackKudos, type KudosTag } from '../lib/kudos'
import { fetchConnectionStatus, sendBuddyRequest } from '../lib/profiles'
import { leaderboard, scoreKey, setupScoring } from '../lib/roundScoring'
import { fetchRound, roundTitle } from '../lib/rounds'
import { fetchCard, fetchScores } from '../lib/scorecard'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

const toParText = (n: number) => (n === 0 ? 'E' : n > 0 ? `+${n}` : `${n}`)

export function Recap() {
  const { id = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const state = useAsync(async () => {
    const round = await fetchRound(id)
    if (!round) return null
    const [card, scores, kudos, buddies] = await Promise.all([
      round.course_id ? fetchCard(round.course_id).catch(() => null) : null,
      fetchScores(id),
      fetchKudos(id),
      fetchConnectionStatus(me),
    ])
    return { round, card, scores, kudos, buddies }
  }, [id, me])
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [shared, setShared] = useState(false)

  if (state.loading) return <Loading />
  if (state.error) return <ErrorNote message={state.error} />
  if (!state.data) return <p>Round not found.</p>
  const { round, card, scores, kudos, buddies } = state.data
  const { holes, players } = setupScoring(round, card, me)
  if (!players.some((p) => p.id === me)) {
    return <p>Only players in this round can see its recap. <Link to={`/rounds/${round.id}`}>Back to the round</Link></p>
  }

  const scoreMap = new Map(scores.map((s) => [scoreKey(s.user_id, s.hole), s.strokes]))
  const board = leaderboard(players, holes, scoreMap)
  const mine = board.find((b) => b.id === me)!
  const finished = board.every((b) => b.thru === holes.length)
  const leader = board[0]
  const rest = board.filter((b) => b.id !== me)
  const others = players.filter((p) => p.id !== me)
  const kudosOpen = Date.now() > new Date(round.tee_time).getTime() - 2 * 3600_000

  // Headline: who won, or where you stand while the round is still going.
  const tiedTop = board.filter((b) => b.points === leader.points).length > 1
  let title: string
  let subtitle: string
  if (!mine.thru) {
    title = 'No scores yet'
    subtitle = 'Open the scorecard to start the round'
  } else if (!finished) {
    title = `Thru ${mine.thru}`
    subtitle = leader.id === me ? 'You lead so far' : `${firstName(leader.name)} leads by ${leader.points - mine.points}`
  } else if (tiedTop && leader.points === mine.points) {
    title = 'All square'
    subtitle = `Tied on ${mine.points} points`
  } else if (leader.id === me) {
    const second = rest[0]
    title = 'You won'
    subtitle = second ? `Beat ${firstName(second.name)} by ${mine.points - second.points} point${mine.points - second.points === 1 ? '' : 's'}` : 'Nice round'
  } else {
    title = `${firstName(leader.name)} won`
    subtitle = `${leader.points - mine.points} point${leader.points - mine.points === 1 ? '' : 's'} behind`
  }

  const given = (to: string, tag: KudosTag) => kudos.some((k) => k.from_id === me && k.to_id === to && k.tag === tag)
  const received = kudosTags
    .map((t) => ({ ...t, count: kudos.filter((k) => k.to_id === me && k.tag === t.value).length }))
    .filter((t) => t.count)

  async function run(key: string, fn: () => Promise<void>) {
    setBusy(key)
    setError(null)
    try {
      await fn()
      state.reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  async function share() {
    const text = `${roundTitle(round)} at ${round.course?.name ?? round.course_name}: ${mine.points} Stableford points (${mine.gross} gross). Scored on BuddyGolf.`
    try {
      if (navigator.share) await navigator.share({ title: 'My round', text })
      else {
        await navigator.clipboard.writeText(text)
        setShared(true)
      }
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
            <Link to={`/rounds/${round.id}`} className="text-[15px] font-semibold text-flag no-underline">Done</Link>
          </div>
          <div className="text-[14px] text-white/75">
            {shortDate(round.tee_time)} · {round.course?.name ?? round.course_name}
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="m-0 font-display text-[40px] leading-[0.95] font-extrabold tracking-[-0.04em]">{title}</h1>
              <p className="mt-2 mb-0 text-[15px] text-white/80">{subtitle}</p>
            </div>
            <div className="shrink-0 text-right">
              <div className="font-mono text-[52px] leading-none font-semibold text-flag">{mine.points}</div>
              <div className="text-[13px] text-white/70">pts</div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5">
            {[
              ['Gross', mine.thru ? mine.gross : '–'],
              ['To par', mine.thru ? toParText(mine.toPar) : '–'],
              ['Shots', mine.playing],
            ].map(([label, v]) => (
              <div key={label} className="rounded-[18px] border border-white/10 bg-white/10 px-3.5 py-3 backdrop-blur">
                <div className="text-[12px] text-white/70">{label}</div>
                <div className="font-mono text-[24px] font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>
      }
    >
      <Section title="Leaderboard" icon="flag" action={<span className="text-[13px] text-muted">Stableford</span>}>
        <div className={`${glassCard} divide-y divide-line-soft px-4 text-fairway`}>
          {board.map((b, i) => (
            <div key={b.id} className="flex items-center gap-3 py-3">
              <span className="w-4 font-mono text-[14px] text-muted">{i + 1}</span>
              <Avatar name={b.name} src={b.avatar} size={34} />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold">{b.id === me ? 'You' : firstName(b.name)}</span>
                <span className="block text-[12px] text-muted">
                  {b.thru === holes.length ? 'Finished' : `Thru ${b.thru}`}
                  {b.thru ? <> · <span className="font-mono">{b.gross}</span> gross</> : null}
                </span>
              </span>
              <span className="font-mono text-[20px] font-semibold">{b.points}</span>
            </div>
          ))}
        </div>
        <Link to={`/rounds/${round.id}/score`} className="relative self-start text-[14px] font-semibold text-green no-underline">
          {finished ? 'See the scorecard' : 'Carry on scoring'}
        </Link>
      </Section>

      {others.length > 0 && (
        <Section title="Give kudos" icon="check">
          <p className="relative -mt-1 mb-0 text-[14px] text-muted">
            Private until everyone's given theirs, or 24 hours after tee off. Builds trust scores.
          </p>
          {others.map((p) => {
            const status = buddies.get(p.id)
            return (
              <div key={p.id} className={`${glassCard} flex flex-col gap-3 p-4 text-fairway`}>
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} src={p.avatar} size={44} />
                  <Link to={`/golfers/${p.id}`} className="flex-1 font-display text-[18px] font-bold text-fairway no-underline">{firstName(p.name)}</Link>
                  {status === 'accepted' ? (
                    <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-green"><Icon name="check" size={15} /> Buddies</span>
                  ) : status === 'pending' ? (
                    <span className="text-[13px] font-semibold text-muted">Buddy request sent</span>
                  ) : (
                    <button
                      type="button"
                      disabled={busy === `buddy:${p.id}`}
                      onClick={() => run(`buddy:${p.id}`, () => sendBuddyRequest(p.id))}
                      className={`${secondaryButton} min-h-10 gap-1.5 px-3.5 text-[14px]`}
                    >
                      <Icon name="plus" size={15} /> Buddy
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {kudosTags.map((t) => {
                    const on = given(p.id, t.value)
                    const k = `kudos:${p.id}:${t.value}`
                    return (
                      <button
                        key={t.value}
                        type="button"
                        aria-pressed={on}
                        disabled={!kudosOpen || busy === k}
                        onClick={() => run(k, () => (on ? takeBackKudos(round.id, me, p.id, t.value) : giveKudos(round.id, p.id, t.value)))}
                        className={`inline-flex min-h-10 items-center rounded-full px-3.5 text-[14px] font-semibold disabled:opacity-50 ${
                          on ? 'bg-green text-white shadow-[0_8px_16px_-10px_rgba(19,122,58,0.9)]' : 'border border-[#D8D5CA] bg-white text-fairway'
                        }`}
                      >
                        {t.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
          {!kudosOpen && <p className="relative m-0 text-[13px] text-muted">Kudos open on round day.</p>}
        </Section>
      )}

      <Section title="Kudos for you" icon="user">
        {received.length ? (
          <div className="relative flex flex-wrap gap-2">
            {received.map((t) => (
              <span key={t.value} className="inline-flex min-h-10 items-center gap-2 rounded-full bg-fairway px-3.5 text-[14px] font-semibold text-white">
                {t.label}
                {t.count > 1 && <span className="font-mono text-flag">×{t.count}</span>}
              </span>
            ))}
          </div>
        ) : (
          <div className={`${glassCard} px-4 py-4 text-[14px] text-muted`}>
            Kudos from the group show here once everyone's given theirs, or 24 hours after tee off.
          </div>
        )}
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <div className="h-24" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom)))] z-[900] mx-auto flex max-w-[480px] gap-3 bg-gradient-to-t from-[#ECEAE3] via-[#ECEAE3]/90 to-transparent px-5 pt-6 pb-3">
        <button type="button" onClick={share} className={`${secondaryButton} min-h-14 flex-1`}>
          {shared ? 'Copied' : 'Share card'}
        </button>
        {round.course_id && (
          <button type="button" onClick={() => navigate(`/host?course=${encodeURIComponent(round.course_id!)}`)} className={`${primaryButton} min-h-14 flex-1`}>
            Play here again
          </button>
        )}
      </div>
    </PhotoPage>
  )
}
