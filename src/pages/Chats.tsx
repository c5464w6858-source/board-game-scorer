import { Link } from 'react-router-dom'
import { PhotoPage } from '../components/PhotoPage'
import { Section } from '../components/Section'
import { glassCard, primaryButton } from '../components/surfaces'
import { AvatarStack, ErrorNote, Icon, Loading } from '../components/ui'
import { fetchLastMessages } from '../lib/chat'
import { firstName } from '../lib/format'
import { fetchUpcomingRounds, isMyRound, roundTitle, type RoundRow } from '../lib/rounds'
import { useAsync } from '../lib/useAsync'
import { useUserId } from '../lib/useMe'
import { TeeChip } from './home/blocks'
import { lineup } from './home/helpers'

// First name of whoever sent a message in this round's chat.
function senderName(r: RoundRow, userId: string, me: string) {
  if (userId === me) return 'You'
  if (userId === r.host_id) return firstName(r.host?.display_name ?? null)
  const p = r.round_requests.find((q) => q.user_id === userId)
  return firstName(p?.profile?.display_name ?? null)
}

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
    <PhotoPage tone="clay"
      header={
        <div className="flex flex-col gap-2 pt-6">
          <span className="text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">Your groups</span>
          <h1 className="m-0 font-display text-[34px] leading-[1.02] font-extrabold tracking-[-0.035em]">Chats</h1>
          <p className="m-0 text-sm text-white/80">
            {mine.length ? `${mine.length} round${mine.length === 1 ? '' : 's'} coming up. Sort lifts, tee times and the 19th.` : 'One chat for each round you play.'}
          </p>
        </div>
      }
    >
      <Section title="Round chats" icon="chat" badge={mine.length || undefined}>
        {mine.length === 0 ? (
          <div className={`${glassCard} flex flex-col items-center gap-3 px-5 py-6 text-center text-fairway`}>
            <span className="grid size-12 place-items-center rounded-full bg-green-tint text-green"><Icon name="chat" size={22} /></span>
            <div>
              <div className="font-display text-[18px] font-bold">No round chats yet</div>
              <p className="mt-1 mb-0 text-[14px] text-muted">Chats open once you host a round or a host accepts you.</p>
            </div>
            <Link to="/discover" className={primaryButton}>Find a game</Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {mine.map((r) => {
              const m = last.get(r.id)
              const hosting = r.host_id === me
              return (
                <Link key={r.id} to={`/rounds/${r.id}/chat`} className={`${glassCard} flex flex-col gap-3 p-4 text-fairway no-underline`}>
                  <div className="flex items-center justify-between gap-2">
                    <TeeChip iso={r.tee_time} />
                    {hosting ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-[#F1EFE8] px-2.5 py-1 text-[12px] font-semibold">
                        <Icon name="flag" size={13} /> Hosting
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-flag px-2.5 py-1 text-[12px] font-semibold">
                        <Icon name="check" size={13} /> You're in
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-display text-[18px] font-bold tracking-[-0.01em]">{roundTitle(r)}</div>
                      <div className="truncate text-[13px] text-muted">{r.course_name}</div>
                    </div>
                    <AvatarStack players={lineup(r)} total={r.max_players} size={30} />
                  </div>
                  <div className="flex items-center gap-2 rounded-2xl bg-[#F1EFE8] px-3.5 py-2.5 text-[14px]">
                    <span className="min-w-0 flex-1 truncate">
                      {m ? (
                        <>
                          <span className="font-semibold">{senderName(r, m.user_id, me)}:</span> {m.body}
                        </>
                      ) : (
                        <span className="text-muted">No messages yet. Say hello.</span>
                      )}
                    </span>
                    <Icon name="back" size={16} className="shrink-0 rotate-180 text-muted" />
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </Section>
    </PhotoPage>
  )
}
