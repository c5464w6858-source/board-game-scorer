import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HoleArt } from '../../components/HoleArt'
import { AvatarStack, Icon, type IconName } from '../../components/ui'
import { dayLabel, teeOffIn, teeTime } from '../../lib/format'
import { roundTitle } from '../../lib/rounds'
import { lineup, spotsText } from './helpers'
import { PickCard, WaitingCard } from './parts'
import { Scorecard } from './Scorecard'
import type { HomeData } from './useHomeData'

// Building blocks shared by the Home layouts.

// Section heading anchored by an icon badge and a rule running to the edge.
export function Section({ title, icon, badge, action, children }: { title: string; icon: IconName; badge?: number; action?: ReactNode; children: ReactNode }) {
  return (
    <section className="relative flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-fairway text-flag shadow-[0_4px_10px_-4px_rgba(14,31,22,0.5)]">
          <Icon name={icon} size={16} />
        </span>
        <h2 className="m-0 font-display text-[19px] font-bold tracking-[-0.02em] text-fairway">{title}</h2>
        {badge ? (
          <span className="grid min-w-6 place-items-center rounded-full bg-alert px-1.5 font-mono text-[12px] leading-6 font-semibold text-white">{badge}</span>
        ) : null}
        <span aria-hidden="true" className="h-px flex-1 bg-fairway/15" />
        {action}
      </div>
      {children}
    </section>
  )
}

export function Actions() {
  return (
    <div className="relative grid grid-cols-2 gap-2.5">
      <Link
        to="/discover"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#DBF79A] to-flag font-semibold text-fairway no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.6),0_8px_20px_-8px_rgba(200,241,105,0.55)]"
      >
        <Icon name="search" size={18} /> Find a game
      </Link>
      <Link
        to="/host"
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/[0.08] font-semibold text-white no-underline shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur"
      >
        <Icon name="flag" size={18} /> Host a round
      </Link>
    </div>
  )
}

function NothingBooked() {
  return (
    <div className="p-4">
      <div className="font-display text-[22px] font-bold tracking-[-0.02em]">Nothing booked yet</div>
      <p className="mt-1 mb-0 text-sm text-muted">Find an open game near you, or host one and fill your four.</p>
    </div>
  )
}

function TeeChip({ iso }: { iso: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-fairway px-3 py-1 text-[13px] font-semibold text-white">
      <Icon name="tee" size={15} className="text-flag" />
      {dayLabel(iso)} · <span className="font-mono text-flag">{teeTime(iso)}</span>
    </span>
  )
}

// Next round with the drawn golf hole on top.
export function NextRoundHole({ d, card }: { d: HomeData; card: string }) {
  const next = d.next
  return (
    <div className={`${card} overflow-hidden`}>
      <div className="relative h-[124px]">
        <HoleArt className="size-full" />
        {next && (
          <>
            <span className="absolute top-3 left-3"><TeeChip iso={next.tee_time} /></span>
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
        <NothingBooked />
      )}
    </div>
  )
}

export function Requests({ d, card }: { d: HomeData; card: string }) {
  if (!d.waiting.length) return null
  return (
    <Section title="Join requests" icon="user" badge={d.waiting.length}>
      <WaitingCard waiting={d.waiting} onDone={d.reload} className={card} />
    </Section>
  )
}

export function Picks({ d, card }: { d: HomeData; card: string }) {
  return (
    <Section title="Tee times for you" icon="compass" action={<Link to="/discover" className="text-sm font-semibold text-green no-underline">See all</Link>}>
      {d.picks.length ? (
        <div className="-mx-5 -my-3 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 py-3 pb-5">
          {d.picks.map((p) => <PickCard key={p.round.id} {...p} className={card} />)}
        </div>
      ) : (
        <div className={`${card} p-4 text-sm text-muted`}>No open games near you yet. Host one and golfers can join you.</div>
      )}
    </Section>
  )
}
