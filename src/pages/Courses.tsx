import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CourseMap } from '../components/CourseMap'
import { field } from '../components/controls'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, limeButton } from '../components/surfaces'
import { ErrorNote, Icon } from '../components/ui'
import {
  coursesNear,
  fetchCoursePins,
  searchCourses,
  type Course,
  type CoursePin,
} from '../lib/courses'

type Result = Course & { distanceKm?: number }

export function Courses() {
  const [pins, setPins] = useState<CoursePin[]>([])
  const [results, setResults] = useState<Result[] | null>(null)
  const [query, setQuery] = useState('')
  const [center, setCenter] = useState<[number, number] | undefined>()
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCoursePins().then(setPins, (e: Error) => setError(e.message))
  }, [])

  async function search(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setStatus('Searching…')
    setError(null)
    try {
      setResults(await searchCourses(query))
    } catch (err) {
      setError((err as Error).message)
    }
    setStatus(null)
  }

  function nearMe() {
    setStatus('Finding your location…')
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          setCenter([coords.latitude, coords.longitude])
          setResults(await coursesNear(coords.latitude, coords.longitude))
        } catch (err) {
          setError((err as Error).message)
        }
        setStatus(null)
      },
      () => {
        setStatus(null)
        setError('Location unavailable, so search by name or town instead.')
      },
    )
  }

  return (
    <PhotoPage tone="links"
      header={
        <div className="flex flex-col gap-4 pt-6">
          <div>
            <span className="text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">Find a club</span>
            <h1 className="m-0 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.035em]">Courses</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">
              {pins.length ? `${pins.length.toLocaleString()} UK course${pins.length === 1 ? '' : 's'}. ` : ''}Book with the club, pay on the day.
            </p>
          </div>
          <form onSubmit={search} className="flex items-center gap-2 rounded-full bg-white/95 p-1.5 pl-1.5 shadow-[0_12px_28px_-14px_rgba(0,0,0,0.6)]">
            <label className="relative min-w-0 flex-1">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted"><Icon name="search" size={18} /></span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                aria-label="Search courses"
                placeholder="Course, town or postcode"
                className={`${field} w-full border-transparent bg-transparent pl-10 text-[16px] shadow-none`}
              />
            </label>
            <button type="submit" className={`${limeButton} min-h-11 px-4`}>Search</button>
          </form>
          <button
            type="button"
            onClick={nearMe}
            className="inline-flex min-h-11 items-center gap-2 self-start rounded-full border border-white/20 bg-white/10 px-4 text-[14px] font-semibold text-white backdrop-blur"
          >
            <Icon name="compass" size={17} />
            Courses near me
          </button>
        </div>
      }
    >
      {(status || error) && (
        <div className="relative flex flex-col gap-2">
          {status && <p role="status" className="m-0 text-sm font-semibold text-muted">{status}</p>}
          {error && <ErrorNote message={error} />}
        </div>
      )}

      {results && (
        <Section title={center ? 'Near you' : 'Results'} icon="flag" badge={results.length || undefined}>
          {results.length === 0 ? (
            <div className={`${glassCard} flex flex-col items-center gap-2 px-5 py-6 text-center text-fairway`}>
              <span className="grid size-12 place-items-center rounded-full bg-green-tint text-green"><Icon name="search" size={22} /></span>
              <div className="font-display text-[18px] font-bold">No courses found</div>
              <p className="m-0 text-[14px] text-muted">Try a town or postcode instead.</p>
            </div>
          ) : (
            <div className={`${glassCard} divide-y divide-line-soft overflow-hidden`}>
              {results.map((c) => (
                <Link key={c.id} to={`/courses/${encodeURIComponent(c.id)}`} className="flex min-h-16 items-center gap-3 px-4 py-3 text-fairway no-underline">
                  <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-fairway text-flag"><Icon name="tee" size={18} /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{c.name}</span>
                    {c.town && <span className="block truncate text-[13px] text-muted">{c.town}</span>}
                  </span>
                  {c.distanceKm != null && (
                    <span className="shrink-0 rounded-full bg-[#F1EFE8] px-2.5 py-1 font-mono text-[12px] font-semibold">{(c.distanceKm * 0.621371).toFixed(1)} mi</span>
                  )}
                  <Icon name="back" size={16} className="shrink-0 rotate-180 text-muted" />
                </Link>
              ))}
            </div>
          )}
        </Section>
      )}

      <Section title="Map" icon="compass">
        <div className={`${glassCard} overflow-hidden p-1.5`}>
          <div className="overflow-hidden rounded-[17px]">
            <CourseMap pins={pins} center={center} zoom={center ? 10 : 5} />
          </div>
        </div>
      </Section>

      <p className="relative m-0 text-xs text-muted">Course data © OpenStreetMap contributors.</p>
    </PhotoPage>
  )
}
