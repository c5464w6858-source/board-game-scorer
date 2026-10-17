import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CourseMap } from '../components/CourseMap'
import { fetchCourse, teeTimesSearchUrl, teeTimesUrl, type Course } from '../lib/courses'

export function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null | undefined>()

  useEffect(() => {
    if (id) fetchCourse(id).then(setCourse, () => setCourse(null))
  }, [id])

  if (course === undefined) return <p>Loading…</p>
  if (course === null) return <p>Course not found.</p>

  const bookingUrl = teeTimesUrl(course)

  return (
    <div className="flex flex-col gap-4">
      <Link to="/courses" className="text-sm text-green-800 underline">
        ← All courses
      </Link>
      <div>
        <h1 className="text-2xl font-bold">{course.name}</h1>
        <p className="text-slate-600">
          {[course.town, course.postcode].filter(Boolean).join(', ')}
          {course.holes && ` · ${course.holes} holes`}
        </p>
      </div>
      <CourseMap pins={[course]} center={[course.lat, course.lon]} zoom={13} />
      <div className="flex flex-col gap-2">
        {bookingUrl ? (
          <a
            href={bookingUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-green-700 p-3 text-center font-semibold text-white"
          >
            Check live tee times
          </a>
        ) : (
          <a
            href={teeTimesSearchUrl(course)}
            target="_blank"
            rel="noreferrer"
            className="rounded bg-green-700 p-3 text-center font-semibold text-white"
          >
            Find tee times
          </a>
        )}
        {course.phone && (
          <a href={`tel:${course.phone}`} className="rounded border border-green-700 p-3 text-center font-semibold text-green-800">
            Call {course.phone}
          </a>
        )}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${course.lat},${course.lon}`}
          target="_blank"
          rel="noreferrer"
          className="rounded border border-green-700 p-3 text-center font-semibold text-green-800"
        >
          Directions
        </a>
      </div>
      <p className="text-xs text-slate-500">
        Tee times open on the club's own booking page. Course data © OpenStreetMap contributors.
      </p>
    </div>
  )
}
