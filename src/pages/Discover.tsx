import { useMemo, useState, type TouchEvent } from 'react'
import { Link } from 'react-router-dom'
import { CourseMap } from '../components/CourseMap'
import { HoleArt } from '../components/HoleArt'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard } from '../components/surfaces'
import { Avatar, AvatarStack, ErrorNote, Icon, Loading } from '../components/ui'
import { handicapText, shortName, teeOffIn } from '../lib/format'
import { DEFAULT_RADIUS_MILES, matchScore, roundDistanceMiles, type MatchProfile } from '../lib/match'
import { requestToJoin } from '../lib/requests'
import { fetchUpcomingRounds, isOpenTo, roundTitle, type RoundRow } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useMe } from '../lib/useMe'
import { TeeChip } from './home/blocks'
import { distanceText, lineup, spotsText } from './home/helpers'
import { Scorecard } from './home/Scorecard'

type Filter = 'weekend' | 'near' | 'handicap'
const filterLabels: Record<Filter, string> = {
  weekend: 'This weekend',
  near: `Within ${DEFAULT_RADIUS_MILES} mi`,
  handicap: 'My handicap fits',
}

const SAVED_KEY = 'buddygolf-saved-rounds'
function loadSaved(): string[] {
  try {
    return JSON.parse(localStorage.getItem(SAVED_KEY) ?? '[]')
  } catch {
    return []
  }
}

function passes(f: Filter, r: RoundRow, me: MatchProfile) {
  if (f === 'weekend') {
    const day = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/London', weekday: 'short' }).format(new Date(r.tee_time))
    return day === 'Sat' || day === 'Sun'
  }
  if (f === 'near') {
    const d = roundDistanceMiles(r, me)
    return d == null || d <= DEFAULT_RADIUS_MILES
  }
  if (me.handicap == null) return true
  return (r.min_handicap == null || me.handicap >= r.min_handicap) && (r.max_handicap == null || me.handicap <= r.max_handicap)
}

