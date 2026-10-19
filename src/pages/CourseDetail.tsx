import { useEffect, useState } from 'react'
import { CourseMap } from '../components/CourseMap'
import { useNavigate, useParams } from 'react-router-dom'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, primaryButton, roundButton, secondaryButton } from '../components/surfaces'
import { ErrorNote, Icon, Loading } from '../components/ui'
import { ScorecardTable, TeePicker } from '../components/ScorecardTable'
import { fetchCourse, teeTimesSearchUrl, teeTimesUrl, type Course } from '../lib/courses'
import { defaultTee, fetchCard, type Card } from '../lib/scorecard'

export function CourseDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState<Course | null | undefined>()
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  // undefined while loading, null when the course has no card yet.
  const [card, setCard] = useState<Card | null | undefined>()
  const [teeId, setTeeId] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    fetchCourse(id).then(setCourse, (e: Error) => setError(e.message))
    fetchCard(id).then(
      (c) => {
        setCard(c)
        if (c) setTeeId(defaultTee(c)?.id ?? null)
      },
      () => setCard(null),
    )
  }, [id])

  if (error) return <ErrorNote message={error} />
  if (course === undefined) return <Loading />
  if (course === null) return <p>Course not found.</p>

  const bookingUrl = teeTimesUrl(course)

  return (
    <PhotoPage
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            {course.holes && (
              <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-fairway">
                <Icon name="flag" size={14} />
                <span className="font-mono">{course.holes}</span> holes
              </span>
            )}
            <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">{course.name}</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">{[course.town, course.postcode].filter(Boolean).join(' · ')}</p>
          </div>
        </div>
      }
    >
      <div className={`${glassCard} relative overflow-hidden p-1.5`}>
        <div className="overflow-hidden rounded-[17px]">
          <CourseMap pins={[course]} center={[course.lat, course.lon]} zoom={13} />
        </div>
      </div>

      <Section title="Scorecard" icon="flag">
        {card === undefined ? (
          <div className={`${glassCard} px-4 py-5 text-center text-[14px] text-muted`}>Loading the scorecard…</div>
        ) : card === null ? (
          <div className={`${glassCard} px-4 py-5 text-center text-[14px] text-muted`}>
            We don't have this course's scorecard yet. Scoring still works, using par 4 on every hole.
          </div>
        ) : (
          <>
            <TeePicker tees={card.tees} value={teeId} onChange={setTeeId} />
            {(() => {
              const tee = card.tees.find((t) => t.id === teeId)
              if (!tee) return null
              const stat = (label: string, value: string | number | null) => (
                <div className="flex flex-col items-center">
                  <span className="font-mono text-[17px] font-semibold">{value ?? '–'}</span>
                  <span className="text-[11px] font-semibold text-muted">{label}</span>
                </div>
              )
              return (
                <div className={`${glassCard} grid grid-cols-4 px-2 py-3 text-fairway`}>
                  {stat('Par', tee.par)}
                  {stat('Yards', tee.yards?.toLocaleString() ?? null)}
                  {stat('Rating', tee.course_rating)}
                  {stat('Slope', tee.slope)}
                </div>
              )
            })()}
            <div className={`${glassCard} p-3 text-fairway`}>
              <ScorecardTable holes={card.holes} />
              {card.tees.find((t) => t.id === teeId && !t.is_default) && (
                <p className="mt-2 mb-0 text-[12px] text-muted">Hole yardages are from the {defaultTee(card)?.name.toLowerCase()} tees.</p>
              )}
            </div>
          </>
        )}
      </Section>

      <Section title="Play here" icon="tee">
        <div className={`${glassCard} flex flex-col gap-2.5 p-4 text-fairway`}>
          <a href={bookingUrl ?? teeTimesSearchUrl(course)} target="_blank" rel="noreferrer" className={`${primaryButton} gap-2`}>
            {bookingUrl ? 'Book with the club' : 'Find tee times'}
            <Icon name="share" size={16} />
          </a>
          <div className="flex gap-2.5">
            {course.phone && (
              <a href={`tel:${course.phone}`} className={`${secondaryButton} flex-1 gap-2 px-3`}>
                Call
              </a>
            )}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${course.lat},${course.lon}`}
              target="_blank"
              rel="noreferrer"
              className={`${secondaryButton} flex-1 gap-2 px-3`}
            >
              <Icon name="compass" size={16} /> Directions
            </a>
          </div>
          {course.phone && <p className="m-0 text-center font-mono text-[13px] text-muted">{course.phone}</p>}
        </div>
      </Section>

      <div className="relative flex gap-3 rounded-[20px] border border-green/20 bg-green-tint/90 px-4 py-3 text-[14px] text-[#0E3D20]">
        <span className="mt-0.5 shrink-0"><Icon name="shield" size={20} /></span>
        <p className="m-0">
          <strong className="font-semibold">Nothing to pay in the app.</strong> Tee times are booked on the club's own site and paid for at the club.
        </p>
      </div>
      <p className="relative m-0 text-xs text-muted">Course data © OpenStreetMap contributors.</p>
    </PhotoPage>
  )
}
