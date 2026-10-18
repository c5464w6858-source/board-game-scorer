import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import photo from '../../assets/login-group.jpg'
import { HoleArt } from '../../components/HoleArt'
import { AvatarStack, Icon } from '../../components/ui'
import { dayLabel, teeOffIn, teeTime } from '../../lib/format'
import { roundTitle } from '../../lib/rounds'
import { lineup, spotsText } from './helpers'
import { PickCard, WaitingCard } from './parts'
import { Scorecard } from './Scorecard'
import type { HomeData } from './useHomeData'

// Building blocks shared by the Home layouts.

export function Section({ title, badge, action, onDark, children }: { title: string; badge?: number; action?: ReactNode; onDark?: boolean; children: ReactNode }) {
  return (
    <section className="relative flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1">
        <h2 className={`m-0 flex items-center gap-2 text-xs font-bold tracking-[0.08em] uppercase ${onDark ? 'text-white/85' : 'text-fairway/80'}`}>
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

export function Actions({ onDark }: { onDark: boolean }) {
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
        className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-full font-semibold no-underline ${
          onDark
            ? 'border border-white/20 bg-white/[0.08] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur'
            : 'bg-fairway text-white shadow-[0_8px_20px_-10px_rgba(14,31,22,0.6)]'
        }`}
      >
        <Icon name="flag" size={18} /> Host a round
      </Link>
    </div>
  )
}

function NothingBooked({ onDark }: { onDark?: boolean }) {
  return (
    <div className="p-4">
      <div className="font-display text-[22px] font-bold tracking-[-0.02em]">Nothing booked yet</div>
      <p className={`mt-1 mb-0 text-sm ${onDark ? 'text-white/80' : 'text-muted'}`}>Find an open game near you, or host one and fill your four.</p>
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

// Next round as a large photo card: golfers behind a green tint, white text.
export function NextRoundPhoto({ d }: { d: HomeData }) {
  const next = d.next
  return (
    <div className="relative overflow-hidden rounded-[26px] text-white shadow-[0_24px_44px_-24px_rgba(14,31,22,0.7)]">
      <img src={photo} alt="" aria-hidden="true" className="absolute inset-0 size-full object-cover object-[42%_30%]" />
      <div aria-hidden="true" className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,36,22,0.55)_0%,rgba(12,36,22,0.7)_45%,rgba(10,30,19,0.92)_100%)]" />
      {next ? (
        <Link to={`/rounds/${next.id}`} className="relative flex flex-col gap-3 p-4 text-white no-underline">
          <div className="flex items-center justify-between gap-2">
            <TeeChip iso={next.tee_time} />
            {d.forecast && (
              <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs backdrop-blur">
                <span className="font-mono">{d.forecast.temp}°</span> · {d.forecast.label}
              </span>
            )}
          </div>
          <div className="pt-16">
            <div className="text-xs font-semibold text-flag">{teeOffIn(next.tee_time)}</div>
            <div className="font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">{roundTitle(next)}</div>
            <div className="mt-1 text-sm text-white/85">{next.course_name}</div>
          </div>
          <Scorecard round={next} onDark />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <AvatarStack players={lineup(next)} total={next.max_players} onDark />
              <span className="text-[13px] text-white/85">{spotsText(next)}</span>
            </div>
            <Icon name="back" size={18} className="rotate-180 text-white/80" />
          </div>
        </Link>
      ) : (
        <div className="relative pt-24"><NothingBooked onDark /></div>
      )}
    </div>
  )
}

export function Requests({ d, card, onDark }: { d: HomeData; card: string; onDark?: boolean }) {
  if (!d.waiting.length) return null
  return (
    <Section title="Join requests" badge={d.waiting.length} onDark={onDark}>
      <WaitingCard waiting={d.waiting} onDone={d.reload} className={card} />
    </Section>
  )
}

export function Picks({ d, card, onDark }: { d: HomeData; card: string; onDark?: boolean }) {
  return (
    <Section
      title="Tee times for you"
      onDark={onDark}
      action={<Link to="/discover" className={`text-sm font-medium no-underline ${onDark ? 'text-flag' : 'text-green'}`}>See all</Link>}
    >
      {d.picks.length ? (
        <div className="-mx-5 flex snap-x scroll-px-5 gap-3 overflow-x-auto px-5 pb-2">
          {d.picks.map((p) => <PickCard key={p.round.id} {...p} className={card} />)}
        </div>
      ) : (
        <div className={`${card} p-4 text-sm text-muted`}>No open games near you yet. Host one and golfers can join you.</div>
      )}
    </Section>
  )
}
