import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ClubPicker } from '../../components/ClubPicker'
import { ActionBar, Field, field as pill, Pick } from '../../components/controls'
import { PhotoPage } from '../../components/PhotoPage'
import { Section } from '../../components/Section'
import { TeePicker } from '../../components/ScorecardTable'
import { glassCard, goldButton, roundButton } from '../../components/surfaces'
import { ErrorNote, Icon } from '../../components/ui'
import type { Course } from '../../lib/courses'
import { londonToIso } from '../../lib/format'
import { addGroupRound } from '../../lib/groups'
import { defaultTee, fetchCard, type Card } from '../../lib/scorecard'

const field = `${pill} w-full text-[16px]`

export function GroupRoundNew() {
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState<Course | null>(null)
  const [card, setCard] = useState<Card | null>(null)
  const [teeId, setTeeId] = useState<string | null>(null)
  const [day, setDay] = useState('')
  const [time, setTime] = useState('')
  const [title, setTitle] = useState('')
  const [holes, setHoles] = useState<9 | 18>(18)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCard(null)
    setTeeId(null)
    if (!course) return
    let live = true
    fetchCard(course.id).then((c) => {
      if (!live || !c) return
      setCard(c)
      setTeeId(defaultTee(c)?.id ?? null)
    }, () => {})
    return () => {
      live = false
    }
  }, [course])

  const ok = Boolean(course && day && time)

  async function save() {
    if (!course) return
    setBusy(true)
    setError(null)
    try {
      await addGroupRound({
        group_id: id,
        course_id: course.id,
        course_name: course.name,
        tee_id: card ? teeId : null,
        tee_time: londonToIso(day, time),
        holes,
        title: title.trim() || null,
      })
      navigate(`/groups/${id}`, { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  return (
    <PhotoPage
      tone="navy"
      header={
        <div className="flex flex-col gap-5">
          <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
            <Icon name="back" size={20} />
          </button>
          <div>
            <span className="text-[12px] font-semibold tracking-[0.08em] text-gold uppercase">Schedule</span>
            <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">Add a round</h1>
            <p className="mt-1 mb-0 text-sm text-white/80">One per tee time you’ve booked. Everyone pays the club on the day.</p>
          </div>
        </div>
      }
    >
      <Section tone="navy" title="Course" icon="flag">
        <div className="relative text-navy">
          <ClubPicker club={course} onChange={setCourse} />
        </div>
      </Section>

      {card && card.tees.length > 1 && (
        <Section tone="navy" title="Tees" icon="tee">
          <TeePicker tees={card.tees} value={teeId} onChange={setTeeId} />
        </Section>
      )}

      <Section tone="navy" title="When" icon="clock">
        <div className={`${glassCard} grid grid-cols-2 divide-x divide-line-soft text-navy`}>
          <Field label="Day">
            <input type="date" value={day} onChange={(e) => setDay(e.target.value)} className={`${field} px-3 font-mono text-[15px]`} />
          </Field>
          <Field label="First tee time">
            <input type="time" step={60} value={time} onChange={(e) => setTime(e.target.value)} className={`${field} px-3 font-mono text-[15px]`} />
          </Field>
        </div>
      </Section>

      <Section tone="navy" title="Round" icon="pencil">
        <div className={`${glassCard} divide-y divide-line-soft text-navy`}>
          <Field label="Name (optional)">
            <input value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} placeholder="e.g. Day 1 · Old Course" className={field} />
          </Field>
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <span className="text-[13px] font-semibold text-muted">Holes</span>
            <span className="flex gap-2">
              <Pick on={holes === 18} onClick={() => setHoles(18)}>18 holes</Pick>
              <Pick on={holes === 9} onClick={() => setHoles(9)}>9 holes</Pick>
            </span>
          </div>
        </div>
      </Section>

      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <ActionBar tone="navy" title={course?.name ?? 'Choose a course'} note={day && time ? `${day} · ${time}` : 'Pick the day and tee time'}>
        <button type="button" disabled={!ok || busy} onClick={save} className={goldButton}>
          {busy ? 'Adding…' : 'Add round'}
        </button>
      </ActionBar>
    </PhotoPage>
  )
}
