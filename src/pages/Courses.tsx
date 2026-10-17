import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CourseMap } from '../components/CourseMap'
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

  useEffect(() => {
    fetchCoursePins()
      .then(setPins)
      .catch((e) => setStatus(e.message))
  }, [])

  async function search(e: FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    setStatus('Searching…')
    try {
      setResults(await searchCourses(query))
      setStatus(null)
    } catch (err) {
      setStatus((err as Error).message)
    }
  }

  function nearMe() {
    setStatus('Finding your location…')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          setCenter([coords.latitude, coords.longitude])
          setResults(await coursesNear(coords.latitude, coords.longitude))
          setStatus(null)
        } catch (err) {
          setStatus((err as Error).message)
        }
      },
      () => setStatus('Location unavailable, so search by name or town instead.'),
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-bold">Courses</h1>
      <CourseMap pins={pins} center={center} zoom={center ? 10 : 5} />
      <form onSubmit={search} className="flex gap-2">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Course, town or postcode"
          className="min-w-0 flex-1 rounded border border-green-300 p-2"
        />
        <button className="rounded bg-green-700 px-3 font-semibold text-white">Search</button>
      </form>
      <button onClick={nearMe} className="rounded border border-green-700 p-2 font-semibold text-green-800">
        Courses near me
      </button>
      {status && <p className="text-sm text-slate-600">{status}</p>}
      {results && (
        <ul className="divide-y divide-green-100 rounded-lg bg-white">
          {results.length === 0 && <li className="p-3 text-sm">No courses found.</li>}
          {results.map((c) => (
            <li key={c.id}>
              <Link to={`/courses/${encodeURIComponent(c.id)}`} className="flex justify-between gap-2 p-3">
                <span>
                  <span className="font-semibold">{c.name}</span>
                  {c.town && <span className="block text-sm text-slate-600">{c.town}</span>}
                </span>
                {c.distanceKm != null && (
                  <span className="shrink-0 text-sm text-slate-600">{c.distanceKm.toFixed(1)} km</span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <p className="text-xs text-slate-500">
        {pins.length.toLocaleString()} UK courses. Course data © OpenStreetMap contributors.
      </p>
    </div>
  )
}
