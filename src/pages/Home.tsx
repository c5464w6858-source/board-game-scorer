import { Link } from 'react-router-dom'
import heroImg from '../assets/hero-green.jpg'
import { RoundCard } from '../components/RoundCard'
import { AvatarStack, ErrorNote, Icon, Loading, Logo, Empty, LinkButton } from '../components/ui'
import { dayLabel, firstName, greeting, longDate, teeTime } from '../lib/format'
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
  const waiting = all.filter((r) => r.host_id === me.id).flatMap((r) => pendingRequests(r).map(() => r.id))

  return (
    <div className="flex flex-col gap-[22px]">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Logo />
          <div>
            <div className="text-[13px] text-muted">{longDate(new Date())}</div>
            <div className="font-display text-[22px] font-bold tracking-[-0.02em]">
              {greeting()}, {firstName(profile?.display_name ?? null)}
            </div>
          </div>
        </div>
        <Link
          to={waiting.length ? `/rounds/${waiting[0]}/requests` : '/chats'}
          aria-label={waiting.length ? `${waiting.length} join requests waiting` : 'Notifications'}
          className="relative grid size-11 place-items-center rounded-full border border-line bg-card text-fairway"
        >
          <Icon name="bell" size={20} />
          {waiting.length > 0 && (
            <span className="absolute top-[9px] right-2.5 size-[9px] rounded-full border-2 border-card bg-alert" />
          )}
        </Link>
      </header>

      {next ? (
        <section aria-label="Your next round" className="overflow-hidden rounded-3xl bg-fairway text-white">
          <div className="relative h-32">
            <img src={heroImg} alt="" className="size-full object-cover opacity-85" />
            <div className="absolute top-3.5 left-4 rounded-full bg-flag px-2.5 py-1 text-xs font-semibold text-fairway">
              {dayLabel(next.tee_time)} · <span className="font-mono">{teeTime(next.tee_time)}</span>
            </div>
            {forecast && (
              <div className="absolute top-3.5 right-4 rounded-full bg-fairway/70 px-2.5 py-1 text-xs">
                {forecast.temp}° · {forecast.label}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3.5 px-4 pt-4 pb-[18px]">
            <div>
              <div className="font-display text-[22px] font-bold tracking-[-0.02em]">{roundTitle(next)}</div>
              <div className="mt-0.5 text-sm text-muted-dark">
                {[next.course_name, next.course?.town, `${next.holes} holes`].filter(Boolean).join(' · ')}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AvatarStack
                  onDark
                  total={next.max_players}
                  players={[
                    { name: next.host?.display_name ?? 'Host', avatarUrl: next.host?.avatar_url },
                    ...acceptedPlayers(next).map((p) => ({
                      name: p.profile?.display_name ?? 'Golfer',
                      avatarUrl: p.profile?.avatar_url,
                    })),
                  ]}
                />
                <span className="ml-2.5 text-[13px] text-muted-dark">
                  {spotsLeft(next) ? `${spotsLeft(next)} spot${spotsLeft(next) === 1 ? '' : 's'} open` : 'Full'}
                </span>
              </div>
              <LinkButton to={`/rounds/${next.id}`} variant="outline">
                Open round
              </LinkButton>
            </div>
          </div>
        </section>
      ) : (
        <Empty title="No round in your diary">
          <p className="m-0 text-sm text-muted">Find a game near you, or host one and fill your four.</p>
        </Empty>
      )}

      <section aria-label="Quick actions" className="grid grid-cols-2 gap-3">
        <Link to="/discover" className="flex flex-col gap-[18px] rounded-[20px] border border-line bg-card p-4 text-fairway no-underline">
          <span className="text-green"><Icon name="search" size={26} /></span>
          <span>
            <span className="block font-semibold">Find a game</span>
            <span className="block text-[13px] text-muted">
              {open.length ? `${open.length} open near you` : 'No open games yet'}
            </span>
          </span>
        </Link>
        <Link to="/host" className="flex flex-col gap-[18px] rounded-[20px] bg-green p-4 text-white no-underline">
          <Icon name="flag" size={26} />
          <span>
            <span className="block font-semibold">Host a round</span>
            <span className="block text-[13px] text-[#D5EBDC]">Fill your four</span>
          </span>
        </Link>
      </section>

      <section aria-label="Games for you" className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="m-0 font-display text-[19px] font-bold tracking-[-0.01em]">Picked for you</h2>
          <Link to="/discover" className="text-sm font-medium text-green no-underline">See all</Link>
        </div>
        {picks.length ? (
          <div className="-mr-5 flex gap-3 overflow-x-auto pr-5">
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
  )
}
