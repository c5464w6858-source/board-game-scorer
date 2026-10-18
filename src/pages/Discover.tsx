import { useMemo, useState, type TouchEvent } from 'react'
import { Link } from 'react-router-dom'
import heroImg from '../assets/hero-green.jpg'
import { CourseMap } from '../components/CourseMap'
import {
  Avatar,
  Button,
  Chip,
  Empty,
  ErrorNote,
  Icon,
  Loading,
  MatchBadge,
  Segmented,
  SectionLabel,
} from '../components/ui'
import { dateAndTime, feeLabel, formatLabels, handicapText, shortName } from '../lib/format'
import { DEFAULT_RADIUS_MILES, matchScore, roundDistanceMiles, type MatchProfile } from '../lib/match'
import { requestToJoin } from '../lib/requests'
import { fetchUpcomingRounds, isOpenTo, roundTitle, spotsLeft, type RoundRow } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useMe } from '../lib/useMe'

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

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-center justify-between gap-3">
        <h1 className="m-0 font-display text-[30px] font-extrabold tracking-[-0.03em]">Find a game</h1>
        <div className="w-40">
          <Segmented
            label="View"
            value={view}
            onChange={setView}
            options={[
              { value: 'cards', label: 'Cards' },
              { value: 'map', label: 'Map' },
            ]}
          />
        </div>
      </header>

      <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
        <Chip active>
          <Icon name="filter" size={16} /> Filters{filters.length ? ` · ${filters.length}` : ''}
        </Chip>
        {(Object.keys(filterLabels) as Filter[]).map((f) => (
          <Chip key={f} outline={!filters.includes(f)} active={filters.includes(f)} onClick={() => toggleFilter(f)}>
            {filterLabels[f]}
          </Chip>
        ))}
      </div>

      {message && (
        <p role="status" className="m-0 rounded-2xl bg-green-tint px-4 py-3 text-sm text-green-dark">
          {message}
        </p>
      )}

      {view === 'map' ? (
        <>
          <CourseMap
            pins={cards.flatMap((c) =>
              c.round.course ? [{ id: c.round.course.id, name: c.round.course.name, lat: c.round.course.lat, lon: c.round.course.lon }] : [],
            )}
            center={me.data?.match.home ? [me.data.match.home.lat, me.data.match.home.lon] : undefined}
            zoom={me.data?.match.home ? 9 : 5}
          />
          <p className="m-0 text-sm text-muted">{cards.length} open games match your filters.</p>
        </>
      ) : top ? (
        <>
          <article
            aria-label={`${roundTitle(top.round)}, ${top.match.percent}% match`}
            onTouchStart={(e) => setStartX(e.touches[0].clientX)}
            onTouchMove={(e) => startX != null && setDragX(e.touches[0].clientX - startX)}
            onTouchEnd={onTouchEnd}
            style={{ transform: `translateX(${dragX}px) rotate(${dragX / 40}deg)` }}
            className="overflow-hidden rounded-[28px] border border-line bg-card shadow-[0_20px_40px_-24px_rgba(14,31,22,0.45)]"
          >
            <Link to={`/rounds/${top.round.id}`} className="block text-inherit no-underline">
              <div className="relative h-[230px]">
                <img src={heroImg} alt="" className="size-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-fairway/80 to-transparent" />
                <div className="absolute top-4 left-4"><MatchBadge percent={top.match.percent} onDark /></div>
                <div className="absolute inset-x-4 bottom-4 text-white">
                  <div className="font-display text-[28px] leading-tight font-extrabold tracking-[-0.03em]">{roundTitle(top.round)}</div>
                  <div className="text-[15px] text-white/90">{dateAndTime(top.round.tee_time)} · {top.round.course_name}</div>
                </div>
              </div>
              <div className="flex flex-col gap-3.5 p-4">
                <div className="flex items-center gap-3">
                  <Avatar name={top.round.host?.display_name ?? 'Host'} src={top.round.host?.avatar_url} size={44} />
                  <div className="flex-1">
                    <div className="font-semibold">Hosted by {shortName(top.round.host?.display_name ?? null)}</div>
                    <div className="text-sm text-muted">
                      HCP <span className="font-mono">{handicapText(top.round.host?.handicap ?? null)}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-lg font-semibold">{spotsLeft(top.round)}/{top.round.max_players - 1}</div>
                    <div className="text-[13px] text-muted">spots left</div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Chip>{formatLabels[top.round.format]}</Chip>
                  {top.round.walking && <Chip>Walking</Chip>}
                  {top.round.pace_note && <Chip>{top.round.pace_note}</Chip>}
                  {feeLabel(top.round.green_fee_pence) && <Chip>{feeLabel(top.round.green_fee_pence)}</Chip>}
                </div>
                {top.match.reasons.length > 0 && (
                  <div className="flex flex-col gap-2 border-t border-line-soft pt-3.5">
                    <SectionLabel>Why you match</SectionLabel>
                    {top.match.reasons.map((r) => (
                      <div key={r} className="flex items-center gap-2.5 text-[15px]">
                        <span className="text-green"><Icon name="check" size={18} /></span>
                        {r}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          </article>

          <div className="flex items-center gap-3">
            <button type="button" aria-label="Skip" onClick={skip} className="grid size-14 shrink-0 place-items-center rounded-full border border-line bg-card">
              <Icon name="close" />
            </button>
            <Button size="lg" full onClick={request} disabled={busy}>
              {busy ? 'Sending…' : 'Request to join'}
            </Button>
            <button
              type="button"
              aria-label={saved.includes(top.round.id) ? 'Remove from saved' : 'Save'}
              aria-pressed={saved.includes(top.round.id)}
              onClick={toggleSave}
              className={`grid size-14 shrink-0 place-items-center rounded-full border border-line ${saved.includes(top.round.id) ? 'bg-green-tint text-green-dark' : 'bg-card'}`}
            >
              <Icon name="bookmark" />
            </button>
          </div>
        </>
      ) : (
        <Empty title={filters.length ? 'No games match those filters' : 'No games near you yet'}>
          <p className="m-0 text-sm text-muted">Host one and let golfers come to you.</p>
          <Link to="/host" className="font-semibold text-green">Host a round</Link>
        </Empty>
      )}
      <Link to="/courses" className="self-center text-sm font-medium text-green">Browse all courses</Link>
    </div>
  )
}
