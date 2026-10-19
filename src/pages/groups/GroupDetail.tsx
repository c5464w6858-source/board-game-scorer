import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Switch } from '../../components/controls'
import { PhotoPage } from '../../components/PhotoPage'
import { Section } from '../../components/Section'
import { glassCard, goldButton, navyButton, roundButton } from '../../components/surfaces'
import { Avatar, AvatarStack, ErrorNote, Icon, Loading } from '../../components/ui'
import { firstName, handicapText, shortName, teeTime } from '../../lib/format'
import { fetchGroup, fetchGroupScores, inviteLink, kindLabel, leaveGroup, setMemberRole, type GroupRow } from '../../lib/groups'
import { leaderboard, scoreKey, scoringFor, type Player } from '../../lib/roundScoring'
import { fetchMatches, matchState, updateGroup } from '../../lib/ryder'
import { fetchCard, type Card } from '../../lib/scorecard'
import { useAsync } from '../../lib/useAsync'
import { useUserId } from '../../lib/useMe'
import { dateRange } from './helpers'
import { MatchRow, RyderScore, type MatchView } from './RyderBoard'

const roster = (g: GroupRow): Player[] =>
  g.group_members.map((m) => ({
    id: m.user_id,
    name: m.profile?.display_name ?? 'Golfer',
    avatar: m.profile?.avatar_url ?? null,
    handicap: m.profile?.handicap ?? null,
  }))

// Stableford points for every round, and the running total per golfer.
function standings(g: GroupRow, cards: Map<string, Card | null>, scores: Awaited<ReturnType<typeof fetchGroupScores>>) {
  const players = roster(g)
  const perRound = new Map<string, ReturnType<typeof leaderboard>>()
  const totals = new Map<string, { points: number; rounds: number; best: number }>()
  for (const r of g.group_rounds) {
    const map = new Map(scores.filter((s) => s.group_round_id === r.id).map((s) => [scoreKey(s.user_id, s.hole), s.strokes]))
    if (!map.size) continue
    const { holes, players: scored } = scoringFor(r, cards.get(r.course_id ?? '') ?? null, players)
    const board = leaderboard(scored, holes, map).filter((b) => b.thru > 0)
    perRound.set(r.id, board)
    for (const b of board) {
      const t = totals.get(b.id) ?? { points: 0, rounds: 0, best: 0 }
      totals.set(b.id, { points: t.points + b.points, rounds: t.rounds + 1, best: Math.max(t.best, b.points) })
    }
  }
  const table = players
    .filter((p) => totals.has(p.id))
    .map((p) => ({ ...p, ...totals.get(p.id)! }))
    .sort((a, b) => b.points - a.points || b.best - a.best)
  return { perRound, table }
}

