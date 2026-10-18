import { Link } from 'react-router-dom'
import { Contours } from '../components/Contours'
import { RoundCard } from '../components/RoundCard'
import { Avatar, AvatarStack, Empty, ErrorNote, Icon, LinkButton, Loading, Logo } from '../components/ui'
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

export function Home() {
  const me = useMe()
  const rounds = useAsync(async () => {
    const all = await fetchUpcomingRounds()
    const next = all.find((r) => isMyRound(r, me.id)) ?? null
    const forecast = next?.course ? await fetchForecast(next.course.lat, next.course.lon, next.tee_time) : null
    return { all, next, forecast }
  }, [me.id])

  if (me.loading || rounds.loading) return <Loading />
  if (me.error || rounds.error || !rounds.data || !me.data) return <ErrorNote message={me.error ?? rounds.error ?? 'Something went wrong'} />

  const { all, next, forecast } = rounds.data
  const { profile, match } = me.data
  const open = all.filter((r) => isOpenTo(r, me.id))
  const picks = open
    .map((r) => ({ round: r, match: matchScore(r, match), miles: roundDistanceMiles(r, match) }))
    .sort((a, b) => b.match.percent - a.match.percent)
    .slice(0, 6)
  const waiting = all
    .filter((r) => r.host_id === me.id)
    .flatMap((r) => pendingRequests(r).map((q) => ({ round: r, request: q })))

  return (
    <div className="-mx-5 -mt-5 flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-b-[32px] bg-fairway px-5 pt-5 pb-6 text-white">
        {/* Soft brand glows and contour lines give depth without a photo. */}
        <div aria-hidden="true" className="absolute -top-24 -right-20 size-72 rounded-full bg-green/45 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-28 -left-16 size-60 rounded-full bg-flag/10 blur-3xl" />
        <Contours className="text-white/[0.06]" />

        <header className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="rounded-[13px] shadow-[0_0_0_1.5px_rgba(255,255,255,0.85)]">
              <Logo size={36} />
            </span>
            <div>
              <div className="text-[13px] text-muted-dark">{longDate(new Date())}</div>
              <h1 className="m-0 font-display text-[24px] leading-tight font-extrabold tracking-[-0.03em]">
                {greeting()}, {firstName(profile?.display_name ?? null)}
              </h1>
            </div>
          </div>
          <Link
            to={waiting.length ? `/rounds/${waiting[0].round.id}/requests` : '/chats'}
            aria-label={waiting.length ? `${waiting.length} join requests waiting` : 'Notifications'}
            className="relative grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur"
          >
            <Icon name="bell" size={20} />
            {waiting.length > 0 && <span className="absolute top-[9px] right-2.5 size-[9px] rounded-full border-2 border-fairway bg-alert" />}
          </Link>
        </header>

        {next ? (
          <Link
            to={`/rounds/${next.id}`}
            aria-label={`Your next round: ${roundTitle(next)}`}
            className="relative mt-6 flex flex-col gap-4 rounded-[26px] border border-white/15 bg-white/[0.08] p-4 text-white no-underline shadow-[0_24px_40px_-24px_rgba(0,0,0,0.7)] backdrop-blur-xl"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="rounded-full bg-flag px-3 py-1 text-[13px] font-semibold text-fairway">
                {dayLabel(next.tee_time)} · <span className="font-mono">{teeTime(next.tee_time)}</span>
              </span>
              {forecast && (
                <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                  <span className="font-mono">{forecast.temp}°</span> · {forecast.label}
                </span>
              )}
            </div>
            <div>
              <div className="text-xs font-semibold tracking-[0.08em] text-muted-dark uppercase">Your next round</div>
              <div className="mt-1 font-display text-[28px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(next)}</div>
              <div className="mt-1 text-sm text-muted-dark">{[next.course_name, `${next.holes} holes`].join(' · ')}</div>
            </div>
            <div className="flex items-center justify-between border-t border-white/10 pt-3.5">
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
              <span className="inline-flex items-center gap-1 text-sm font-semibold text-flag">
                Open <Icon name="back" size={16} className="rotate-180" />
              </span>
            </div>
          </Link>
        ) : (
          <div className="relative mt-6 rounded-[26px] border border-white/15 bg-white/[0.08] p-5 backdrop-blur-xl">
            <div className="font-display text-[22px] font-bold tracking-[-0.02em]">Nothing in your diary yet</div>
            <p className="mt-1 mb-4 text-sm text-muted-dark">Join an open game near you, or host one and fill your four.</p>
            <LinkButton to="/discover" variant="flag">Find a game</LinkButton>
          </div>
        )}
      </section>

      <div className="flex flex-col gap-6 px-5">
        {waiting.length > 0 && (
          <Link
            to={`/rounds/${waiting[0].round.id}/requests`}
            className="flex items-center gap-3 rounded-[20px] border border-line bg-card p-3.5 text-fairway no-underline"
          >
            <Avatar name={waiting[0].request.profile?.display_name ?? 'Golfer'} src={waiting[0].request.profile?.avatar_url} size={40} />
            <div className="min-w-0 flex-1">
              <div className="line-clamp-2 text-[15px] leading-snug">
                <strong className="font-semibold">{shortName(waiting[0].request.profile?.display_name ?? null)}</strong> wants to join{' '}
                <strong className="font-semibold">{roundTitle(waiting[0].round)}</strong>
              </div>
              <div className="text-[13px] text-muted">
                {waiting.length > 1 ? `${waiting.length} requests waiting` : 'Waiting for your answer'}
              </div>
            </div>
            <span className="rounded-full bg-green px-3.5 py-2 text-sm font-semibold text-white">Review</span>
          </Link>
        )}

        <section aria-label="Quick actions" className="grid grid-cols-2 gap-3">
          <Link to="/discover" className="flex flex-col gap-4 rounded-[20px] border border-line bg-card p-4 text-fairway no-underline">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-green-tint text-green">
              <Icon name="search" size={22} />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">Find a game</span>
              <span className="block truncate text-[13px] text-muted">{open.length ? `${open.length} open near you` : 'None open yet'}</span>
            </span>
          </Link>
          <Link to="/host" className="flex flex-col gap-4 rounded-[20px] bg-green p-4 text-white no-underline">
            <span className="grid size-11 shrink-0 place-items-center rounded-full bg-white/15">
              <Icon name="flag" size={22} />
            </span>
            <span className="min-w-0">
              <span className="block font-semibold">Host a round</span>
              <span className="block truncate text-[13px] text-white/80">Always free</span>
            </span>
          </Link>
        </section>

        <section aria-label="Games for you" className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="m-0 font-display text-[20px] font-bold tracking-[-0.02em]">Picked for you</h2>
            <Link to="/discover" className="text-sm font-medium text-green no-underline">See all</Link>
          </div>
          {picks.length ? (
            <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
              {picks.map((p) => (
                <RoundCard key={p.round.id} {...p} />
              ))}
            </div>
          ) : (
            <Empty title="No games near you yet">
              <LinkButton to="/host">Host one</LinkButton>
            </Empty>
          )}
        </section>
      </div>
    </div>
  )
}
