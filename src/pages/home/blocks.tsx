import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Pick } from '../../components/controls'
import { HoleArt } from '../../components/HoleArt'
import { Section } from '../../components/Section'
import { AvatarStack, Icon } from '../../components/ui'
import { dayLabel, firstName, teeOffIn, teeTime } from '../../lib/format'
import { roundTitle, type RoundRow } from '../../lib/rounds'
import { lineup, spotsText } from './helpers'
import { PickCard, WaitingCard } from './parts'
import { Scorecard } from './Scorecard'
import type { HomeData } from './useHomeData'

// Building blocks shared by the Home layouts.

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
      <Link
        to="/groups"
        className="col-span-2 flex min-h-16 items-center gap-3 rounded-[22px] border border-gold/50 bg-gradient-to-r from-navy to-navy-2 py-2.5 pr-4 pl-2.5 text-white no-underline shadow-[0_12px_26px_-14px_rgba(10,19,38,0.9)]"
      >
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-gold text-navy">
          <Icon name="user" size={20} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-semibold text-gold-soft">Societies & trips</span>
          <span className="block truncate text-[13px] text-white/70">Run a society, trip or Ryder Cup</span>
        </span>
        <Icon name="back" size={18} className="shrink-0 rotate-180 text-gold" />
      </Link>
      <Link
        to="/free"
        className="col-span-2 inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/15 bg-white/[0.06] text-[14px] font-semibold text-white/90 no-underline backdrop-blur"
      >
        <Icon name="clock" size={16} className="text-flag" /> I'm free
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

export function TeeChip({ iso }: { iso: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-fairway px-3 py-1 text-[13px] font-semibold text-white">
      <Icon name="tee" size={15} className="text-flag" />
      {dayLabel(iso)} · <span className="font-mono text-flag">{teeTime(iso)}</span>
    </span>
  )
}

// Next round with the drawn golf hole on top.
// How you're part of a round, shown as a chip on its card.
const roles = {
  hosting: { label: 'Hosting', icon: 'flag', chip: 'bg-fairway text-flag', edge: 'ring-2 ring-fairway/80' },
  playing: { label: 'You’re in', icon: 'check', chip: 'bg-flag text-fairway', edge: '' },
  requested: { label: 'Requested', icon: 'clock', chip: 'bg-white text-[#8A5A12]', edge: 'opacity-95' },
} as const

function roleIn(r: RoundRow, me: string): keyof typeof roles {
  if (r.host_id === me) return 'hosting'
  return r.round_requests.some((q) => q.user_id === me && q.status === 'accepted') ? 'playing' : 'requested'
}

function MyRoundCard({ round, d, card, wide }: { round: RoundRow; d: HomeData; card: string; wide: boolean }) {
  const role = roles[roleIn(round, d.me)]
  const forecast = round.id === d.next?.id ? d.forecast : null
  return (
    <Link
      to={`/rounds/${round.id}`}
      className={`${card} ${role.edge} flex shrink-0 snap-start flex-col overflow-hidden text-fairway no-underline ${wide ? 'w-full' : 'w-[86%]'}`}
    >
      <div className="relative h-[124px]">
        <HoleArt className="size-full" />
        <span className="absolute top-3 left-3"><TeeChip iso={round.tee_time} /></span>
        <span className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold shadow-sm ${role.chip}`}>
          <Icon name={role.icon} size={13} /> {role.label}
        </span>
        {forecast && (
          <span className="absolute right-3 bottom-3 rounded-full bg-white/90 px-2.5 py-1 text-xs">
            <span className="font-mono">{forecast.temp}°</span> · {forecast.label}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="text-xs font-semibold text-green">{teeOffIn(round.tee_time)}</div>
          <div className="truncate font-display text-[24px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(round)}</div>
          <div className="mt-1 truncate text-sm text-[#4A544E]">
            {round.host_id === d.me ? `You’re hosting · ${round.course_name}` : `${firstName(round.host?.display_name ?? null)}’s game · ${round.course_name}`}
          </div>
        </div>
        <Scorecard round={round} />
        <div className="mt-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AvatarStack players={lineup(round)} total={round.max_players} />
            <span className="text-[13px] text-muted">{spotsText(round)}</span>
          </div>
          <Icon name="back" size={18} className="rotate-180 text-muted" />
        </div>
      </div>
    </Link>
  )
}

// Every round you're in, hosting or waiting on, swiped sideways.
// Chips narrow it to the rounds you host or the ones you've joined.
export function MyRounds({ d, card }: { d: HomeData; card: string }) {
  const [show, setShow] = useState<'all' | 'hosting' | 'joined'>('all')
  const hosting = d.mine.filter((r) => r.host_id === d.me)
  const joined = d.mine.filter((r) => r.host_id !== d.me)
  const rounds = show === 'hosting' ? hosting : show === 'joined' ? joined : d.mine
  return (
    <Section title="Your rounds" icon="tee">
      {hosting.length > 0 && joined.length > 0 && (
        <div className="relative flex gap-2">
          <Pick on={show === 'all'} onClick={() => setShow('all')}>All <span className="font-mono">{d.mine.length}</span></Pick>
          <Pick on={show === 'hosting'} onClick={() => setShow('hosting')}>Hosting <span className="font-mono">{hosting.length}</span></Pick>
          <Pick on={show === 'joined'} onClick={() => setShow('joined')}>Joined <span className="font-mono">{joined.length}</span></Pick>
        </div>
      )}
      {rounds.length ? (
        <div className={rounds.length > 1 ? '-mx-5 -my-3 flex snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 py-3 pb-5' : 'flex'}>
          {rounds.map((r) => <MyRoundCard key={r.id} round={r} d={d} card={card} wide={rounds.length === 1} />)}
        </div>
      ) : (
        <div className={`${card} overflow-hidden`}>
          <div className="h-[124px]"><HoleArt className="size-full" /></div>
          <NothingBooked />
        </div>
      )}
    </Section>
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

// A round near you that needs a player now. Tapping opens the alert.
export function UrgentAlert({ d }: { d: HomeData }) {
  const r = d.urgent[0]
  if (!r) return null
  return (
    <Link
      to={`/rounds/${r.id}`}
      className="relative flex items-center gap-3 rounded-[22px] bg-fairway p-4 text-white no-underline shadow-[0_16px_32px_-16px_rgba(14,31,22,0.8)] ring-2 ring-flag"
    >
      <span className="grid size-11 shrink-0 place-items-center rounded-full bg-flag text-fairway"><Icon name="bell" size={20} /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-[12px] font-semibold tracking-[0.06em] text-flag uppercase">Need a player</span>
        <span className="block truncate font-semibold">
          {firstName(r.host?.display_name ?? null)} at {r.course?.name ?? r.course_name}
        </span>
        <span className="block text-[13px] text-white/70">
          {teeOffIn(r.tee_time)}
          {d.urgent.length > 1 ? ` · ${d.urgent.length - 1} more nearby` : ''}
        </span>
      </span>
      <Icon name="back" size={18} className="shrink-0 rotate-180 text-white/70" />
    </Link>
  )
}
