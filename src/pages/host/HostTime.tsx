import { useEffect, useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { PhotoPage } from '../../components/PhotoPage'
import { Section } from '../../components/Section'
import { glassCard, limeButton, secondaryButton } from '../../components/surfaces'
import { Avatar, ErrorNote, Icon, OpenSpot } from '../../components/ui'
import { teeTimesSearchUrl, teeTimesUrl } from '../../lib/courses'
import { formatLabels, handicapRange, londonToIso, shortDate, weekdayName } from '../../lib/format'
import { createRound } from '../../lib/rounds'
import { defaultTee, fetchCard, type Card } from '../../lib/scorecard'
import { TeePicker } from '../../components/ScorecardTable'
import { useMe } from '../../lib/useMe'
import { useHost } from './hostContext'
import { ActionBar, darkDisabled, field, Switch } from '../../components/controls'
import { HostHeader } from './parts'

const parseHcp = (v: string) => (v.trim() === '' || Number.isNaN(Number(v)) ? null : Number(v))

export function HostTime() {
  const { draft, update } = useHost()
  const navigate = useNavigate()
  const me = useMe()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [card, setCard] = useState<Card | null>(null)
  const courseId = draft.course?.id

  // Load the course's tees so the host can say which ones the group plays off.
  useEffect(() => {
    if (!courseId) return
    let live = true
    fetchCard(courseId).then((c) => {
      if (!live || !c) return
      setCard(c)
      if (!draft.teeId) update({ teeId: defaultTee(c)?.id ?? null })
    }, () => {})
    return () => {
      live = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId])

  if (!draft.course) return <Navigate to="/host" replace />
  const course = draft.course
  const bookUrl = teeTimesUrl(course) ?? teeTimesSearchUrl(course)
  const min = draft.buddiesOnly ? null : parseHcp(draft.minHandicap)
  const max = draft.buddiesOnly ? null : parseHcp(draft.maxHandicap)
  const feePounds = parseHcp(draft.fee)
  const iso = draft.time ? londonToIso(draft.day, draft.time) : null
  const inPast = iso != null && new Date(iso) < new Date()
  const fee = feePounds != null ? `£${feePounds}` : null

  async function post() {
    if (!iso) return
    setBusy(true)
    setError(null)
    try {
      const id = await createRound({
        course_id: course.id,
        course_name: course.name,
        location: course.town,
        tee_time: iso,
        title: `${weekdayName(draft.day)} ${formatLabels[draft.format]}`,
        format: draft.format,
        holes: course.holes === 9 ? 9 : 18,
        max_players: 4,
        min_handicap: min,
        max_handicap: max,
        walking: draft.walking,
        green_fee_pence: feePounds != null ? Math.round(feePounds * 100) : null,
        visibility: draft.buddiesOnly ? 'buddies' : 'public',
        auto_accept_buddies: draft.autoAccept,
        notes: draft.notes.trim() || null,
        tee_id: card ? draft.teeId : null,
        women_only: draft.womenOnly && me.data?.profile?.gender === 'woman',
        beginner_friendly: draft.beginnerFriendly,
      })
      navigate(`/rounds/${id}`, { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  const name = me.data?.profile?.display_name ?? 'You'

  return (
    <PhotoPage
      header={
        <HostHeader
          step={2}
          title="Pick a tee time"
          subtitle={`${course.name} · ${shortDate(`${draft.day}T12:00:00Z`)} · ${formatLabels[draft.format]}`}
          onBack={() => navigate('/host')}
        />
      }
    >
      <Section title="Your tee time" icon="clock">
        <div className={`${glassCard} flex flex-col gap-3 p-4 text-fairway ${inPast ? 'ring-2 ring-danger/60' : draft.time ? 'ring-2 ring-green/45' : ''}`}>
          <p className="m-0 text-[14px] text-muted">
            Book your slot with the club, then enter the time you've booked. We don't have live tee sheets yet.
          </p>
          <label className="flex items-center justify-between gap-3">
            <span className="font-semibold">Tee time</span>
            <input
              type="time"
              step={60}
              value={draft.time}
              onChange={(e) => update({ time: e.target.value })}
              className={`${field} w-[164px] text-center font-mono text-lg font-semibold`}
            />
          </label>
          <a href={bookUrl} target="_blank" rel="noreferrer" className={`${secondaryButton} gap-2`}>
            Book with the club
            <Icon name="share" size={16} />
          </a>
          {inPast && <p role="alert" className="m-0 text-sm font-semibold text-danger">That time has already passed.</p>}
        </div>
      </Section>

      {card && card.tees.length > 1 && (
        <Section title="Tees" icon="flag">
          <TeePicker tees={card.tees} value={draft.teeId} onChange={(teeId) => update({ teeId })} />
        </Section>
      )}

      <Section title="Details" icon="pencil">
        <div className={`${glassCard} divide-y divide-line-soft overflow-hidden text-fairway`}>
          <Switch label="Walking" hint="No buggies for this round" checked={draft.walking} onChange={(walking) => update({ walking })} />
          <label className="flex min-h-14 items-center justify-between gap-3 px-4 py-2.5">
            <span>
              <span className="block font-semibold">Green fee</span>
              <span className="block text-[13px] text-muted">Information only, paid at the club</span>
            </span>
            <span className="relative">
              <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 font-mono text-muted">£</span>
              <input inputMode="decimal" aria-label="Green fee in pounds" value={draft.fee} onChange={(e) => update({ fee: e.target.value })} placeholder="0" className={`${field} w-24 pr-3 pl-7 text-right font-mono`} />
            </span>
          </label>
          <label className="block px-4 py-3">
            <span className="mb-1.5 block font-semibold">Note for golfers <span className="font-normal text-muted">(optional)</span></span>
            <textarea
              value={draft.notes}
              onChange={(e) => update({ notes: e.target.value })}
              rows={2}
              maxLength={300}
              placeholder="e.g. Steady pace, drink in the clubhouse after"
              className={`${field} block w-full rounded-2xl py-3`}
            />
          </label>
        </div>
      </Section>

      <Section title="Who's playing" icon="user" action={<span className="text-[13px] text-muted">1 of 4</span>}>
        <div className={`${glassCard} grid grid-cols-4 gap-2 px-3 py-4 text-fairway`}>
          <div className="flex flex-col items-center gap-1 text-center">
            <span className="rounded-full p-[3px] ring-[2.5px] ring-green">
              <Avatar name={name} src={me.data?.profile?.avatar_url} size={50} />
            </span>
            <span className="text-[14px] font-semibold">You</span>
            <span className="text-[12px] font-semibold text-green-dark">Host</span>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-1 text-center">
              <span className="p-[3px]"><OpenSpot size={50} /></span>
              <span className="text-[14px] font-semibold">Open</span>
              <span className="text-[12px] text-muted">{draft.womenOnly ? 'Women only' : draft.buddiesOnly ? 'Buddies' : handicapRange(min, max)}</span>
            </div>
          ))}
        </div>
      </Section>

      <div className="relative flex gap-3 rounded-[20px] border border-green/20 bg-green-tint/90 px-4 py-3 text-[14px] text-[#0E3D20]">
        <span className="mt-0.5 shrink-0"><Icon name="shield" size={20} /></span>
        <p className="m-0">
          <strong className="font-semibold">Nothing to pay in the app.</strong>{' '}
          {fee ? `Everyone pays ${fee} at the pro shop on the day` : 'Everyone pays the club on the day'}, so no one is out of pocket if someone doesn't show.
        </p>
      </div>
      {error && <div className="relative"><ErrorNote message={error} /></div>}

      <ActionBar
        title={draft.time && !inPast ? `Tee off ${draft.time}` : 'Add your tee time'}
        note={fee ? `${fee} at the club · free to host` : 'Free to host'}
      >
        <button type="button" className={`${limeButton} ${darkDisabled}`} disabled={busy || !iso || inPast} onClick={post}>
          {busy ? 'Posting…' : 'Post round'}
        </button>
      </ActionBar>
    </PhotoPage>
  )
}
