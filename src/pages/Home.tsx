import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Contours } from '../components/Contours'
import { HoleArt } from '../components/HoleArt'
import { AvatarStack, ErrorNote, Icon, Loading, Logo } from '../components/ui'
import { dayLabel, teeTime } from '../lib/format'
import { roundTitle } from '../lib/rounds'
import { lineup, spotsText } from './home/helpers'
import { Bell, Greeting, PickCard, WaitingCard } from './home/parts'
import { useHomeData } from './home/useHomeData'

// One card style for everything on the light sheet.
const card = 'rounded-[22px] border border-line bg-card shadow-[0_10px_24px_-20px_rgba(14,31,22,0.35)]'

function Section({ title, badge, action, children }: { title: string; badge?: number; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="m-0 flex items-center gap-2 text-xs font-semibold tracking-[0.08em] text-muted uppercase">
          {title}
          {badge ? (
            <span className="grid min-w-5 place-items-center rounded-full bg-alert px-1.5 font-mono text-[11px] leading-5 tracking-normal text-white">{badge}</span>
          ) : null}
        </h2>
        {action}
      </div>
      {children}
    </section>
  )
}

// Home: a dark header for who you are and what you can do, then one light
// sheet holding your golf, every section in the same card style.
export function Home() {
  const d = useHomeData()
  const next = d.next

  return (
    <div className="relative -mx-5 -mt-5">
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] bg-fairway" />

      <section className="relative overflow-hidden bg-gradient-to-b from-fairway to-fairway-2 px-5 pt-5 pb-14 text-white">
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
        <div className="relative mt-6 grid grid-cols-2 gap-2.5">
          <Link to="/discover" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-flag font-semibold text-fairway no-underline">
            <Icon name="search" size={18} /> Find a game
          </Link>
          <Link to="/host" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 font-semibold text-white no-underline">
            <Icon name="flag" size={18} /> Host a round
          </Link>
        </div>
      </section>

      <div className="relative -mt-7 flex min-h-[calc(100vh-12rem)] flex-col gap-6 rounded-t-[30px] bg-clubhouse px-5 pt-6 pb-4">
        {d.loading ? (
          <Loading />
        ) : d.error ? (
          <ErrorNote message={d.error} />
        ) : (
          <>
            <Section title="Your next round">
              <div className={`${card} overflow-hidden`}>
                <div className="relative h-[124px]">
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
                      <div className="font-display text-[24px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(next)}</div>
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
                    <div className="font-display text-[22px] font-bold tracking-[-0.02em]">Nothing booked yet</div>
                    <p className="mt-1 mb-0 text-sm text-muted">Find an open game near you, or host one and fill your four.</p>
                  </div>
                )}
              </div>
            </Section>

            {d.waiting.length > 0 && (
              <Section title="Join requests" badge={d.waiting.length}>
                <WaitingCard waiting={d.waiting} onDone={d.reload} className={card} />
              </Section>
            )}

            <Section title="Picked for you" action={<Link to="/discover" className="text-sm font-medium text-green no-underline">See all</Link>}>
              {d.picks.length ? (
                <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
                  {d.picks.map((p) => <PickCard key={p.round.id} {...p} className={card} />)}
                </div>
              ) : (
                <div className={`${card} p-4 text-sm text-muted`}>No open games near you yet. Host one and golfers can join you.</div>
              )}
            </Section>
          </>
        )}
      </div>
    </div>
  )
}
