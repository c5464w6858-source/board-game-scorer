import { Link } from 'react-router-dom'
import { HoleArt } from '../../components/HoleArt'
import { AvatarStack, Icon, Logo } from '../../components/ui'
import { dayLabel, teeTime } from '../../lib/format'
import { roundTitle } from '../../lib/rounds'
import { lineup, spotsText } from './helpers'
import { Bell, Greeting, PickCard, RequestRow } from './parts'
import type { HomeData } from './useHomeData'

const card = 'rounded-[24px] border border-line bg-card'

// Option 2: light page; the next round is illustrated with a drawn golf hole.
export function HomeCourse({ d }: { d: HomeData }) {
  const next = d.next
  return (
    <div className="flex flex-col gap-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Logo size={36} />
          <Greeting name={d.name} />
        </div>
        <Bell waiting={d.waiting} className="border border-line bg-card text-fairway" />
      </header>

      <div className={`${card} overflow-hidden shadow-[0_18px_36px_-24px_rgba(14,31,22,0.45)]`}>
        <div className="relative h-[150px]">
          <HoleArt className="size-full" />
          {next && (
            <>
              <span className="absolute top-3 left-3 rounded-full bg-fairway px-3 py-1 text-[13px] font-semibold text-white">
                {dayLabel(next.tee_time)} · <span className="font-mono text-flag">{teeTime(next.tee_time)}</span>
              </span>
              {d.forecast && (
                <span className="absolute right-3 bottom-3 rounded-full bg-white/90 px-2.5 py-1 text-xs">
                  <span className="font-mono">{d.forecast.temp}°</span> · {d.forecast.label}
                </span>
              )}
            </>
          )}
        </div>
        <div className="flex flex-col gap-4 p-4">
          {next ? (
            <Link to={`/rounds/${next.id}`} className="flex flex-col gap-3 text-fairway no-underline">
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
          <div className="grid grid-cols-2 gap-2 border-t border-line-soft pt-4">
            <Link to="/discover" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-green font-semibold text-white no-underline">
              <Icon name="search" size={18} /> Find a game
            </Link>
            <Link to="/host" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-line font-semibold text-fairway no-underline">
              <Icon name="flag" size={18} /> Host a round
            </Link>
          </div>
        </div>
      </div>

      {d.waiting.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="m-0 font-display text-[20px] font-bold tracking-[-0.02em]">Waiting on you</h2>
          <div className={`${card} divide-y divide-line-soft`}>
            {d.waiting.slice(0, 3).map((w) => <RequestRow key={w.request.id} {...w} />)}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-baseline justify-between">
          <h2 className="m-0 font-display text-[20px] font-bold tracking-[-0.02em]">Picked for you</h2>
          <Link to="/discover" className="text-sm font-medium text-green no-underline">See all</Link>
        </div>
        {d.picks.length ? (
          <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
            {d.picks.map((p) => <PickCard key={p.round.id} {...p} className={card} />)}
          </div>
        ) : (
          <div className={`${card} p-4 text-sm text-muted`}>No open games near you yet. Host one and golfers can join you.</div>
        )}
      </section>
    </div>
  )
}
