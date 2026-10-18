import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Contours } from '../components/Contours'
import { RoundCard } from '../components/RoundCard'
import { Avatar, AvatarStack, ErrorNote, Icon, Loading, Logo } from '../components/ui'
import { dayLabel, firstName, greeting, longDate, shortName, teeTime } from '../lib/format'
import { matchScore, roundDistanceMiles } from '../lib/match'
import {
  acceptedPlayers,
  fetchUpcomingRounds,
  isMyRound,
  isOpenTo,
  pendingRequests,
  roundTitle,
  spotsLeft,
} from '../lib/rounds'
import { fetchForecast } from '../lib/weather'
import { useAsync } from '../lib/useAsync'
import { useMe } from '../lib/useMe'

// Every panel on Home shares this frosted-glass treatment so the screen reads as one surface.
const glass = 'rounded-[24px] border border-white/12 bg-white/[0.07] backdrop-blur-xl'

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="m-0 text-xs font-semibold tracking-[0.08em] text-muted-dark uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Home() {
  const me = useMe()
  const rounds = useAsync(async () => {
    const all = await fetchUpcomingRounds()
    const next = all.find((r) => isMyRound(r, me.id)) ?? null
    const forecast = next?.course ? await fetchForecast(next.course.lat, next.course.lon, next.tee_time) : null
    return { all, next, forecast }
  }, [me.id])

  const loading = me.loading || rounds.loading
  const failed = me.error || rounds.error || (!loading && (!rounds.data || !me.data))
  const data = rounds.data
  const open = data ? data.all.filter((r) => isOpenTo(r, me.id)) : []
  const picks =
    data && me.data
      ? open
          .map((r) => ({ round: r, match: matchScore(r, me.data!.match), miles: roundDistanceMiles(r, me.data!.match) }))
          .sort((a, b) => b.match.percent - a.match.percent)
          .slice(0, 6)
      : []
  const waiting = data
    ? data.all.filter((r) => r.host_id === me.id).flatMap((r) => pendingRequests(r).map((q) => ({ round: r, request: q })))
    : []
  const next = data?.next ?? null

  return (
    <div className="relative -mx-5 -mt-5 min-h-[calc(100vh-1rem)] px-5 pt-5 pb-4 text-white">
      {/* The dark surface, glows and contour lines sit behind the whole screen. */}
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] overflow-hidden bg-fairway">
        <div className="absolute -top-24 -right-20 size-80 rounded-full bg-green/45 blur-3xl" />
        <div className="absolute top-[45%] -left-24 size-72 rounded-full bg-green/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 size-64 rounded-full bg-flag/[0.07] blur-3xl" />
        <Contours className="text-white/[0.05]" />
      </div>

      <div className="relative flex flex-col gap-7">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-[13px] shadow-[0_0_0_1.5px_rgba(255,255,255,0.85)]">
              <Logo size={36} />
            </span>
            <div>
              <div className="text-[13px] text-muted-dark">{longDate(new Date())}</div>
              <h1 className="m-0 font-display text-[24px] leading-tight font-extrabold tracking-[-0.03em]">
                {greeting()}, {firstName(me.data?.profile?.display_name ?? null)}
              </h1>
            </div>
          </div>
          <Link
            to={waiting.length ? `/rounds/${waiting[0].round.id}/requests` : '/chats'}
            aria-label={waiting.length ? `${waiting.length} join requests waiting` : 'Notifications'}
            className="relative grid size-11 place-items-center rounded-full border border-white/12 bg-white/[0.07] text-white backdrop-blur-xl"
          >
            <Icon name="bell" size={20} />
            {waiting.length > 0 && <span className="absolute top-[9px] right-2.5 size-[9px] rounded-full border-2 border-fairway bg-alert" />}
          </Link>
        </header>

        {loading ? (
          <Loading />
        ) : failed ? (
          <ErrorNote message={me.error ?? rounds.error ?? 'Something went wrong'} />
        ) : (
          <>
            <Section title={next ? 'Your next round' : 'Your diary'}>
              <div className={`${glass} flex flex-col gap-4 p-4 shadow-[0_24px_40px_-24px_rgba(0,0,0,0.7)]`}>
                {next ? (
                  <Link to={`/rounds/${next.id}`} className="flex flex-col gap-4 text-white no-underline">
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full bg-flag px-3 py-1 text-[13px] font-semibold text-fairway">
                        {dayLabel(next.tee_time)} · <span className="font-mono">{teeTime(next.tee_time)}</span>
                      </span>
                      {data?.forecast && (
                        <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                          <span className="font-mono">{data.forecast.temp}°</span> · {data.forecast.label}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="font-display text-[28px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(next)}</div>
                      <div className="mt-1 text-sm text-muted-dark">{[next.course_name, `${next.holes} holes`].join(' · ')}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <AvatarStack
                          onDark
                          total={next.max_players}
                          players={[
                            { name: next.host?.display_name ?? 'Host', avatarUrl: next.host?.avatar_url },
                            ...acceptedPlayers(next).map((p) => ({ name: p.profile?.display_name ?? 'Golfer', avatarUrl: p.profile?.avatar_url })),
                          ]}
                        />
                        <span className="text-[13px] text-muted-dark">
                          {spotsLeft(next) ? `${spotsLeft(next)} spot${spotsLeft(next) === 1 ? '' : 's'} open` : 'Full'}
                        </span>
                      </div>
                      <Icon name="back" size={18} className="rotate-180 text-muted-dark" />
                    </div>
                  </Link>
                ) : (
                  <div>
                    <div className="font-display text-[22px] font-bold tracking-[-0.02em]">Nothing booked yet</div>
                    <p className="mt-1 mb-0 text-sm text-muted-dark">Join an open game near you, or host one and fill your four.</p>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 border-t border-white/10 pt-4">
                  <Link to="/discover" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-flag font-semibold text-fairway no-underline">
                    <Icon name="search" size={18} /> Find a game
                  </Link>
                  <Link to="/host" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 font-semibold text-white no-underline">
                    <Icon name="flag" size={18} /> Host a round
                  </Link>
                </div>
              </div>
            </Section>

            {waiting.length > 0 && (
              <Section title="Waiting on you">
                <div className={`${glass} divide-y divide-white/10`}>
                  {waiting.slice(0, 3).map(({ round, request }) => (
                    <Link key={request.id} to={`/rounds/${round.id}/requests`} className="flex items-center gap-3 p-3.5 text-white no-underline">
                      <Avatar name={request.profile?.display_name ?? 'Golfer'} src={request.profile?.avatar_url} size={40} />
                      <div className="min-w-0 flex-1 text-[15px] leading-snug">
                        <strong className="font-semibold">{shortName(request.profile?.display_name ?? null)}</strong>{' '}
                        <span className="text-muted-dark">wants to join</span> <strong className="font-semibold">{roundTitle(round)}</strong>
                      </div>
                      <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-sm font-semibold text-flag">Review</span>
                    </Link>
                  ))}
                </div>
              </Section>
            )}

            <Section
              title="Picked for you"
              action={
                picks.length ? (
                  <Link to="/discover" className="text-sm font-medium text-flag no-underline">
                    See all
                  </Link>
                ) : undefined
              }
            >
              {picks.length ? (
                <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-1">
                  {picks.map((p) => (
                    <RoundCard key={p.round.id} {...p} />
                  ))}
                </div>
              ) : (
                <div className={`${glass} p-4 text-sm text-muted-dark`}>
                  No open games near you yet. Host one and other golfers can join you.
                </div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}
