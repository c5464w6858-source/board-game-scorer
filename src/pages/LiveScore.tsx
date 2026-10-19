import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import photo from '../assets/login-group.jpg'
import { HolePanel, SavedToast } from '../components/HolePanel'
import { Avatar, ErrorNote, Icon, Loading } from '../components/ui'
import { firstName, handicapText } from '../lib/format'
import { leaderboard, scoreKey as key, setupScoring } from '../lib/roundScoring'
import { fetchRound } from '../lib/rounds'
import { fetchCard, fetchScores, saveScores, stablefordPoints, subscribeToScores, type Score } from '../lib/scorecard'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

export function LiveScore() {
  const { id = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const state = useAsync(async () => {
    const round = await fetchRound(id)
    if (!round) return null
    const [card, scores] = await Promise.all([round.course_id ? fetchCard(round.course_id).catch(() => null) : null, fetchScores(id)])
    return { round, card, scores }
  }, [id])

  const [scores, setScores] = useState<Map<string, number>>(new Map())
  const [draft, setDraft] = useState<Map<string, number>>(new Map())
  const [hole, setHole] = useState<number | null>(null)
  const [busy, setBusy] = useState(false)
  // Which way the last hole change went, and the hole just saved, for the slide and the toast.
  const [back, setBack] = useState(false)
  const [saved, setSaved] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loaded = state.data
  useEffect(() => {
    if (!loaded) return
    setScores(new Map(loaded.scores.map((s) => [key(s.user_id, s.hole), s.strokes])))
    // Start on the first hole you haven't scored yet.
    const count = loaded.round.holes === 9 ? 9 : 18
    const mine = new Set(loaded.scores.filter((s) => s.user_id === me).map((s) => s.hole))
    setHole(Array.from({ length: count }, (_, i) => i + 1).find((h) => !mine.has(h)) ?? count)
  }, [loaded, me])

  useEffect(() => {
    if (!id) return
    return subscribeToScores(id, (s: Score) => setScores((cur) => new Map(cur).set(key(s.user_id, s.hole), s.strokes)))
  }, [id])

  const view = useMemo(() => (loaded ? { round: loaded.round, ...setupScoring(loaded.round, loaded.card, me) } : null), [loaded, me])

  if (state.loading || (loaded && hole == null)) return <Loading />
  if (state.error) return <ErrorNote message={state.error} />
  if (!loaded || !view) return <p>Round not found.</p>
  const { round, holes, tee, players } = view
  const isHost = round.host_id === me
  if (!players.some((p) => p.id === me)) {
    return <p>Only players in this round can see its scorecard. <Link to={`/rounds/${round.id}`}>Back to the round</Link></p>
  }

  const current = holes.find((h) => h.hole === hole) ?? holes[0]
  const value = (p: string) => draft.get(p) ?? scores.get(key(p, current.hole))
  const canEdit = (p: string) => p === me || isHost
  const step = (p: string, by: number) =>
    setDraft((d) => new Map(d).set(p, Math.min(20, Math.max(1, (value(p) ?? current.par) + by))))

  const board = leaderboard(players, holes, scores)
  const doneHoles = new Set(holes.filter((h) => players.every((p) => scores.has(key(p.id, h.hole)))).map((h) => h.hole))
  const last = current.hole === holes.length

  function go(h: number) {
    setDraft(new Map())
    setError(null)
    setBack(h < current.hole)
    setHole(h)
  }

  async function save() {
    // Save what was changed. Your own row saves as shown, so a par needs no taps.
    const rows = players
      .filter((p) => canEdit(p.id) && (draft.has(p.id) || (p.id === me && !scores.has(key(me, current.hole)))))
      .map((p) => ({ round_id: round.id, user_id: p.id, hole: current.hole, strokes: value(p.id) ?? current.par }))
    setBusy(true)
    setError(null)
    try {
      await saveScores(rows)
      setScores((cur) => {
        const next = new Map(cur)
        for (const r of rows) next.set(key(r.user_id, r.hole), r.strokes)
        return next
      })
      setSaved(current.hole)
      if (last) navigate(`/rounds/${round.id}/recap`)
      else go(current.hole + 1)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="relative -mx-5 -mt-5 min-h-[calc(100vh-7rem)] px-5 pt-5 text-white">
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] bg-[#0B1A12]" />
      <img
        src={photo}
        alt=""
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[360px] w-full object-cover opacity-25 [mask-image:linear-gradient(to_bottom,black,transparent)]"
      />

      <div className="relative flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <button type="button" aria-label="Back to the round" onClick={() => navigate(`/rounds/${round.id}`)} className="grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
            <Icon name="back" size={20} />
          </button>
          <span className="flex min-w-0 items-center gap-2 text-[14px] text-white/80">
            <span className="size-2 shrink-0 animate-pulse rounded-full bg-flag" />
            <span className="truncate">Live · {round.course?.name ?? round.course_name}</span>
          </span>
          <Link to={`/rounds/${round.id}/chat`} className="shrink-0 text-[14px] font-semibold text-flag no-underline">Round chat</Link>
        </div>

        <HolePanel hole={current} holeCount={holes.length} yards={view.yards(current)} tee={tee} accent="flag" back={back} seed={round.course_id ?? round.id} />

        <div className="flex gap-1" role="tablist" aria-label="Holes">
          {holes.map((h) => (
            <button
              key={h.hole}
              type="button"
              role="tab"
              aria-selected={h.hole === current.hole}
              aria-label={`Hole ${h.hole}`}
              onClick={() => go(h.hole)}
              className="flex-1 py-2"
            >
              <span className={`block h-1.5 rounded-full ${h.hole === current.hole ? 'bg-white' : doneHoles.has(h.hole) ? 'bg-flag' : 'bg-white/15'}`} />
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-2.5">
          {players.map((p) => {
            const v = value(p.id)
            const shots = p.shots(current)
            const pts = v == null ? null : stablefordPoints(v, current.par, shots)
            const editable = canEdit(p.id)
            return (
              <div key={p.id} className={`flex items-center gap-3 rounded-[22px] border px-3.5 py-3 ${p.id === me ? 'border-flag/40 bg-white/[0.09]' : 'border-white/10 bg-white/[0.05]'}`}>
                <Avatar name={p.name} src={p.avatar} size={44} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold">{p.id === me ? 'You' : firstName(p.name)}</div>
                  <div className="truncate text-[13px] text-white/60">
                    HCP <span className="font-mono">{handicapText(p.handicap)}</span> · {shots === 1 ? '1 shot' : `${shots} shots`}
                    {pts != null && <> · <span className="text-flag">{pts} pts</span></>}
                  </div>
                </div>
                {editable && (
                  <button type="button" aria-label={`One fewer for ${p.name}`} onClick={() => step(p.id, -1)} className="grid size-11 shrink-0 place-items-center rounded-full border border-white/20 text-[22px] leading-none">
                    −
                  </button>
                )}
                <span className={`w-9 text-center font-mono text-[30px] font-semibold ${v == null ? 'text-white/30' : ''}`}>{v ?? current.par}</span>
                {editable ? (
                  <button type="button" aria-label={`One more for ${p.name}`} onClick={() => step(p.id, 1)} className="grid size-11 shrink-0 place-items-center rounded-full bg-gradient-to-b from-[#DBF79A] to-flag text-[22px] leading-none text-fairway">
                    +
                  </button>
                ) : (
                  <span className="w-11 text-center text-[11px] text-white/50">their card</span>
                )}
              </div>
            )
          })}
        </div>

        {!view.hasCard && (
          <p className="m-0 rounded-2xl bg-white/[0.06] px-3.5 py-2.5 text-[13px] text-white/70">
            No scorecard for this course yet, so every hole counts as a par 4.
          </p>
        )}
        {tee && <p className="m-0 -mt-2 text-[12px] text-white/50">Shots from the {tee.name.toLowerCase()} tees{tee.slope ? ` · slope ${tee.slope}` : ''}, 95% of course handicap.</p>}

        <section className="flex flex-col gap-1 border-t border-white/10 pt-4">
          <div className="mb-1 flex justify-between text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">
            <span>Stableford points</span>
            <span className="tracking-normal normal-case">Thru {Math.max(0, ...board.map((b) => b.thru))}</span>
          </div>
          {board.map((b, i) => (
            <div key={b.id} className="flex items-center gap-3 py-1.5 text-[17px]">
              <span className="w-4 font-mono text-[14px] text-white/50">{i + 1}</span>
              <span className="flex-1">{b.id === me ? 'You' : firstName(b.name)}</span>
              <span className="font-mono text-[13px] text-white/50">{b.thru ? `${b.gross} gross` : ''}</span>
              <span className="w-10 text-right font-mono font-semibold">{b.points}</span>
            </div>
          ))}
        </section>

        {error && <ErrorNote message={error} />}
      </div>

      {saved != null && <SavedToast hole={saved} accent="flag" />}
      <div className="h-24" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom)))] z-[900] mx-auto flex max-w-[480px] gap-3 bg-gradient-to-t from-[#0B1A12] via-[#0B1A12]/90 to-transparent px-5 pt-6 pb-3">
        <button
          type="button"
          disabled={current.hole === 1}
          onClick={() => go(current.hole - 1)}
          className="min-h-14 rounded-full border border-white/25 px-6 font-semibold disabled:opacity-40"
        >
          Hole {Math.max(1, current.hole - 1)}
        </button>
        <button type="button" disabled={busy} onClick={save} className="min-h-14 flex-1 rounded-full bg-white font-semibold text-fairway disabled:opacity-60">
          {busy ? 'Saving…' : last ? 'Save · Finish' : `Save · Hole ${current.hole + 1}`}
        </button>
      </div>
    </div>
  )
}
