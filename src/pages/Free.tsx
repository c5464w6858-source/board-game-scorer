import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ActionBar, darkDisabled, Pick } from '../components/controls'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, limeButton, roundButton } from '../components/surfaces'
import { Avatar, ErrorNote, Icon, Loading } from '../components/ui'
import { roundSlot, saveAvailability, slotKey, type Slot } from '../lib/availability'
import { firstName, teeTime, upcomingDays } from '../lib/format'
import { matchScore, roundDistanceMiles } from '../lib/match'
import { updateProfile } from '../lib/profiles'
import { fetchUpcomingRounds, isOpenTo, roundTitle } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useMe } from '../lib/useMe'
import { spotsText } from './home/helpers'

const days = upcomingDays(7)
const radii = [5, 10, 15, 25, 40]
const slots: { value: Slot; label: string }[] = [
  { value: 'am', label: 'AM' },
  { value: 'pm', label: 'PM' },
]

// "I'm free": mark mornings and afternoons you can play this week, so
// matching rounds rank higher and hosts with spots can see you.
export function Free() {
  const me = useMe()
  const navigate = useNavigate()
  const rounds = useAsync(() => fetchUpcomingRounds(), [])
  const [free, setFree] = useState<Set<string>>(new Set())
  const [radius, setRadius] = useState(15)
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const match = me.data?.match
  useEffect(() => {
    if (!match) return
    setFree(new Set(match.free))
    setRadius(match.radius)
  }, [match])

  // Open rounds in the slots you've picked and within your radius, best match first.
  const matching = useMemo(() => {
    if (!rounds.data || !match) return []
    const draft = { ...match, free, radius }
    return rounds.data
      .filter((r) => isOpenTo(r, me.id))
      .filter((r) => {
        const { day, slot } = roundSlot(r.tee_time)
        const d = roundDistanceMiles(r, draft)
        return free.has(slotKey(day, slot)) && (d == null || d <= radius)
      })
      .map((r) => ({ round: r, match: matchScore(r, draft) }))
      .sort((a, b) => b.match.percent - a.match.percent)
  }, [rounds.data, match, free, radius, me.id])

  if (me.loading) return <Loading />
  if (me.error) return <ErrorNote message={me.error} />

  const toggle = (key: string) => {
    setSaved(false)
    setFree((cur) => {
      const next = new Set(cur)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }
  const chosen = days.filter((d) => slots.some((s) => free.has(slotKey(d.key, s.value)))).length
  const count = [...free].filter((k) => days.some((d) => k.startsWith(d.key))).length

  async function save() {
    setBusy(true)
    setError(null)
    try {
      await saveAvailability(
        me.id,
        days.map((d) => d.key),
        free,
      )
      await updateProfile(me.id, { search_radius_miles: radius })
      setSaved(true)
      me.reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <PhotoPage
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-flag px-3 py-1 text-[13px] font-semibold text-fairway">
              <Icon name="clock" size={15} />
              {count ? `${count} slot${count === 1 ? '' : 's'} this week` : 'This week'}
            </span>
            <h1 className="m-0 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.035em]">I'm free</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">Tell hosts when you can play. They come to you.</p>
          </div>
        </div>
      }
    >
      <Section title="This week" icon="clock">
        <div className={`${glassCard} grid grid-cols-7 gap-1.5 p-2.5 text-fairway`}>
          {days.map((d) => (
            <div key={d.key} className="flex flex-col items-center gap-1.5">
              <span className="text-[12px] font-semibold text-muted">{d.dow}</span>
              <span className="-mt-1 font-mono text-[11px] text-muted">{d.day}</span>
              {slots.map((s) => {
                const key = slotKey(d.key, s.value)
                const on = free.has(key)
                return (
                  <button
                    key={s.value}
                    type="button"
                    aria-pressed={on}
                    aria-label={`${d.dow} ${s.value === 'am' ? 'morning' : 'afternoon'}`}
                    onClick={() => toggle(key)}
                    className={`min-h-11 w-full rounded-[14px] font-mono text-[13px] font-semibold ${
                      on ? 'bg-fairway text-flag shadow-[0_8px_16px_-10px_rgba(14,31,22,0.8)]' : 'border border-[#DEDBD0] bg-white text-muted'
                    }`}
                  >
                    {s.label}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <p className="relative m-0 text-[13px] text-muted">AM is before noon. Your slots clear themselves once the day has passed.</p>
      </Section>

      <Section title="How far" icon="compass">
        <div className="relative flex flex-wrap gap-2">
          {radii.map((r) => (
            <Pick
              key={r}
              on={radius === r}
              onClick={() => {
                setSaved(false)
                setRadius(r)
              }}
            >
              <span className="font-mono">{r}</span> mi
            </Pick>
          ))}
        </div>
      </Section>

      <Section title="Already matching" icon="flag" badge={matching.length || undefined}>
        {rounds.loading ? (
          <div className={`${glassCard} px-4 py-4 text-[14px] text-muted`}>Looking for games…</div>
        ) : matching.length ? (
          <div className="flex flex-col gap-2.5">
            {matching.map(({ round: r, match: m }) => (
              <Link key={r.id} to={`/rounds/${r.id}`} className={`${glassCard} flex items-center gap-3 p-3.5 text-fairway no-underline`}>
                <Avatar name={r.host?.display_name ?? 'Host'} src={r.host?.avatar_url} size={44} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold">
                    {new Intl.DateTimeFormat('en-GB', { weekday: 'short', timeZone: 'Europe/London' }).format(new Date(r.tee_time))}{' '}
                    <span className="font-mono">{teeTime(r.tee_time)}</span> · {r.course?.name ?? r.course_name}
                  </span>
                  <span className="block truncate text-[13px] text-muted">
                    {firstName(r.host?.display_name ?? null)}’s {roundTitle(r).toLowerCase()} · {spotsText(r)}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-green-tint px-2.5 py-1 font-mono text-[13px] font-semibold text-green-dark">{m.percent}%</span>
              </Link>
            ))}
          </div>
        ) : (
          <div className={`${glassCard} px-4 py-4 text-[14px] text-muted`}>
            {free.size ? 'No open games in those slots yet. Hosts with spots will see you’re free.' : 'Pick the slots you can play to see games that fit.'}
          </div>
        )}
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <ActionBar
        title={saved ? 'Hosts can see you’re free' : count ? `${count} slot${count === 1 ? '' : 's'} over ${chosen} day${chosen === 1 ? '' : 's'}` : 'No slots picked'}
        note={`Games within ${radius} miles`}
      >
        <button type="button" className={`${limeButton} ${darkDisabled}`} disabled={busy || saved} onClick={save}>
          {busy ? 'Saving…' : saved ? 'Saved' : 'Let hosts know'}
        </button>
      </ActionBar>
    </PhotoPage>
  )
}