export function GroupDetail() {
  const { id = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const state = useAsync(async () => {
    const group = await fetchGroup(id)
    if (!group) return null
    const courseIds = [...new Set(group.group_rounds.map((r) => r.course_id).filter((c): c is string => Boolean(c)))]
    const roundIds = group.group_rounds.map((r) => r.id)
    const [cardList, scores, matches] = await Promise.all([
      Promise.all(courseIds.map((c) => fetchCard(c).catch(() => null))),
      fetchGroupScores(roundIds),
      group.ryder_cup ? fetchMatches(roundIds) : Promise.resolve([]),
    ])
    const cards = new Map(courseIds.map((c, i) => [c, cardList[i]]))
    // Each match's live state, from its round's card, handicaps and scores.
    const scoreMap = new Map(scores.map((s) => [`${s.group_round_id}|${scoreKey(s.user_id, s.hole)}`, s.strokes]))
    const matchViews: MatchView[] = matches.map((m) => {
      const r = group.group_rounds.find((x) => x.id === m.group_round_id)!
      const { holes, players } = scoringFor(r, cards.get(r.course_id ?? '') ?? null, roster(group))
      const roundScores = new Map([...scoreMap].filter(([k]) => k.startsWith(`${r.id}|`)).map(([k, v]) => [k.slice(r.id.length + 1), v]))
      return { ...m, state: matchState(m, holes, roundScores, new Map(players.map((p) => [p.id, p.playing]))) }
    })
    return { group, matches: matchViews, ...standings(group, cards, scores) }
  }, [id])
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (state.loading) return <Loading />
  if (state.error) return <ErrorNote message={state.error} />
  if (!state.data) return <p>Group not found. <Link to="/groups">Back to your groups</Link></p>
  const { group: g, perRound, table, matches } = state.data
  const organiser = g.group_members.some((m) => m.user_id === me && m.role === 'organiser')
  const now = Date.now()
  const link = inviteLink(g.invite_code)

  async function share() {
    try {
      if (navigator.share) await navigator.share({ title: `Join ${g.name} on BuddyGolf`, text: `Join ${g.name} on BuddyGolf with code ${g.invite_code}`, url: link })
      else {
        await navigator.clipboard.writeText(link)
        setCopied(true)
      }
    } catch {
      /* the share sheet was dismissed */
    }
  }

  async function run(fn: () => Promise<void>) {
    setError(null)
    try {
      await fn()
      state.reload()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <PhotoPage
      tone="navy"
      header={
        <div className="flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <button type="button" aria-label="Back" onClick={() => navigate('/groups')} className={roundButton}>
              <Icon name="back" size={20} />
            </button>
            <button type="button" aria-label="Invite golfers" onClick={share} className={roundButton}>
              <Icon name="share" size={19} />
            </button>
          </div>
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[13px] font-semibold text-navy">
                <Icon name="flag" size={14} /> {kindLabel(g.kind)}
              </span>
              {dateRange(g.starts_on, g.ends_on) && <span className="text-[13px] font-semibold text-gold-soft">{dateRange(g.starts_on, g.ends_on)}</span>}
            </div>
            <h1 className="m-0 font-display text-[32px] leading-[1.02] font-extrabold tracking-[-0.035em]">{g.name}</h1>
            <div className="mt-2 flex items-center gap-3">
              <AvatarStack
                players={g.group_members.slice(0, 5).map((m) => ({ name: m.profile?.display_name ?? 'Golfer', avatarUrl: m.profile?.avatar_url }))}
                total={Math.min(5, g.group_members.length)}
                size={28}
                onDark
              />
              <span className="text-sm text-white/80">
                {[g.location, `${g.group_members.length} golfer${g.group_members.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
              </span>
            </div>
          </div>
        </div>
      }
    >
      {g.description && <p className={`${glassCard} relative m-0 px-4 py-3.5 text-[15px] text-navy`}>{g.description}</p>}

      {organiser && (
        <div className={`${glassCard} relative overflow-hidden text-navy`}>
          <Switch
            label={
              <span className="flex items-center gap-2.5">
                <span className="flex shrink-0">
                  <span className="size-5 rounded-full bg-team-blue ring-2 ring-white" />
                  <span className="-ml-1.5 size-5 rounded-full bg-team-red ring-2 ring-white" />
                </span>
                Run it as a Ryder Cup
              </span>
            }
            hint="Two teams, fourballs, foursomes and singles"
            checked={g.ryder_cup}
            onChange={(ryder_cup) => run(() => updateGroup(g.id, { ryder_cup }))}
          />
        </div>
      )}

      {g.ryder_cup && (
        <Section
          tone="navy"
          title="Ryder Cup"
          icon="flag"
          action={
            organiser ? (
              <Link to={`/groups/${g.id}/ryder`} className="text-[13px] font-semibold text-[#6B5A2E] no-underline">
                Teams
              </Link>
            ) : undefined
          }
        >
          <RyderScore g={g} matches={matches} />
          {organiser && !g.group_members.some((m) => m.team) && (
            <Link to={`/groups/${g.id}/ryder`} className={`${glassCard} relative flex items-center gap-3 px-4 py-3.5 text-navy no-underline ring-2 ring-gold/70`}>
              <Icon name="user" size={18} className="shrink-0 text-[#6B5A2E]" />
              <span className="min-w-0 flex-1">
                <span className="block font-semibold">Name the teams and pick sides</span>
                <span className="block text-[13px] text-muted">Then add matches to each round</span>
              </span>
              <Icon name="back" size={16} className="rotate-180 text-muted" />
            </Link>
          )}
          {g.group_rounds
            .filter((r) => matches.some((m) => m.group_round_id === r.id))
            .map((r) => (
              <div key={r.id} className={`${glassCard} divide-y divide-line-soft overflow-hidden text-navy`}>
                <div className="px-4 pt-3 pb-2 text-[12px] font-semibold tracking-[0.06em] text-muted uppercase">{r.title || r.course_name}</div>
                {matches
                  .filter((m) => m.group_round_id === r.id)
                  .map((m) => <MatchRow key={m.id} g={g} m={m} me={me} to={`/groups/${g.id}/rounds/${r.id}`} />)}
              </div>
            ))}
          {!matches.length && (
            <p className="relative m-0 text-[14px] text-muted">
              {organiser ? 'Open a round in the schedule to set its matches.' : 'Your organiser will set the matches for each round.'}
            </p>
          )}
        </Section>
      )}

      <Section tone="navy" title={g.kind === 'society' ? 'Order of merit' : 'Leaderboard'} icon="flag" action={<span className="text-[13px] text-muted">Stableford</span>}>
        {table.length ? (
          <div className={`${glassCard} divide-y divide-line-soft overflow-hidden px-4 text-navy`}>
            {table.map((p, i) => (
              <div key={p.id} className={`flex items-center gap-3 py-3 ${p.id === me ? 'font-semibold' : ''}`}>
                <span className={`grid size-7 place-items-center rounded-full font-mono text-[13px] font-semibold ${i === 0 ? 'bg-gold text-navy' : 'text-muted'}`}>{i + 1}</span>
                <Avatar name={p.name} src={p.avatar} size={34} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{p.id === me ? 'You' : shortName(p.name)}</span>
                  <span className="block text-[12px] font-normal text-muted">
                    {p.rounds} round{p.rounds === 1 ? '' : 's'} · best <span className="font-mono">{p.best}</span>
                  </span>
                </span>
                <span className="font-mono text-[20px] font-semibold">{p.points}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className={`${glassCard} px-4 py-4 text-[14px] text-muted`}>The leaderboard fills up as rounds are scored.</div>
        )}
      </Section>

      <Section tone="navy" title="Schedule" icon="clock" badge={g.group_rounds.length || undefined}>
        {g.group_rounds.length ? (
          <div className="flex flex-col gap-2.5">
            {g.group_rounds.map((r, i) => {
              const board = perRound.get(r.id)
              const started = new Date(r.tee_time).getTime() - 2 * 3600_000 < now
              const day = new Date(r.tee_time).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' })
              return (
                <Link key={r.id} to={`/groups/${g.id}/rounds/${r.id}`} className={`${glassCard} flex items-center gap-3 p-3.5 text-navy no-underline`}>
                  <span className="flex w-14 shrink-0 flex-col items-center rounded-2xl bg-navy py-2 text-white">
                    <span className="text-[11px] font-semibold text-gold uppercase">R{i + 1}</span>
                    <span className="font-mono text-[14px] font-semibold">{teeTime(r.tee_time)}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{r.title || r.course_name}</span>
                    <span className="block truncate text-[13px] text-muted">
                      {day}
                      {r.title ? ` · ${r.course_name}` : ''}
                    </span>
                    {board?.length ? (
                      <span className="mt-1 block truncate text-[13px] font-semibold text-[#6B5A2E]">
                        {board[0].id === me ? 'You lead' : `${firstName(board[0].name)} leads`} · {board[0].points} pts
                      </span>
                    ) : started ? (
                      <span className="mt-1 block text-[13px] font-semibold text-[#6B5A2E]">Ready to score</span>
                    ) : null}
                  </span>
                  <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-gold py-1.5 pr-2 pl-3 text-[13px] font-semibold text-navy">
                    Scorecard <Icon name="back" size={14} className="rotate-180" />
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className={`${glassCard} px-4 py-4 text-[14px] text-muted`}>
            {organiser ? 'Add the rounds you’ve booked, one per tee time.' : 'Your organiser hasn’t added any rounds yet.'}
          </div>
        )}
        {organiser && (
          <Link to={`/groups/${g.id}/rounds/new`} className={`${navyButton} relative gap-2 self-start`}>
            <Icon name="plus" size={17} /> Add a round
          </Link>
        )}
      </Section>

      <Section tone="navy" title="Golfers" icon="user" action={<span className="text-[13px] text-muted">{g.group_members.length}</span>}>
        <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-navy`}>
          {g.group_members.map((m) => (
            <div key={m.user_id} className="flex items-center gap-3 px-4 py-3">
              <Link to={`/golfers/${m.user_id}`} className="flex min-w-0 flex-1 items-center gap-3 text-navy no-underline">
                <Avatar name={m.profile?.display_name ?? 'Golfer'} src={m.profile?.avatar_url} size={38} />
                <span className="min-w-0">
                  <span className="block truncate font-semibold">{m.user_id === me ? 'You' : shortName(m.profile?.display_name ?? null)}</span>
                  <span className="block text-[12px] text-muted">HCP <span className="font-mono">{handicapText(m.profile?.handicap ?? null)}</span></span>
                </span>
              </Link>
              {g.ryder_cup && m.team && (
                <span className={`size-3 shrink-0 rounded-full ${m.team === 1 ? 'bg-team-blue' : 'bg-team-red'}`} title={m.team === 1 ? g.team_a_name : g.team_b_name} />
              )}
              {m.role === 'organiser' ? (
                <span className="rounded-full bg-gold-soft px-2.5 py-1 text-[12px] font-semibold text-[#6B5A2E]">Organiser</span>
              ) : (
                organiser && (
                  <button type="button" onClick={() => run(() => setMemberRole(g.id, m.user_id, 'organiser'))} className="min-h-10 px-2 text-[12px] font-semibold text-muted">
                    Make organiser
                  </button>
                )
              )}
            </div>
          ))}
        </div>
      </Section>

      <Section tone="navy" title="Invite" icon="send">
        <div className={`${glassCard} flex flex-col items-center gap-3 px-4 py-5 text-center text-navy`}>
          <span className="text-[13px] text-muted">Share this code or link. Anyone with it can join.</span>
          <span className="rounded-2xl bg-navy px-5 py-2.5 font-mono text-[28px] font-semibold tracking-[0.25em] text-gold">{g.invite_code}</span>
          <button type="button" onClick={share} className={`${goldButton} gap-2`}>
            <Icon name="share" size={17} /> {copied ? 'Link copied' : 'Share invite link'}
          </button>
        </div>
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      {g.owner_id !== me && (
        <button
          type="button"
          onClick={() => confirm(`Leave ${g.name}?`) && leaveGroup(g.id, me).then(() => navigate('/groups'), (e: Error) => setError(e.message))}
          className="relative min-h-11 self-center text-[14px] font-semibold text-danger"
        >
          Leave group
        </button>
      )}
    </PhotoPage>
  )
}
