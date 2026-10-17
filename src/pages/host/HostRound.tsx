import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, Icon, ScreenHeader, SectionLabel, Segmented, ToggleRow } from '../../components/ui'
import { fetchCourse, searchCourses, type Course } from '../../lib/courses'
import { upcomingDays } from '../../lib/format'
import { useAsync } from '../../lib/useAsync'
import { useMe } from '../../lib/useMe'
import { useHost } from './hostContext'

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
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-6">
      <ScreenHeader kind="close" onBack={() => navigate('/')} center={<span className="block text-center">Step 1 of 2</span>} right={<span className="size-11" />} />
      <h1 className="m-0 font-display text-[30px] font-extrabold tracking-[-0.03em]">Host a round</h1>

      <section className="flex flex-col gap-2">
        <SectionLabel>Course</SectionLabel>
        {draft.course && !query ? (
          <button
            type="button"
            onClick={() => setQuery(' ')}
            className="flex items-center gap-3 rounded-[20px] border-[1.5px] border-green bg-card p-3.5 text-left"
          >
            <span className="flex-1">
              <span className="block font-semibold">{draft.course.name}</span>
              <span className="block text-sm text-muted">{[draft.course.town, draft.course.postcode].filter(Boolean).join(' · ')}</span>
            </span>
            <span className="text-green"><Icon name="check" /></span>
          </button>
        ) : (
          <>
            <input
              autoFocus={Boolean(draft.course)}
              value={query.trim() ? query : ''}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search courses"
              placeholder="Course, town or postcode"
              className="min-h-12 rounded-full border border-line bg-card px-4"
            />
            {searchError && <p role="alert" className="m-0 text-sm text-danger">{searchError}</p>}
            {results.length > 0 && (
              <Card className="max-h-64 divide-y divide-line-soft overflow-y-auto">
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
                    {c.town && <span className="block text-sm text-muted">{c.town}</span>}
                  </button>
                ))}
              </Card>
            )}
            {query.trim().length > 1 && !search.loading && results.length === 0 && !searchError && (
              <p className="m-0 text-sm text-muted">No courses found.</p>
            )}
          </>
        )}
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>When</SectionLabel>
        <div className="-mx-5 flex gap-2 overflow-x-auto px-5">
          {days.map((d) => (
            <button
              key={d.key}
              type="button"
              aria-pressed={draft.day === d.key}
              onClick={() => update({ day: d.key })}
              className={`flex min-h-16 w-16 shrink-0 flex-col items-center justify-center rounded-[18px] border ${draft.day === d.key ? 'border-fairway bg-fairway text-white' : 'border-line bg-card'}`}
            >
              <span className="text-sm opacity-80">{d.dow}</span>
              <span className="font-mono text-lg font-semibold">{d.day}</span>
            </button>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Format</SectionLabel>
        <Segmented label="Format" options={[...formats]} value={draft.format} onChange={(format) => update({ format })} />
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Who can join</SectionLabel>
        <Card className="divide-y divide-line-soft overflow-hidden">
          <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3">
            <input type="radio" name="who" checked={!draft.buddiesOnly} onChange={() => update({ buddiesOnly: false })} className="size-5 accent-green" />
            <span className="flex-1">
              <span className="block">Anyone</span>
              <span className="block text-sm text-muted">You approve each request</span>
            </span>
          </label>
          {!draft.buddiesOnly && (
            <div className="flex items-center gap-2 px-4 py-3 text-sm">
              <span className="text-muted">Handicap</span>
              <input inputMode="decimal" aria-label="Minimum handicap" placeholder="Any" value={draft.minHandicap} onChange={(e) => update({ minHandicap: e.target.value })} className="min-h-11 w-20 rounded-full border border-line px-3 text-center font-mono" />
              <span className="text-muted">to</span>
              <input inputMode="decimal" aria-label="Maximum handicap" placeholder="Any" value={draft.maxHandicap} onChange={(e) => update({ maxHandicap: e.target.value })} className="min-h-11 w-20 rounded-full border border-line px-3 text-center font-mono" />
            </div>
          )}
          <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-3">
            <input type="radio" name="who" checked={draft.buddiesOnly} onChange={() => update({ buddiesOnly: true })} className="size-5 accent-green" />
            Buddies only
          </label>
          <ToggleRow label="Auto-accept buddies" checked={draft.autoAccept} onChange={(autoAccept) => update({ autoAccept })} />
        </Card>
      </section>

      <div className="mt-auto">
        <Button size="lg" full disabled={!canContinue} onClick={() => navigate('/host/time')}>
          Continue
        </Button>
      </div>
    </div>
  )
}