export function Discover() {
  const me = useMe()
  const rounds = useAsync(() => fetchUpcomingRounds(), [])
  const [view, setView] = useState<'cards' | 'map'>('cards')
  const [filters, setFilters] = useState<Filter[]>([])
  const [skipped, setSkipped] = useState<string[]>([])
  const [saved, setSaved] = useState<string[]>(loadSaved)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [dragX, setDragX] = useState(0)
  const [startX, setStartX] = useState<number | null>(null)

  const cards = useMemo(() => {
    if (!rounds.data || !me.data) return []
    const { match } = me.data
    return rounds.data
      .filter((r) => isOpenTo(r, me.id) && !skipped.includes(r.id) && filters.every((f) => passes(f, r, match)))
      .map((r) => ({ round: r, match: matchScore(r, match), miles: roundDistanceMiles(r, match) }))
      .sort((a, b) => b.match.percent - a.match.percent)
  }, [rounds.data, me.data, me.id, skipped, filters])

  if (rounds.loading || me.loading) return <Loading />
  if (rounds.error || me.error) return <ErrorNote message={(rounds.error ?? me.error)!} />

  const top = cards[0]

  const toggleFilter = (f: Filter) =>
    setFilters((cur) => (cur.includes(f) ? cur.filter((x) => x !== f) : [...cur, f]))
  const skip = () => top && setSkipped((s) => [...s, top.round.id])
  const toggleSave = () => {
    if (!top) return
    const next = saved.includes(top.round.id) ? saved.filter((x) => x !== top.round.id) : [...saved, top.round.id]
    setSaved(next)
    try {
      localStorage.setItem(SAVED_KEY, JSON.stringify(next))
    } catch {
      /* saving is a convenience; ignore blocked storage */
    }
  }
  async function request() {
    if (!top) return
    setBusy(true)
    setMessage(null)
    try {
      await requestToJoin(top.round.id)
      setMessage(`Request sent to ${shortName(top.round.host?.display_name ?? null)}. Nothing to pay in the app.`)
      skip()
      rounds.reload()
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const onTouchEnd = (e: TouchEvent) => {
    e.stopPropagation()
    if (dragX < -100) skip()
    else if (dragX > 100) toggleSave()
    setDragX(0)
    setStartX(null)
  }

  const filterPill = (on: boolean) =>
    `inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full px-3.5 text-sm font-medium whitespace-nowrap ${
      on ? 'bg-flag text-fairway' : 'border border-white/20 bg-white/[0.08] text-white backdrop-blur'
    }`

  return (
    <PhotoPage
      header={
        <div className="flex flex-col gap-5">
          <header className="flex items-end justify-between gap-3">
            <div>
              <h1 className="m-0 font-display text-[30px] leading-tight font-extrabold tracking-[-0.03em]">Find a game</h1>
              <p className="m-0 text-[13px] text-white/75">
                {cards.length} open {cards.length === 1 ? 'game' : 'games'}
                {filters.length ? ' match your filters' : ' near you'}
              </p>
            </div>
            <div role="radiogroup" aria-label="View" className="flex rounded-full border border-white/15 bg-white/10 p-1 backdrop-blur">
              {(['cards', 'map'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  role="radio"
                  aria-checked={view === v}
                  onClick={() => setView(v)}
                  className={`min-h-9 rounded-full px-3.5 text-sm font-semibold ${view === v ? 'bg-white text-fairway' : 'text-white/80'}`}
                >
                  {v === 'cards' ? 'Cards' : 'Map'}
                </button>
              ))}
            </div>
          </header>
          <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
            {(Object.keys(filterLabels) as Filter[]).map((f) => (
              <button key={f} type="button" aria-pressed={filters.includes(f)} onClick={() => toggleFilter(f)} className={filterPill(filters.includes(f))}>
                {filters.includes(f) && <Icon name="check" size={15} />}
                {filterLabels[f]}
              </button>
            ))}
          </div>
        </div>
      }
    >
      {message && (
        <p role="status" className="relative m-0 rounded-2xl border border-green/20 bg-green-tint px-4 py-3 text-sm text-green-dark">
          {message}
        </p>
      )}

      {view === 'map' ? (
        <Section title="On the map" icon="compass">
          <div className={`${glassCard} overflow-hidden p-2`}>
            <CourseMap
              pins={cards.flatMap((c) =>
                c.round.course ? [{ id: c.round.course.id, name: c.round.course.name, lat: c.round.course.lat, lon: c.round.course.lon }] : [],
              )}
              center={me.data?.match.home ? [me.data.match.home.lat, me.data.match.home.lon] : undefined}
              zoom={me.data?.match.home ? 9 : 5}
            />
          </div>
        </Section>
      ) : top ? (
        <Section title="Best match" icon="tee" action={cards.length > 1 ? <span className="text-sm text-muted">1 of {cards.length}</span> : undefined}>
          <article
            aria-label={`${roundTitle(top.round)}, ${top.match.percent}% match`}
            onTouchStart={(e) => setStartX(e.touches[0].clientX)}
            onTouchMove={(e) => startX != null && setDragX(e.touches[0].clientX - startX)}
            onTouchEnd={onTouchEnd}
            style={{ transform: `translateX(${dragX}px) rotate(${dragX / 40}deg)` }}
            className={`${glassCard} overflow-hidden`}
          >
            <Link to={`/rounds/${top.round.id}`} className="block text-fairway no-underline">
              <div className="relative h-[130px]">
                <HoleArt className="size-full" />
                <span className="absolute top-3 left-3"><TeeChip iso={top.round.tee_time} /></span>
                <span className="absolute right-3 bottom-3 rounded-full bg-flag px-3 py-1 font-mono text-[13px] font-semibold text-fairway shadow-[0_6px_14px_-6px_rgba(14,31,22,0.5)]">
                  {top.match.percent}% match
                </span>
              </div>
              <div className="flex flex-col gap-3.5 p-4">
                <div>
                  <div className="text-xs font-semibold text-green">{teeOffIn(top.round.tee_time)}</div>
                  <div className="font-display text-[24px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(top.round)}</div>
                  <div className="mt-1 text-sm text-[#4A544E]">
                    {[distanceText(top.miles), top.round.course_name].filter(Boolean).join(' · ')}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Avatar name={top.round.host?.display_name ?? 'Host'} src={top.round.host?.avatar_url} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="text-[15px] font-semibold">Hosted by {shortName(top.round.host?.display_name ?? null)}</div>
                    <div className="text-[13px] text-muted">
                      HCP <span className="font-mono">{handicapText(top.round.host?.handicap ?? null)}</span>
                      {top.round.pace_note ? ` · ${top.round.pace_note}` : ''}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <AvatarStack players={lineup(top.round)} total={top.round.max_players} size={26} />
                    <span className="text-[12px] text-muted">{spotsText(top.round)}</span>
                  </div>
                </div>
                <Scorecard round={top.round} />
                {top.match.reasons.length > 0 && (
                  <div className="flex flex-col gap-2 rounded-2xl bg-green-tint/70 px-3.5 py-3">
                    <div className="text-[11px] font-bold tracking-[0.08em] text-green-dark uppercase">Why you match</div>
                    {top.match.reasons.map((r) => (
                      <div key={r} className="flex items-center gap-2 text-[14px]">
                        <span className="text-green"><Icon name="check" size={17} /></span>
                        {r}
                      </div>
                    ))}
                  </div>
                )}
                <p className="m-0 text-[13px] text-muted">Nothing to pay in the app. Green fees are paid at the club.</p>
              </div>
            </Link>
          </article>

          {/* Pinned just above the tab bar so the main action is always in reach. */}
          <div className="h-20" aria-hidden="true" />
          <div className="fixed inset-x-0 bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom)))] z-[900] mx-auto flex max-w-[480px] items-center gap-3 bg-gradient-to-t from-[#ECEAE3] via-[#ECEAE3]/90 to-transparent px-5 pt-6 pb-3">
            <button
              type="button"
              aria-label="Skip"
              onClick={skip}
              className="grid size-14 shrink-0 place-items-center rounded-full border border-white bg-white text-fairway shadow-[0_10px_22px_-10px_rgba(14,31,22,0.45)]"
            >
              <Icon name="close" />
            </button>
            <button
              type="button"
              onClick={request}
              disabled={busy}
              className="inline-flex min-h-14 flex-1 items-center justify-center rounded-full bg-gradient-to-b from-[#1C8E47] to-green-dark text-[17px] font-semibold text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_24px_-12px_rgba(19,122,58,0.8)] disabled:opacity-50"
            >
              {busy ? 'Sending…' : 'Request to join'}
            </button>
            <button
              type="button"
              aria-label={saved.includes(top.round.id) ? 'Remove from saved' : 'Save'}
              aria-pressed={saved.includes(top.round.id)}
              onClick={toggleSave}
              className={`grid size-14 shrink-0 place-items-center rounded-full border shadow-[0_10px_22px_-10px_rgba(14,31,22,0.45)] ${
                saved.includes(top.round.id) ? 'border-flag bg-flag text-fairway' : 'border-white bg-white text-fairway'
              }`}
            >
              <Icon name="bookmark" />
            </button>
          </div>
        </Section>
      ) : (
        <Section title={filters.length ? 'No games match' : 'No games yet'} icon="tee">
          <div className={`${glassCard} flex flex-col items-start gap-3 p-4`}>
            <p className="m-0 text-[15px]">
              {filters.length ? 'Try fewer filters, or host a round and let golfers come to you.' : 'No open games near you yet. Host one and let golfers come to you.'}
            </p>
            <Link to="/host" className="inline-flex min-h-11 items-center rounded-full bg-fairway px-4 font-semibold text-white no-underline">
              Host a round
            </Link>
          </div>
        </Section>
      )}
      <Link to="/courses" className="relative self-center text-sm font-medium text-green">Browse all courses</Link>
    </PhotoPage>
  )
}
