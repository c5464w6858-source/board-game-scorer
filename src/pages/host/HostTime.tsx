import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { Avatar, Button, Card, ErrorNote, Icon, OpenSpot, ScreenHeader, SectionLabel, ToggleRow } from '../../components/ui'
import { teeTimesSearchUrl, teeTimesUrl } from '../../lib/courses'
import { formatLabels, handicapRange, londonToIso, shortDate, weekdayName } from '../../lib/format'
import { createRound } from '../../lib/rounds'
import { useMe } from '../../lib/useMe'
import { useHost } from './hostContext'

const parseHcp = (v: string) => (v.trim() === '' || Number.isNaN(Number(v)) ? null : Number(v))

export function HostTime() {
  const { draft, update } = useHost()
  const navigate = useNavigate()
  const me = useMe()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

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
      })
      navigate(`/rounds/${id}`, { replace: true })
    } catch (e) {
      setError((e as Error).message)
      setBusy(false)
    }
  }

  const name = me.data?.profile?.display_name ?? 'You'

  return (
    <div className="flex min-h-[calc(100vh-8rem)] flex-col gap-5">
      <ScreenHeader center="Step 2 of 2" />
      <div>
        <h1 className="m-0 font-display text-[30px] font-extrabold tracking-[-0.03em]">Pick a tee time</h1>
        <p className="mt-1 mb-0 text-muted">{course.name} · {shortDate(`${draft.day}T12:00:00Z`)}</p>
      </div>

      <section className="flex flex-col gap-2">
        <SectionLabel>Your tee time</SectionLabel>
        <Card className="flex flex-col gap-3 p-4">
          <p className="m-0 text-sm text-muted">
            Book your slot with the club, then enter the time you've booked. We don't have live tee sheets yet.
          </p>
          <a href={bookUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-line px-4 font-semibold text-fairway no-underline">
            Book with the club
          </a>
          <label className="flex items-center justify-between gap-3">
            <span className="font-semibold">Tee time</span>
            <input type="time" step={60} value={draft.time} onChange={(e) => update({ time: e.target.value })} className="min-h-11 rounded-full border border-line bg-card px-4 font-mono" />
          </label>
          {inPast && <p role="alert" className="m-0 text-sm text-danger">That time has already passed.</p>}
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Details</SectionLabel>
        <Card className="divide-y divide-line-soft overflow-hidden">
          <ToggleRow label="Walking" checked={draft.walking} onChange={(walking) => update({ walking })} />
          <label className="flex min-h-14 items-center justify-between gap-3 px-4 py-2">
            <span>
              Green fee
              <span className="block text-sm text-muted">Information only, paid at the club</span>
            </span>
            <span className="flex items-center gap-1 font-mono">
              £<input inputMode="decimal" aria-label="Green fee in pounds" value={draft.fee} onChange={(e) => update({ fee: e.target.value })} placeholder="0" className="min-h-11 w-20 rounded-full border border-line px-3 text-right" />
            </span>
          </label>
          <label className="block px-4 py-3">
            <span className="mb-1 block text-sm text-muted">Note for golfers (optional)</span>
            <textarea value={draft.notes} onChange={(e) => update({ notes: e.target.value })} rows={2} maxLength={300} className="w-full rounded-2xl border border-line p-3" />
          </label>
        </Card>
      </section>

      <section className="flex flex-col gap-2">
        <SectionLabel>Who's playing</SectionLabel>
        <Card className="divide-y divide-line-soft px-4">
          <div className="flex items-center gap-3 py-3">
            <Avatar name={name} src={me.data?.profile?.avatar_url} size={40} />
            <span className="flex-1">You</span>
            <span className="text-sm font-semibold text-green-dark">Host</span>
          </div>
          <div className="flex items-center gap-3 py-3">
            <OpenSpot size={40} />
            <span className="flex-1">3 open spots</span>
            <span className="text-sm text-muted">{draft.buddiesOnly ? 'Buddies only' : handicapRange(min, max)}</span>
          </div>
        </Card>
      </section>

      <div className="flex gap-3 rounded-2xl bg-green-tint px-3.5 py-3 text-sm text-[#0E3D20]">
        <span className="mt-0.5 shrink-0"><Icon name="shield" size={22} /></span>
        <p className="m-0">
          <strong className="font-semibold">Nothing to pay in the app.</strong>{' '}
          {fee ? `Everyone pays ${fee} at the pro shop on the day` : 'Everyone pays the club on the day'}, so no one is out of pocket if someone doesn't show.
        </p>
      </div>
      {error && <ErrorNote message={error} />}

      <div className="mt-auto">
        <Button variant="dark" size="lg" full disabled={busy || !iso || inPast} onClick={post}>
          {busy ? 'Posting…' : 'Post round'}
        </Button>
      </div>
    </div>
  )
}
