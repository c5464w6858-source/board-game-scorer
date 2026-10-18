import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import photo from '../assets/login-group.jpg'
import { Contours } from '../components/Contours'
import { GolfBall, dimpleTexture } from '../components/GolfBall'
import { Grain } from '../components/Grain'
import { HoleArt } from '../components/HoleArt'
import { AvatarStack, ErrorNote, Icon, Loading, Logo } from '../components/ui'
import { dayLabel, teeOffIn, teeTime } from '../lib/format'
import { roundTitle } from '../lib/rounds'
import { lineup, spotsText } from './home/helpers'
import { Bell, Greeting, PickCard, WaitingCard } from './home/parts'
import { Scorecard } from './home/Scorecard'
import { useHomeData } from './home/useHomeData'

// One card style for everything on the light sheet: frosted white over the
// sheet's colour washes, with a highlight on the top edge and layered shadow.
const card =
  'rounded-[22px] border border-white/90 bg-white/80 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.9),0_1px_2px_rgba(14,31,22,0.06),0_16px_32px_-20px_rgba(14,31,22,0.45)]'

function Section({ title, badge, action, children }: { title: string; badge?: number; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="relative flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <h2 className="m-0 flex items-center gap-2 text-xs font-bold tracking-[0.08em] text-fairway/80 uppercase">
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

      <section className="relative overflow-hidden bg-[radial-gradient(120%_90%_at_100%_0%,#24653C_0%,transparent_55%),radial-gradient(90%_70%_at_0%_100%,#1A3D29_0%,transparent_60%),linear-gradient(180deg,#0E1F16_0%,#12291C_100%)] px-5 pt-5 pb-14 text-white">
        {/* The login's photo, very faded and tinted into the green. */}
        <img src={photo} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover object-[45%_30%] opacity-25 mix-blend-luminosity" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-fairway/40 to-fairway/70" />
        <div aria-hidden="true" className="absolute -top-10 right-6 size-40 rounded-full bg-flag/15 blur-3xl" />
        <div aria-hidden="true" className="absolute inset-0" style={{ backgroundImage: dimpleTexture }} />
        <Contours className="text-white/[0.07]" />
        <GolfBall className="pointer-events-none absolute -top-16 -right-20 size-56 opacity-[0.13]" />
        <Grain opacity={0.12} />
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
          <Link to="/discover" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#DBF79A] to-flag font-semibold text-fairway no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_-8px_rgba(200,241,105,0.55)]">
            <Icon name="search" size={18} /> Find a game
          </Link>
          <Link to="/host" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.08] font-semibold text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur">
            <Icon name="flag" size={18} /> Host a round
          </Link>
        </div>
      </section>

      <div className="relative -mt-7 flex min-h-[calc(100vh-12rem)] flex-col gap-6 rounded-t-[30px] px-5 pt-6 pb-4">
        {/* Warm gradient with soft colour washes; the frosted cards pick these up. */}
        <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-t-[30px] bg-gradient-to-b from-[#F4F2EC] to-[#E7E4DA]">
          <img src={photo} alt="" className="absolute inset-x-0 top-0 h-[70%] w-full scale-105 object-cover object-[45%_40%] opacity-[0.14] blur-[2px] grayscale-[40%]" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#F1EFE8]/40 to-[#E7E4DA]" />
          <div className="absolute top-24 -left-20 size-72 rounded-full bg-[#9DC39A]/45 blur-3xl" />
          <div className="absolute top-[42%] -right-24 size-72 rounded-full bg-flag/35 blur-3xl" />
          <div className="absolute bottom-10 left-10 size-64 rounded-full bg-[#B7D3B0]/40 blur-3xl" />
          <Grain opacity={0.06} />
        </div>
        {d.loading ? (
          <div className="relative"><Loading /></div>
        ) : d.error ? (
          <div className="relative"><ErrorNote message={d.error} /></div>
        ) : (
          <>
            <Section title="Next on the tee">
              <div className={`${card} overflow-hidden`}>
                <div className="relative h-[124px]">
                  <HoleArt className="size-full" />
                  {next && (
                    <>
                      <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-fairway px-3 py-1 text-[13px] font-semibold text-white">
                        <Icon name="tee" size={15} className="text-flag" />
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
                      <div className="text-xs font-semibold text-green">{teeOffIn(next.tee_time)}</div>
                      <div className="font-display text-[24px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(next)}</div>
                      <div className="mt-1 text-sm text-[#4A544E]">{next.course_name}</div>
                    </div>
                    <Scorecard round={next} />
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

            <Section title="Tee times for you" action={<Link to="/discover" className="text-sm font-medium text-green no-underline">See all</Link>}>
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
