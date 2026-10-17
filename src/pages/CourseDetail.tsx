import { useEffect, useState } from 'react'
import { CourseMap } from '../components/CourseMap'
import { ErrorNote, Loading, ScreenHeader } from '../components/ui'
import { fetchCourse, teeTimesSearchUrl, teeTimesUrl, type Course } from '../lib/courses'
import { useParams } from 'react-router-dom'

const link =
  'inline-flex min-h-14 items-center justify-center rounded-full px-6 text-[17px] font-semibold no-underline'

export function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null | undefined>()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (id) fetchCourse(id).then(setCourse, (e: Error) => setError(e.message))
  }, [id])

  if (error) return <ErrorNote message={error} />
  if (course === undefined) return <Loading />
  if (course === null) return <p>Course not found.</p>

  const bookingUrl = teeTimesUrl(course)

  return (
    <div className="flex flex-col gap-4">
      <ScreenHeader />
      <div>
        <h1 className="m-0 font-display text-[28px] font-extrabold tracking-[-0.03em]">{course.name}</h1>
        <p className="mt-1 mb-0 text-muted">
          {[course.town, course.postcode].filter(Boolean).join(', ')}
          {course.holes && ` · ${course.holes} holes`}
        </p>
      </div>
      <div className="overflow-hidden rounded-[20px] border border-line">
        <CourseMap pins={[course]} center={[course.lat, course.lon]} zoom={13} />
      </div>
      <div className="flex flex-col gap-2.5">
        <a href={bookingUrl ?? teeTimesSearchUrl(course)} target="_blank" rel="noreferrer" className={`${link} bg-green text-white`}>
          {bookingUrl ? 'Book with the club' : 'Find tee times'}
        </a>
        {course.phone && (
          <a href={`tel:${course.phone}`} className={`${link} border border-line bg-card text-fairway`}>
            Call {course.phone}
          </a>
        )}
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${course.lat},${course.lon}`}
          target="_blank"
          rel="noreferrer"
          className={`${link} border border-line bg-card text-fairway`}
        >
          Directions
        </a>
      </div>
      <p className="m-0 text-xs text-muted">
        Tee times are booked on the club's own site and paid for at the club. Course data © OpenStreetMap contributors.
      </p>
    </div>
  )
}
