import { Link, useNavigate, useParams } from 'react-router-dom'
import { ChatThread } from '../components/ChatThread'
import { PhotoPage } from '../components/PhotoPage'
import { roundButton } from '../components/surfaces'
import { AvatarStack, ErrorNote, Icon, Loading } from '../components/ui'
import { teeOffIn } from '../lib/format'
import { fetchRound, roundTitle } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'
import { TeeChip } from './home/blocks'
import { lineup } from './home/helpers'

export function RoundChat() {
  const { id = '' } = useParams()
  const me = useUserId()
  const navigate = useNavigate()
  const round = useAsync(() => fetchRound(id), [id])
  if (round.loading) return <Loading />
  if (round.error) return <ErrorNote message={round.error} />
  if (!round.data) return <p>Round not found.</p>
  const r = round.data
  return (
    <PhotoPage tone="lake"
      header={
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button type="button" aria-label="Back" onClick={() => navigate(-1)} className={roundButton}>
              <Icon name="back" size={20} />
            </button>
            <Link to={`/rounds/${r.id}`} className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-4 text-[14px] font-semibold text-white no-underline backdrop-blur">
              View round
            </Link>
          </div>
          <div className="flex items-center justify-between gap-2">
            <TeeChip iso={r.tee_time} />
            <span className="text-[13px] font-semibold text-flag">{teeOffIn(r.tee_time)}</span>
          </div>
          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h1 className="m-0 truncate font-display text-[28px] leading-[1.02] font-extrabold tracking-[-0.035em]">{roundTitle(r)}</h1>
              <p className="mt-1 mb-0 truncate text-sm text-white/80">{r.course_name}</p>
            </div>
            <AvatarStack players={lineup(r)} total={r.max_players} size={30} onDark />
          </div>
        </div>
      }
    >
      <ChatThread round={r} userId={me} />
    </PhotoPage>
  )
}
