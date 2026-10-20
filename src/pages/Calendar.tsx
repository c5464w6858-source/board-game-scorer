import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, roundButton } from '../components/surfaces'
import { ErrorNote, Icon, Loading, type IconName } from '../components/ui'
import { firstName, shortDate, teeTime, ymd } from '../lib/format'
import { fetchMyGroups } from '../lib/groups'
import { fetchMyRounds, roundTitle } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

type Kind = 'hosting' | 'playing' | 'requested' | 'society'

interface Entry {
  id: string
  kind: Kind
  tee: string
  title: string
  sub: string
  to: string
}

const kinds: Record<Kind, { label: string; icon: IconName; dot: string; chip: string }> = {
  hosting: { label: 'Hosting', icon: 'flag', dot: 'bg-fairway', chip: 'bg-fairway text-flag' },
  playing: { label: 'You’re in', icon: 'check', dot: 'bg-[#8CCB2E]', chip: 'bg-flag text-fairway' },
  requested: { label: 'Requested', icon: 'clock', dot: 'border-[1.5px] border-[#B8862B] bg-white', chip: 'border border-dashed border-[#C9B98F] bg-white text-[#8A5A12]' },
  society: { label: 'Society', icon: 'user', dot: 'bg-gold', chip: 'bg-navy text-gold' },
}

const weekdays = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const noon = (y: number, m: number, d: number) => new Date(Date.UTC(y, m, d, 12))

