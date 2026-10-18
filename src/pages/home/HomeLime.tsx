import { Link } from 'react-router-dom'
import { Contours } from '../../components/Contours'
import { AvatarStack, Icon, Logo } from '../../components/ui'
import { dayLabel, teeTime } from '../../lib/format'
import { roundTitle } from '../../lib/rounds'
import { lineup, spotsText } from './helpers'
import { Bell, Greeting, PickCard, RequestRow } from './parts'
import type { HomeData } from './useHomeData'

const glass = 'rounded-[24px] border border-white/80 bg-white/70 backdrop-blur-xl shadow-[0_14px_30px_-22px_rgba(14,31,22,0.4)]'

// Option 3: a pale lime-to-cream wash, one dark accent card, frosted white cards
// and a colour strip per game format.
export function HomeLime({ d }: { d: HomeData }) {
  const next = d.next
  return (
    <div className="relative -mx-5 -mt-5 px-5 pt-5">
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] overflow-hidden bg-gradient-to-b from-[#DDF1C9] via-[#EAF3E2] to-clubhouse">
        <div className="absolute -top-20 -right-16 size-72 rounded-full bg-flag/50 blur-3xl" />
        <div className="absolute top-40 -left-24 size-64 rounded-full bg-green/15 blur-3xl" />
      </div>

      <div className="relative flex flex-col gap-6">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <Greeting name={d.name} />
          </div>
          <Bell waiting={d.waiting} className="border border-white/80 bg-white/70 text-fairway backdrop-blur" />
        </header>

        <div className="relative overflow-hidden rounded-[26px] bg-fairway p-4 text-white shadow-[0_20px_36px_-20px_rgba(14,31,22,0.6)]">
          <div aria-hidden="true" className="absolute -right-14 -bottom-16 size-48 rounded-full bg-green/50 blur-2xl" />
          <Contours className="text-white/[0.08]" />
          <div className="relative flex flex-col gap-4">
            {next ? (
              <Link to={`/rounds/${next.id}`} className="flex flex-col gap-3 text-white no-underline">
                <div className="flex items-center justify-between gap-2">
                  <span className="rounded-full bg-flag px-3 py-1 text-[13px] font-semibold text-fairway">
                    {dayLabel(next.tee_time)} · <span className="font-mono">{teeTime(next.tee_time)}</span>
                  </span>
                  {d.forecast && (
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs">
                      <span className="font-mono">{d.forecast.temp}°</span> · {d.forecast.label}
                    </span>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold tracking-[0.08em] text-muted-dark uppercase">Your next round</div>
                  <div className="font-display text-[26px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(next)}</div>
                  <div className="mt-1 text-sm text-muted-dark">{next.course_name} · {next.holes} holes</div>
                </div>
                <div className="flex items-center gap-2.5">
                  <AvatarStack players={lineup(next)} total={next.max_players} onDark />
                  <span className="text-[13px] text-muted-dark">{spotsText(next)}</span>
                </div>
              </Link>
            ) : (
              <div>
                <div className="font-display text-[22px] font-bold tracking-[-0.02em]">Nothing booked yet</div>
                <p className="mt-1 mb-0 text-sm text-muted-dark">Join an open game near you, or host one and fill your four.</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/discover" className={`${glass} flex items-center gap-2.5 px-3 py-3 text-fairway no-underline`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-flag"><Icon name="search" size={20} /></span>
            <span className="text-[15px] font-semibold whitespace-nowrap">Find a game</span>
          </Link>
          <Link to="/host" className={`${glass} flex items-center gap-2.5 px-3 py-3 text-fairway no-underline`}>
            <span className="grid size-9 shrink-0 place-items-center rounded-full bg-green text-white"><Icon name="flag" size={20} /></span>
            <span className="text-[15px] font-semibold whitespace-nowrap">Host a round</span>
          </Link>
        </div>

        {d.waiting.length > 0 && (
          <section className="flex flex-col gap-3">
            <h2 className="m-0 font-display text-[20px] font-bold tracking-[-0.02em]">Waiting on you</h2>
            <div className={`${glass} divide-y divide-line-soft`}>
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
              {d.picks.map((p) => <PickCard key={p.round.id} {...p} accent className={glass} />)}
            </div>
          ) : (
            <div className={`${glass} p-4 text-sm text-muted`}>No open games near you yet. Host one and golfers can join you.</div>
          )}
        </section>
      </div>
    </div>
  )
}
