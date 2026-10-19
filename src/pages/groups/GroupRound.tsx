import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import photo from '../../assets/login-group.jpg'
import { Avatar, ErrorNote, Icon, Loading } from '../../components/ui'
import { firstName, handicapText } from '../../lib/format'
import { deleteGroupRound, fetchGroup, fetchGroupScores, saveGroupScores, subscribeToGroupScores, type GroupScore } from '../../lib/groups'
import { leaderboard, scoreKey as key, scoringFor } from '../../lib/roundScoring'
import { ballsOf, deleteMatch, fetchMatches, matchState } from '../../lib/ryder'
import { fetchCard, stablefordPoints } from '../../lib/scorecard'
import { MatchRow } from './RyderBoard'
import { useAsync } from '../../lib/useAsync'
import { useUserId } from '../../lib/useMe'

const cardKey = (roundId: string) => `buddygolf-group-card-${roundId}`
function loadCard(roundId: string, fallback: string[]): string[] {
  try {
    const saved = JSON.parse(localStorage.getItem(cardKey(roundId)) ?? 'null')
    return Array.isArray(saved) && saved.length ? saved : fallback
  } catch {
    return fallback
  }
}

// Scoring a society or trip round. Any golfer in the group can keep the card
// for their fourball; everyone sees the leaderboard update live.
export function GroupRound() {
  const { id = '', roundId = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const state = useAsync(async () => {
    const group = await fetchGroup(id)
    const round = group?.group_rounds.find((r) => r.id === roundId)
    if (!group || !round) return null
    const [card, scores, matches] = await Promise.all([
      round.course_id ? fetchCard(round.course_id).catch(() => null) : null,
      fetchGroupScores([roundId]),
      group.ryder_cup ? fetchMatches([roundId]) : Promise.resolve([]),
    ])
    return { group, round, card, scores, matches }
  }, [id, roundId])

  const [scores, setScores] = useState<Map<string, number>>(new Map())
  const [draft, setDraft] = useState<Map<string, number>>(new Map())
  const [mine, setMine] = useState<string[]>(() => loadCard(roundId, [me]))
  const [picking, setPicking] = useState(false)
  const [hole, setHole] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loaded = state.data
  useEffect(() => {
    if (!loaded) return
    setScores(new Map(loaded.scores.map((s) => [key(s.user_id, s.hole), s.strokes])))
    const count = loaded.round.holes === 9 ? 9 : 18
    const done = new Set(loaded.scores.filter((s) => s.user_id === me).map((s) => s.hole))
    setHole(Array.from({ length: count }, (_, i) => i + 1).find((h) => !done.has(h)) ?? count)
  }, [loaded, me])

  useEffect(() => {
    if (!roundId) return
    return subscribeToGroupScores(roundId, (s: GroupScore) => setScores((cur) => new Map(cur).set(key(s.user_id, s.hole), s.strokes)))
  }, [roundId])

  useEffect(() => {
    try {
      localStorage.setItem(cardKey(roundId), JSON.stringify(mine))
    } catch {
      /* storage unavailable */
    }
  }, [roundId, mine])

  const view = useMemo(() => {
    if (!loaded) return null
    const roster = loaded.group.group_members.map((m) => ({
      id: m.user_id,
      name: m.profile?.display_name ?? 'Golfer',
      avatar: m.profile?.avatar_url ?? null,
      handicap: m.profile?.handicap ?? null,
    }))
    return scoringFor(loaded.round, loaded.card, roster)
  }, [loaded])

  if (state.loading || (loaded && hole == null)) return <Loading />
  if (state.error) return <ErrorNote message={state.error} />
  if (!loaded || !view) return <p>Round not found. <Link to={`/groups/${id}`}>Back to the group</Link></p>
  const { group, round } = loaded
  const { holes, players, tee } = view
  const organiser = group.group_members.some((m) => m.user_id === me && m.role === 'organiser')
  const current = holes.find((h) => h.hole === hole) ?? holes[0]
  const card = players.filter((p) => mine.includes(p.id))
  const value = (p: string) => draft.get(p) ?? scores.get(key(p, current.hole))
  const step = (p: string, by: number) => setDraft((d) => new Map(d).set(p, Math.min(20, Math.max(1, (value(p) ?? current.par) + by))))
  const board = leaderboard(players, holes, scores).filter((b) => b.thru > 0)
  const doneHoles = new Set(holes.filter((h) => card.length && card.every((p) => scores.has(key(p.id, h.hole)))).map((h) => h.hole))
  const last = current.hole === holes.length
  const playing = new Map(players.map((p) => [p.id, p.playing]))
  const matches = loaded.matches.map((m) => ({ ...m, state: matchState(m, holes, scores, playing) }))
  // In foursomes the pair's one ball is scored under its first player.
  const pairName = new Map(
    matches
      .filter((m) => m.format === 'foursomes')
      .flatMap((m) => [m.side_a, m.side_b])
      .map((side) => [side[0], side.map((id) => (id === me ? 'You' : firstName(players.find((p) => p.id === id)?.name ?? null))).join(' & ')]),
  )

  function go(h: number) {
    setDraft(new Map())
    setError(null)
    setHole(h)
  }

  async function save() {
    // Save what was changed, plus anyone on your card not yet scored on this hole, as shown.
    const rows = card
      .filter((p) => draft.has(p.id) || !scores.has(key(p.id, current.hole)))
      .map((p) => ({ group_round_id: round.id, user_id: p.id, hole: current.hole, strokes: value(p.id) ?? current.par }))
    setBusy(true)
    setError(null)
    try {
      await saveGroupScores(rows)
      setScores((cur) => {
        const next = new Map(cur)
        for (const r of rows) next.set(key(r.user_id, r.hole), r.strokes)
        return next
      })
      if (last) navigate(`/groups/${id}`)
      else go(current.hole + 1)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative -mx-5 -mt-5 min-h-[calc(100vh-7rem)] px-5 pt-5 text-white">
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] bg-[#0A1428]" />
      <img src={photo} alt="" aria-hidden="true" className="absolute inset-x-0 top-0 h-[360px] w-full object-cover opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <button type="button" aria-label="Back to the group" onClick={() => navigate(`/groups/${id}`)} className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
            <Icon name="back" size={20} />
          </button>
          <span className="flex min-w-0 items-center gap-2 text-[14px] text-white/80">
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-gold" />
            <span className="truncate">{group.name} · {round.title || round.course_name}</span>
          </span>
        </div>

        <div className="flex items-end justify-between">
          <div>
            <div className="text-[14px] text-white/70">Hole</div>
            <div className="font-display text-[88px] leading-[0.85] font-extrabold tracking-[-0.04em]">{current.hole}</div>
          </div>
          <div className="flex gap-5 text-right">
            {[
              ['Par', current.par],
              ['Yds', current.yards ?? '–'],
              ['SI', current.stroke_index],
            ].map(([label, v]) => (
              <div key={label}>
                <div className="text-[13px] text-white/60">{label}</div>
                <div className="font-mono text-[28px] font-semibold">{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-1" role="tablist" aria-label="Holes">
          {holes.map((h) => (
            <button key={h.hole} type="button" role="tab" aria-selected={h.hole === current.hole} aria-label={`Hole ${h.hole}`} onClick={() => go(h.hole)} className="flex-1 py-2">
              <span className={`block h-1.5 rounded-full ${h.hole === current.hole ? 'bg-white' : doneHoles.has(h.hole) ? 'bg-gold' : 'bg-white/15'}`} />
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">Your card</span>
          <button type="button" onClick={() => setPicking((p) => !p)} className="text-[14px] font-semibold text-gold">
            {picking ? 'Done' : `Scoring for ${card.length} · Change`}
          </button>
        </div>

        {picking && (
          <div className="flex flex-wrap gap-2">
            {players.map((p) => {
              const on = mine.includes(p.id)
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => setMine((cur) => (on ? cur.filter((x) => x !== p.id) : [...cur, p.id]))}
                  className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold ${on ? 'bg-gold text-navy' : 'border border-white/20 text-white/80'}`}
                >
                  {on && <Icon name="check" size={14} />}
                  {p.id === me ? 'You' : firstName(p.name)}
                </button>
              )
            })}
          </div>
        )}

        <div className="flex flex-col gap-2.5">
          {card.map((p) => {
            const v = value(p.id)
            const shots = p.shots(current)
            const pts = v == null ? null : stablefordPoints(v, current.par, shots)
            return (
              <div key={p.id} className={`flex items-center gap-3 rounded-[22px] border px-3.5 py-3 ${p.id === me ? 'border-gold/40 bg-white/[0.09]' : 'border-white/10 bg-white/[0.05]'}`}>
                <Avatar name={p.name} src={p.avatar} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{pairName.get(p.id) ?? (p.id === me ? 'You' : firstName(p.name))}</div>
                  <div className="truncate text-[13px] text-white/60">
                    HCP <span className="font-mono">{handicapText(p.handicap)}</span> · {shots === 1 ? '1 shot' : `${shots} shots`}
                    {pts != null && <> · <span className="text-gold">{pts} pts</span></>}
                  </div>
                </div>
                <button type="button" aria-label={`One fewer for ${p.name}`} onClick={() => step(p.id, -1)} className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 text-[22px] leading-none">
                  −
                </button>
                <span className={`w-9 text-center font-mono text-[30px] font-semibold ${v == null ? 'text-white/30' : ''}`}>{v ?? current.par}</span>
                <button type="button" aria-label={`One more for ${p.name}`} onClick={() => step(p.id, 1)} className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#ECCB7A] to-gold text-[22px] leading-none text-navy">
                  +
                </button>
              </div>
            )
          })}
          {!card.length && <p className="m-0 text-[14px] text-white/70">Pick who you’re scoring for with “Change”.</p>}
        </div>

        {tee && <p className="m-0 -mt-2 text-[12px] text-white/50">Shots from the {tee.name.toLowerCase()} tees{tee.slope ? ` · slope ${tee.slope}` : ''}, 95% of course handicap.</p>}

        {group.ryder_cup && (
          <section className="flex flex-col gap-2 border-t border-white/10 pt-4">
            <div className="flex justify-between text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">
              <span>Matches</span>
              {organiser && (
                <Link to={`/groups/${id}/rounds/${round.id}/matches/new`} className="tracking-normal text-gold normal-case no-underline">
                  + Add match
                </Link>
              )}
            </div>
            {matches.length ? (
              matches.map((m) => (
                <div key={m.id} className="overflow-hidden rounded-[18px] bg-cream">
                  <MatchRow g={group} m={m} me={me} />
                  <div className="flex justify-between border-t border-line-soft px-3 py-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        setMine([...ballsOf(m.side_a, m.format), ...ballsOf(m.side_b, m.format)])
                        setPicking(false)
                      }}
                      className="min-h-9 text-[13px] font-semibold text-team-blue"
                    >
                      Score this match
                    </button>
                    {organiser && (
                      <button
                        type="button"
                        onClick={() => confirm('Remove this match?') && deleteMatch(m.id).then(() => state.reload(), (e: Error) => setError(e.message))}
                        className="min-h-9 text-[13px] font-semibold text-muted"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="m-0 text-[14px] text-white/60">{organiser ? 'Add the matches for this round.' : 'No matches set for this round yet.'}</p>
            )}
          </section>
        )}

        <section className="flex flex-col gap-1 border-t border-white/10 pt-4">
          <div className="mb-1 flex justify-between text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">
            <span>Round leaderboard</span>
            <span className="tracking-normal normal-case">Stableford</span>
          </div>
          {board.length ? (
            board.map((b, i) => (
              <div key={b.id} className="flex items-center gap-3 py-1.5 text-[17px]">
                <span className={`w-5 font-mono text-[14px] ${i === 0 ? 'text-gold' : 'text-white/50'}`}>{i + 1}</span>
                <span className="flex-1 truncate">{b.id === me ? 'You' : firstName(b.name)}</span>
                <span className="font-mono text-[13px] text-white/50">thru {b.thru}</span>
                <span className="w-10 text-right font-mono font-semibold">{b.points}</span>
              </div>
            ))
          ) : (
            <p className="m-0 text-[14px] text-white/60">No scores yet.</p>
          )}
        </section>

        {organiser && (
          <button
            type="button"
            onClick={() => confirm('Remove this round and its scores?') && deleteGroupRound(round.id).then(() => navigate(`/groups/${id}`), (e: Error) => setError(e.message))}
            className="min-h-11 self-start text-[13px] font-semibold text-white/50"
          >
            Remove round
          </button>
        )}
        {error && <ErrorNote message={error} />}
      </div>

      <div className="h-24" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom)))] z-[900] mx-auto flex max-w-[480px] gap-3 bg-gradient-to-t from-[#0A1428] via-[#0A1428]/90 to-transparent px-5 pt-6 pb-3">
        <button type="button" disabled={current.hole === 1} onClick={() => go(current.hole - 1)} className="min-h-14 rounded-full border border-white/25 px-6 font-semibold disabled:opacity-40">
          Hole {Math.max(1, current.hole - 1)}
        </button>
        <button type="button" disabled={busy || !card.length} onClick={save} className="min-h-14 flex-1 rounded-full bg-gradient-to-b from-[#ECCB7A] to-gold font-semibold text-navy disabled:opacity-60">
          {busy ? 'Saving…' : last ? 'Save · Finish' : `Save · Hole ${current.hole + 1}`}
        </button>
      </div>
    </div>
  )
}
