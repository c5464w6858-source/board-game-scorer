import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Contours } from '../components/Contours'
import { HoleArt } from '../components/HoleArt'
import { AvatarStack, ErrorNote, Icon, Loading, Logo } from '../components/ui'
import { dayLabel, teeTime } from '../lib/format'
import { roundTitle } from '../lib/rounds'
import { lineup, spotsText } from './home/helpers'
import { Bell, Greeting, PickCard, RequestRow } from './home/parts'
import { useHomeData } from './home/useHomeData'

// Clean white panel used for everything below the next-round card.
const panel = 'rounded-[22px] border border-line bg-card shadow-[0_10px_24px_-20px_rgba(14,31,22,0.35)]'

function Section({ title, action, children }: { title: string; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="m-0 text-xs font-semibold tracking-[0.08em] text-muted uppercase">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

export function Home() {
  const d = useHomeData()
  const next = d.next

  return (
    <div className="relative -mx-5 -mt-5">
      {/* Warm clubhouse cream behind the whole screen, as on the login card. */}
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] bg-clubhouse" />

      <section className="relative overflow-hidden rounded-b-[32px] bg-gradient-to-b from-fairway to-fairway-2 px-5 pt-5 pb-24 text-white">
        <div aria-hidden="true" className="absolute -top-24 -right-16 size-64 rounded-full bg-green/30 blur-3xl" />
        <Contours className="text-white/[0.06]" />
        <header className="relative flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="rounded-[13px] shadow-[0_0_0_1.5px_rgba(255,255,255,0.9)]">
              <Logo size={36} />
            </span>
            <Greeting name={d.name} onDark />
          </div>
          <Bell waiting={d.waiting} className="border border-white/15 bg-white/10 text-white backdrop-blur" />
        </header>
      </section>

      <div className="relative -mt-16 flex flex-col gap-6 px-5">
        {d.loading ? (
          <div className={panel}>
            <Loading />
          </div>
        ) : d.error ? (
          <ErrorNote message={d.error} />
        ) : (
          <>
            <div className="overflow-hidden rounded-[24px] border border-line bg-card shadow-[0_20px_40px_-24px_rgba(14,31,22,0.5)]">
              <div className="relative h-[140px]">
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
              {next ? (
                <Link to={`/rounds/${next.id}`} className="flex flex-col gap-3 p-4 text-fairway no-underline">
                  <div>
                    <div className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Your next round</div>
                    <div className="font-display text-[26px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(next)}</div>
                    <div className="mt-1 text-sm text-muted">{next.course_name} · {next.holes} holes</div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <AvatarStack players={lineup(next)} total={next.max_players} />
                      <span className="text-[13px] text-muted">{spotsText(next)}</span>
                    </div>
                    <Icon name="back" size={18} className="rotate-180 text-muted" />
                  </div>
                </Link>
              ) : (
                <div className="p-4">
                  <div className="text-xs font-semibold tracking-[0.08em] text-muted uppercase">Your next round</div>
                  <div className="font-display text-[22px] font-bold tracking-[-0.02em]">Nothing booked yet</div>
                  <p className="mt-1 mb-0 text-sm text-muted">Join an open game near you, or host one and fill your four.</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Link to="/discover" className={`${panel} flex items-center gap-2.5 px-3 py-3 text-fairway no-underline`}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fairway text-flag"><Icon name="search" size={18} /></span>
                <span className="text-[15px] font-semibold whitespace-nowrap">Find a game</span>
              </Link>
              <Link to="/host" className={`${panel} flex items-center gap-2.5 px-3 py-3 text-fairway no-underline`}>
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-fairway text-flag"><Icon name="flag" size={18} /></span>
                <span className="text-[15px] font-semibold whitespace-nowrap">Host a round</span>
              </Link>
            </div>

            {d.waiting.length > 0 && (
              <Section title="Waiting on you">
                <div className={`${panel} divide-y divide-line-soft`}>
                  {d.waiting.slice(0, 3).map((w) => <RequestRow key={w.request.id} {...w} />)}
                </div>
              </Section>
            )}

            <Section title="Picked for you" action={<Link to="/discover" className="text-sm font-medium text-green no-underline">See all</Link>}>
              {d.picks.length ? (
                <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
                  {d.picks.map((p) => <PickCard key={p.round.id} {...p} className={panel} />)}
                </div>
              ) : (
                <div className={`${panel} p-4 text-sm text-muted`}>No open games near you yet. Host one and golfers can join you.</div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}
