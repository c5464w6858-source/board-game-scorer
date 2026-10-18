import { Link, useParams } from 'react-router-dom'
import { ChatThread } from '../components/ChatThread'
import { ErrorNote, Loading, ScreenHeader } from '../components/ui'
import { dateAndTime } from '../lib/format'
import { fetchRound, roundTitle } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

export function RoundChat() {
  const { id = '' } = useParams()
  const me = useUserId()
  const round = useAsync(() => fetchRound(id), [id])
  if (round.loading) return <Loading />
  if (round.error) return <ErrorNote message={round.error} />
  if (!round.data) return <p>Round not found.</p>
  const r = round.data
  return (
    <div className="flex flex-col gap-4">
      <ScreenHeader center={<Link to={`/rounds/${r.id}`} className="font-semibold text-fairway no-underline">{roundTitle(r)}</Link>} />
      <p className="m-0 text-sm text-muted">{r.course_name} · {dateAndTime(r.tee_time)}</p>
      <ChatThread round={r} userId={me} />
    </div>
  )
}
