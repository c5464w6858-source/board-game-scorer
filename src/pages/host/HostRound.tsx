import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PhotoPage } from '../../components/PhotoPage'
import { Section } from '../../components/Section'
import { glassCard, limeButton } from '../../components/surfaces'
import { Icon } from '../../components/ui'
import { fetchCourse, searchCourses, type Course } from '../../lib/courses'
import { formatLabels, shortDate, upcomingDays } from '../../lib/format'
import { useAsync } from '../../lib/useAsync'
import { useMe } from '../../lib/useMe'
import { useHost } from './hostContext'
import { Choice, darkDisabled, field, HostBar, HostHeader, Switch } from './parts'

const formats = [
  { value: 'stableford', label: 'Stableford' },
  { value: 'stroke', label: 'Stroke' },
  { value: 'match', label: 'Match' },
  { value: 'scramble', label: 'Scramble' },
] as const

const days = upcomingDays(7)

export function HostRound() {
  const { draft, update } = useHost()
  const navigate = useNavigate()
  const me = useMe()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Course[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)

  // Default to the golfer's home club.
  const homeId = me.data?.profile?.home_club_id
  useEffect(() => {
    if (!draft.course && homeId) fetchCourse(homeId).then((c) => c && update({ course: c }), () => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [homeId])

  const search = useAsync(async () => (query.trim().length > 1 ? searchCourses(query) : []), [query])
  useEffect(() => {
    setResults(search.data ?? [])
    setSearchError(search.error)
  }, [search.data, search.error])

  const canContinue = Boolean(draft.course)

  return (
    <PhotoPage
      header={
        <HostHeader
          step={1}
          title="Host a round"
          subtitle="Pick the course, day and who can join. Hosting is always free."
          onBack={() => navigate('/')}
        />
      }
    >
      <Section title="Course" icon="flag">
        {draft.course && !query ? (
          <button type="button" onClick={() => setQuery(' ')} className={`${glassCard} flex items-center gap-3 p-3.5 text-left text-fairway ring-2 ring-green/45`}>
            <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-fairway text-flag">
              <Icon name="tee" size={20} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-semibold">{draft.course.name}</span>
              <span className="block truncate text-[13px] text-muted">{[draft.course.town, draft.course.postcode].filter(Boolean).join(' · ')}</span>
            </span>
            <span className="text-[13px] font-semibold text-green">Change</span>
          </button>
        ) : (
          <div className="flex flex-col gap-2">
            <label className="relative block">
              <span className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted"><Icon name="search" size={18} /></span>
              <input
                autoFocus={Boolean(draft.course)}
                value={query.trim() ? query : ''}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search courses"
                placeholder="Course, town or postcode"
                className={`${field} w-full pl-11`}
              />
            </label>
            {searchError && <p role="alert" className="m-0 text-sm text-danger">{searchError}</p>}
            {results.length > 0 && (
              <div className={`${glassCard} max-h-64 divide-y divide-line-soft overflow-y-auto text-fairway`}>
                {results.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      update({ course: c })
                      setQuery('')
                    }}
                    className="block min-h-11 w-full px-4 py-2.5 text-left"
                  >
                    <span className="block font-semibold">{c.name}</span>
                    {c.town && <span className="block text-[13px] text-muted">{c.town}</span>}
                  </button>
                ))}
              </div>
            )}
            {query.trim().length > 1 && !search.loading && results.length === 0 && !searchError && (
              <p className="m-0 text-sm text-muted">No courses found.</p>
            )}
          </div>
        )}
      </Section>

      <Section title="When" icon="clock">
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pt-1 pb-3">
          {days.map((d) => {
            const on = draft.day === d.key
            return (
              <button
                key={d.key}
                type="button"
                aria-pressed={on}
                onClick={() => update({ day: d.key })}
                className={`flex min-h-[72px] w-16 shrink-0 flex-col items-center justify-center gap-0.5 rounded-[18px] ${
                  on ? 'bg-fairway text-white shadow-[0_12px_24px_-12px_rgba(14,31,22,0.8)] ring-2 ring-flag' : `${glassCard} text-fairway`
                }`}
              >
                <span className={`text-[12px] font-semibold uppercase ${on ? 'text-white/70' : 'text-muted'}`}>{d.dow}</span>
                <span className={`font-mono text-xl font-semibold ${on ? 'text-flag' : ''}`}>{d.day}</span>
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Format" icon="tee">
        <div role="radiogroup" aria-label="Format" className={`${glassCard} grid grid-cols-[1.3fr_1fr_1fr_1.2fr] gap-1 p-1.5`}>
          {formats.map((o) => {
            const on = o.value === draft.format
            return (
              <button
                key={o.value}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => update({ format: o.value })}
                className={`min-h-11 rounded-[16px] px-1 text-[14px] font-semibold ${on ? 'bg-fairway text-flag shadow-[0_8px_16px_-10px_rgba(14,31,22,0.8)]' : 'text-muted'}`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </Section>

      <Section title="Who can join" icon="user">
        <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-fairway`}>
          <Choice label="Anyone" hint="You approve each request" checked={!draft.buddiesOnly} onSelect={() => update({ buddiesOnly: false })} />
          {!draft.buddiesOnly && (
            <div className="flex items-center gap-2 bg-[#F6F5F0]/70 px-4 py-3 text-sm">
              <span className="flex-1 font-semibold">Handicap</span>
              <input inputMode="decimal" aria-label="Minimum handicap" placeholder="Any" value={draft.minHandicap} onChange={(e) => update({ minHandicap: e.target.value })} className={`${field} w-20 px-3 text-center font-mono`} />
              <span className="text-muted">to</span>
              <input inputMode="decimal" aria-label="Maximum handicap" placeholder="Any" value={draft.maxHandicap} onChange={(e) => update({ maxHandicap: e.target.value })} className={`${field} w-20 px-3 text-center font-mono`} />
            </div>
          )}
          <Choice label="Buddies only" hint="Golfers you've added as buddies" checked={draft.buddiesOnly} onSelect={() => update({ buddiesOnly: true })} />
          <Switch label="Auto-accept buddies" hint="Buddies join without waiting on you" checked={draft.autoAccept} onChange={(autoAccept) => update({ autoAccept })} />
        </div>
      </Section>

      <HostBar
        title={`${shortDate(`${draft.day}T12:00:00Z`)} · ${formatLabels[draft.format]}`}
        note={draft.course?.name ?? 'Choose a course to continue'}
      >
        <button type="button" className={`${limeButton} ${darkDisabled}`} disabled={!canContinue} onClick={() => navigate('/host/time')}>
          Continue
        </button>
      </HostBar>
    </PhotoPage>
  )
}
