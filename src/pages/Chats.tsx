import { Link } from 'react-router-dom'
import { Card, Empty, ErrorNote, LinkButton, Loading } from '../components/ui'
import { fetchLastMessages } from '../lib/chat'
import { dateAndTime } from '../lib/format'
import { fetchUpcomingRounds, isMyRound, roundTitle } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'

export function Chats() {
  const me = useUserId()
  const state = useAsync(async () => {
    const mine = (await fetchUpcomingRounds()).filter((r) => isMyRound(r, me))
    return { mine, last: await fetchLastMessages(mine.map((r) => r.id)) }
  }, [me])

  if (state.loading) return <Loading />
  if (state.error || !state.data) return <ErrorNote message={state.error ?? 'Something went wrong'} />
  const { mine, last } = state.data

  return (
    <div className="flex flex-col gap-4">
      <h1 className="m-0 font-display text-[30px] font-extrabold tracking-[-0.03em]">Chats</h1>
      {mine.length === 0 ? (
        <Empty title="No round chats yet">
          <p className="m-0 text-sm text-muted">Chats open once you host a round or a host accepts you.</p>
          <LinkButton to="/discover">Find a game</LinkButton>
        </Empty>
      ) : (
        <Card className="divide-y divide-line-soft">
          {mine.map((r) => (
            <Link key={r.id} to={`/rounds/${r.id}/chat`} className="flex flex-col gap-0.5 p-4 text-fairway no-underline">
              <span className="font-semibold">{roundTitle(r)}</span>
              <span className="text-[13px] text-muted">{r.course_name} · {dateAndTime(r.tee_time)}</span>
              <span className="truncate text-sm">{last.get(r.id)?.body ?? 'No messages yet'}</span>
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
