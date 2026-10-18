import { Link } from 'react-router-dom'
import { Contours } from '../../components/Contours'
import { AvatarStack, Icon, Logo } from '../../components/ui'
import { dayLabel, teeTime } from '../../lib/format'
import { roundTitle } from '../../lib/rounds'
import { lineup, spotsText } from './helpers'
import { Bell, Greeting, PickCard, RequestRow } from './parts'
import type { HomeData } from './useHomeData'

const card = 'rounded-[24px] bg-card shadow-[0_14px_30px_-18px_rgba(14,31,22,0.35)]'

function Heading({ children, action }: { children: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="m-0 font-display text-[20px] font-bold tracking-[-0.02em]">{children}</h2>
      {action}
    </div>
  )
}

// Option 1: a bright brand-green header with white cards floating over its edge.
export function HomeFresh({ d }: { d: HomeData }) {
  const next = d.next
  return (
    <div className="-mx-5 -mt-5 flex flex-col">
      <section className="relative overflow-hidden rounded-b-[36px] bg-gradient-to-br from-[#1E9A4C] via-green to-green-dark px-5 pt-5 pb-24 text-white">
        <div aria-hidden="true" className="absolute -top-16 -right-10 size-56 rounded-full bg-flag/30 blur-3xl" />
        <Contours className="text-white/[0.12]" />
        <header className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-[13px] shadow-[0_0_0_1.5px_rgba(255,255,255,0.9)]">
              <Logo size={36} />
            </span>
            <Greeting name={d.name} onDark />
          </div>
          <Bell waiting={d.waiting} className="bg-white/20 text-white backdrop-blur" />
        </header>
      </section>

      <div className="relative -mt-16 flex flex-col gap-6 px-5">
        <div className={`${card} flex flex-col gap-4 p-4`}>
          {next ? (
            <Link to={`/rounds/${next.id}`} className="flex flex-col gap-3 text-fairway no-underline">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-flag px-3 py-1 text-[13px] font-semibold">
                  {dayLabel(next.tee_time)} · <span className="font-mono">{teeTime(next.tee_time)}</span>
                </span>
                {d.forecast && (
                  <span className="rounded-full bg-chip px-2.5 py-1 text-xs">
                    <span className="font-mono">{d.forecast.temp}°</span> · {d.forecast.label}
                  </span>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold tracking-[0.08em] text-green uppercase">Your next round</div>
                <div className="font-display text-[26px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(next)}</div>
                <div className="mt-1 text-sm text-muted">{next.course_name} · {next.holes} holes</div>
              </div>
              <div className="flex items-center gap-2.5">
                <AvatarStack players={lineup(next)} total={next.max_players} />
                <span className="text-[13px] text-muted">{spotsText(next)}</span>
              </div>
            </Link>
          ) : (
            <div>
              <div className="font-display text-[22px] font-bold tracking-[-0.02em]">Nothing booked yet</div>
              <p className="mt-1 mb-0 text-sm text-muted">Join an open game near you, or host one and fill your four.</p>
            </div>
          )}
          <div className="grid grid-cols-2 gap-2">
            <Link to="/discover" className="flex flex-col gap-2 rounded-[18px] bg-green-tint p-3 text-green-dark no-underline">
              <Icon name="search" size={22} />
              <span className="font-semibold">Find a game</span>
              <span className="-mt-2 text-[13px] opacity-80">{d.openCount} open near you</span>
            </Link>
            <Link to="/host" className="flex flex-col gap-2 rounded-[18px] bg-fairway p-3 text-white no-underline">
              <span className="text-flag"><Icon name="flag" size={22} /></span>
              <span className="font-semibold">Host a round</span>
              <span className="-mt-2 text-[13px] text-muted-dark">Always free</span>
            </Link>
          </div>
        </div>

        {d.waiting.length > 0 && (
          <section className="flex flex-col gap-3">
            <Heading>Waiting on you</Heading>
            <div className={`${card} divide-y divide-line-soft`}>
              {d.waiting.slice(0, 3).map((w) => <RequestRow key={w.request.id} {...w} />)}
            </div>
          </section>
        )}

        <section className="flex flex-col gap-3">
          <Heading action={<Link to="/discover" className="text-sm font-medium text-green no-underline">See all</Link>}>Picked for you</Heading>
          {d.picks.length ? (
            <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pt-1 pb-6">
              {d.picks.map((p) => <PickCard key={p.round.id} {...p} className={card} />)}
            </div>
          ) : (
            <div className={`${card} p-4 text-sm text-muted`}>No open games near you yet. Host one and golfers can join you.</div>
          )}
        </section>
      </div>
    </div>
  )
}
