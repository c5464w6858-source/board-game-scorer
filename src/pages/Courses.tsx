import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CourseMap } from '../components/CourseMap'
import { Button, Card, Empty, ErrorNote, ScreenHeader } from '../components/ui'
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
    <div className="flex flex-col gap-4">
      <ScreenHeader center={<span className="font-display text-[22px] font-extrabold tracking-[-0.03em] text-fairway">Courses</span>} />
      <div className="overflow-hidden rounded-[20px] border border-line">
        <CourseMap pins={pins} center={center} zoom={center ? 10 : 5} />
      </div>
      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search courses"
          placeholder="Course, town or postcode"
          className="min-h-12 min-w-0 flex-1 rounded-full border border-line bg-card px-4"
        />
        <Button type="submit">Search</Button>
      </form>
      <Button variant="outline" onClick={nearMe}>Courses near me</Button>
      {status && <p role="status" className="m-0 text-sm text-muted">{status}</p>}
      {error && <ErrorNote message={error} />}
      {results &&
        (results.length === 0 ? (
          <Empty title="No courses found">
            <p className="m-0 text-sm text-muted">Try a town or postcode instead.</p>
          </Empty>
        ) : (
          <Card className="divide-y divide-line-soft overflow-hidden">
            {results.map((c) => (
              <Link key={c.id} to={`/courses/${encodeURIComponent(c.id)}`} className="flex min-h-14 justify-between gap-2 px-4 py-3 text-fairway no-underline">
                <span>
                  <span className="block font-semibold">{c.name}</span>
                  {c.town && <span className="block text-sm text-muted">{c.town}</span>}
                </span>
                {c.distanceKm != null && <span className="shrink-0 font-mono text-sm text-muted">{(c.distanceKm * 0.621371).toFixed(1)} mi</span>}
              </Link>
            ))}
          </Card>
        ))}
      <p className="m-0 text-xs text-muted">
        {pins.length.toLocaleString()} UK courses. Course data © OpenStreetMap contributors.
      </p>
    </div>
  )
}