// A month of your rounds: ones you host, play in or have asked to join, and
// your societies' and trips' rounds. Tap a day to see what's on.
export function Calendar() {
  const me = useUserId()
  const navigate = useNavigate()
  const today = ymd(new Date())
  const [month, setMonth] = useState(() => {
    const [y, m] = today.split('-').map(Number)
    return { y, m: m - 1 }
  })
  const [day, setDay] = useState(today)

  const state = useAsync(async () => {
    const from = new Date()
    from.setMonth(from.getMonth() - 2, 1)
    const [rounds, groups] = await Promise.all([fetchMyRounds(me, from), fetchMyGroups()])
    const entries: Entry[] = rounds.map((r) => {
      const kind: Kind =
        r.host_id === me ? 'hosting' : r.round_requests.some((q) => q.user_id === me && q.status === 'accepted') ? 'playing' : 'requested'
      return {
        id: r.id,
        kind,
        tee: r.tee_time,
        title: roundTitle(r),
        sub: kind === 'hosting' ? r.course_name : `${firstName(r.host?.display_name ?? null)} hosts · ${r.course_name}`,
        to: `/rounds/${r.id}`,
      }
    })
    for (const g of groups) {
      for (const r of g.group_rounds) {
        entries.push({ id: r.id, kind: 'society', tee: r.tee_time, title: r.title || r.course_name, sub: `${g.name} · ${r.course_name}`, to: `/groups/${g.id}/rounds/${r.id}` })
      }
    }
    return entries.sort((a, b) => a.tee.localeCompare(b.tee))
  }, [me])

  const byDay = useMemo(() => {
    const map = new Map<string, Entry[]>()
    for (const e of state.data ?? []) {
      const k = ymd(new Date(e.tee))
      map.set(k, [...(map.get(k) ?? []), e])
    }
    return map
  }, [state.data])

  if (state.loading) return <Loading />
  if (state.error || !state.data) return <ErrorNote message={state.error ?? 'Something went wrong'} />

  // Monday-first grid for the month, padded with blanks.
  const days = new Date(Date.UTC(month.y, month.m + 1, 0)).getUTCDate()
  const lead = (noon(month.y, month.m, 1).getUTCDay() + 6) % 7
  const cells: (string | null)[] = [...Array<null>(lead).fill(null), ...Array.from({ length: days }, (_, i) => ymd(noon(month.y, month.m, i + 1)))]
  while (cells.length % 7) cells.push(null)

  const monthName = noon(month.y, month.m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric', timeZone: 'UTC' })
  const inMonth = cells.filter((c): c is string => !!c).flatMap((c) => byDay.get(c) ?? [])
  const shift = (by: number) => setMonth(({ y, m }) => ({ y: m + by < 0 ? y - 1 : m + by > 11 ? y + 1 : y, m: (m + by + 12) % 12 }))
  const onDay = byDay.get(day) ?? []
  const next = state.data.find((e) => ymd(new Date(e.tee)) > day)

  function jump(to: string) {
    const [y, m] = to.split('-').map(Number)
    setMonth({ y, m: m - 1 })
    setDay(to)
  }

  return (
    <PhotoPage
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            <h1 className="m-0 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.035em]">Your calendar</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">
              {inMonth.length ? `${inMonth.length} round${inMonth.length === 1 ? '' : 's'} in ${monthName.split(' ')[0]}` : `Nothing booked in ${monthName.split(' ')[0]} yet`}
            </p>
          </div>
        </div>
      }
    >
      <div className={`${glassCard} relative flex flex-col gap-2 p-3 text-fairway`}>
        <div className="flex items-center justify-between">
          <button type="button" aria-label="Previous month" onClick={() => shift(-1)} className="grid size-10 place-items-center rounded-full text-fairway">
            <Icon name="back" size={18} />
          </button>
          <span className="font-semibold">{monthName}</span>
          <button type="button" aria-label="Next month" onClick={() => shift(1)} className="grid size-10 place-items-center rounded-full text-fairway">
            <Icon name="back" size={18} className="rotate-180" />
          </button>
        </div>
        <div className="grid grid-cols-7 text-center text-[11px] font-semibold tracking-[0.08em] text-muted">
          {weekdays.map((w, i) => <span key={i}>{w}</span>)}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((c, i) => {
            if (!c) return <span key={i} />
            const list = byDay.get(c) ?? []
            const selected = c === day
            return (
              <button
                key={c}
                type="button"
                aria-pressed={selected}
                aria-label={`${shortDate(`${c}T12:00:00Z`)}${list.length ? `, ${list.length} round${list.length === 1 ? '' : 's'}` : ''}`}
                onClick={() => setDay(c)}
                className={`flex h-12 flex-col items-center justify-center gap-1 rounded-xl font-mono text-[14px] ${
                  selected ? 'bg-fairway text-white' : c === today ? 'ring-2 ring-green ring-inset' : c < today ? 'text-muted/60' : ''
                }`}
              >
                {Number(c.slice(8))}
                <span className="flex h-2 gap-0.5">
                  {list.slice(0, 3).map((e) => <span key={e.id} className={`size-2 rounded-full ${kinds[e.kind].dot}`} />)}
                </span>
              </button>
            )
          })}
        </div>
        <div className="flex flex-wrap justify-center gap-x-3 gap-y-1 border-t border-line-soft pt-2 text-[12px] text-muted">
          {(Object.keys(kinds) as Kind[]).map((k) => (
            <span key={k} className="inline-flex items-center gap-1.5">
              <span className={`size-2 rounded-full ${kinds[k].dot}`} /> {kinds[k].label}
            </span>
          ))}
        </div>
      </div>

      <Section title={day === today ? 'Today' : shortDate(`${day}T12:00:00Z`)} icon="calendar">
        {onDay.length ? (
          <div className="flex flex-col gap-2.5">
            {onDay.map((e) => {
              const k = kinds[e.kind]
              return (
                <Link
                  key={e.id}
                  to={e.to}
                  className={`${glassCard} flex items-center gap-3 p-3.5 text-fairway no-underline ${e.kind === 'requested' ? '!border-dashed !border-[#C9B98F] !bg-white/50' : ''}`}
                >
                  <span className={`w-14 shrink-0 rounded-2xl py-2 text-center font-mono text-[15px] font-semibold ${e.kind === 'requested' ? 'bg-[#F1EFE8] text-muted' : 'bg-fairway text-white'}`}>
                    {teeTime(e.tee)}
                  </span>
                  <span className={`min-w-0 flex-1 ${e.kind === 'requested' ? 'opacity-70' : ''}`}>
                    <span className="block truncate font-semibold">{e.title}</span>
                    <span className="block truncate text-[13px] text-muted">{e.sub}</span>
                  </span>
                  <span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${k.chip}`}>
                    <Icon name={k.icon} size={13} /> {k.label}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className={`${glassCard} flex flex-col gap-3 px-4 py-4 text-[14px] text-muted`}>
            <span>Nothing on {day === today ? 'today' : 'this day'}.</span>
            {next && (
              <button type="button" onClick={() => jump(ymd(new Date(next.tee)))} className="inline-flex items-center gap-1.5 self-start font-semibold text-green">
                Next: {shortDate(next.tee)} · {next.title} <Icon name="back" size={14} className="rotate-180" />
              </button>
            )}
          </div>
        )}
      </Section>
    </PhotoPage>
  )
}
