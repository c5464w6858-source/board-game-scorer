import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { HoleArt } from '../../components/HoleArt'
import { Section } from '../../components/Section'
import { Avatar, AvatarStack, Icon, type IconName } from '../../components/ui'
import { TRIAL_DAYS, PLUS_PRICES, daysLeft } from '../../lib/plus'
import { dayLabel, firstName, formatLabels, pounds, teeOffIn, teeTime } from '../../lib/format'
import { pendingRequests, roundTitle, type RoundRow } from '../../lib/rounds'
import { lineup, spotsText } from './helpers'
import { PickCard, WaitingCard } from './parts'
import { Scorecard } from './Scorecard'
import type { HomeData } from './useHomeData'

// Building blocks shared by the Home layouts.

// The four ways in: compact frosted tiles over the photo. Find a game is
// the brightest glass; Societies is tinted navy with its gold.
const tile = 'flex min-h-14 items-center gap-2.5 rounded-[18px] py-2 pr-2.5 pl-2 no-underline backdrop-blur-md shadow-[0_8px_18px_-10px_rgba(0,0,0,0.55)]'
const tileIcon = 'grid size-9 shrink-0 place-items-center rounded-full'

const tileTones = {
  lime: { tile: 'border border-white/45 bg-white/25 text-white', icon: 'bg-flag text-fairway', hint: 'text-white/80' },
  green: { tile: 'border border-white/25 bg-white/[0.12] text-white', icon: 'bg-white/20 text-flag', hint: 'text-white/75' },
  navy: { tile: 'border border-gold/55 bg-[#1F3A6B]/55 text-gold-soft', icon: 'bg-gold text-navy', hint: 'text-white/75' },
}

function ActionTile({ to, icon, label, hint, tone, plus }: { to: string; icon: IconName; label: string; hint: string; tone: keyof typeof tileTones; plus?: boolean }) {
  const t = tileTones[tone]
  return (
    <Link to={to} className={`${tile} ${t.tile} relative`}>
      {plus && (
        <span className="absolute -top-2 right-2 rounded-full bg-flag px-2 py-0.5 text-[10px] font-bold tracking-[0.06em] text-fairway shadow-sm">PLUS</span>
      )}
      <span className={`${tileIcon} ${t.icon}`}><Icon name={icon} size={17} /></span>
      <span className="min-w-0">
        <span className="block truncate text-[15px] leading-tight font-semibold">{label}</span>
        <span className={`block truncate text-[12px] ${t.hint}`}>{hint}</span>
      </span>
    </Link>
  )
}

export function Actions({ d }: { d: HomeData }) {
  return (
    <div className="relative grid grid-cols-2 gap-2">
      <ActionTile to="/discover" icon="search" label="Find a game" hint={d.openCount ? `${d.openCount} open near you` : 'Open games near you'} tone="lime" />
      <ActionTile to="/host" icon="flag" label="Host a round" hint="Always free" tone="green" />
      <ActionTile to="/groups" icon="user" label="Societies" hint="Trips & Ryder Cups" tone="navy" plus />
      <ActionTile to="/free" icon="clock" label="I’m free" hint="Let hosts find you" tone="green" />
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
  hosting: { label: 'Hosting', icon: 'flag', chip: 'bg-flag text-fairway' },
  playing: { label: 'You’re in', icon: 'check', chip: 'bg-flag text-fairway' },
  requested: { label: 'Requested', icon: 'clock', chip: 'bg-white text-[#8A5A12]' },
} as const

// Tees off within 36 hours: a pulsing banner with a live countdown sits on
// top of the card, green if you're in or hosting, red if you're not accepted yet.
const SOON_HOURS = 36
const isSoon = (r: RoundRow) => {
  const h = (new Date(r.tee_time).getTime() - Date.now()) / 3_600_000
  return h > 0 && h <= SOON_HOURS
}

function Countdown({ iso }: { iso: string }) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])
  const left = Math.max(0, Math.floor((new Date(iso).getTime() - now) / 1000))
  const pad = (n: number) => String(n).padStart(2, '0')
  return (
    <span className="font-mono text-[15px] font-semibold tabular-nums">
      {pad(Math.floor(left / 3600))}:{pad(Math.floor((left % 3600) / 60))}:{pad(left % 60)}
    </span>
  )
}

function SoonBanner({ iso, warn }: { iso: string; warn: boolean }) {
  return (
    <div
      className={`flex animate-glow items-center justify-between gap-2 px-4 py-2 text-white ${
        warn ? 'bg-gradient-to-r from-[#D9452A] to-alert' : 'bg-gradient-to-r from-[#157538] to-[#1C8E47]'
      }`}
    >
      <span className="inline-flex min-w-0 items-center gap-2 text-[13px] font-semibold tracking-[0.04em] uppercase">
        <span className="size-2 shrink-0 animate-blink rounded-full bg-white" />
        <span className="truncate">{warn ? 'Not confirmed' : 'Soon'}</span>
      </span>
      <span className="inline-flex shrink-0 items-center gap-1.5" aria-label="Time until tee off">
        <Icon name="clock" size={15} className="text-white/85" />
        <Countdown iso={iso} />
      </span>
    </div>
  )
}

function roleIn(r: RoundRow, me: string): keyof typeof roles {
  if (r.host_id === me) return 'hosting'
  return r.round_requests.some((q) => q.user_id === me && q.status === 'accepted') ? 'playing' : 'requested'
}

function CardArt({ round, role, forecast, dark, faded }: { round: RoundRow; role: keyof typeof roles; forecast: HomeData['forecast']; dark?: boolean; faded?: boolean }) {
  const r = roles[role]
  return (
    <div className="relative h-[124px]">
      <HoleArt className={`size-full ${dark ? 'opacity-40' : faded ? 'opacity-50 grayscale' : ''}`} />
      <span className="absolute top-3 left-3"><TeeChip iso={round.tee_time} /></span>
      <span className={`absolute top-3 right-3 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold shadow-sm ${r.chip}`}>
        <Icon name={r.icon} size={13} /> {r.label}
      </span>
      {forecast && (
        <span className="absolute right-3 bottom-3 rounded-full bg-white/90 px-2.5 py-1 text-xs text-fairway">
          <span className="font-mono">{forecast.temp}°</span> · {forecast.label}
        </span>
      )}
    </div>
  )
}

const cardSize = (wide: boolean) => `flex shrink-0 snap-start flex-col overflow-hidden no-underline ${wide ? 'w-full' : 'w-[86%]'}`

// A round you host: a dark card about your game's state, with Manage.
function HostedCard({ round, d, wide }: { round: RoundRow; d: HomeData; wide: boolean }) {
  const waiting = pendingRequests(round).length
  const open = Math.max(0, round.max_players - lineup(round).length)
  const facts = [formatLabels[round.format], `${round.holes} holes`, round.green_fee_pence == null ? null : pounds(round.green_fee_pence)].filter(Boolean).join(' · ')
  return (
    <Link
      to={waiting ? `/rounds/${round.id}/requests` : `/rounds/${round.id}`}
      className={`${cardSize(wide)} rounded-[24px] bg-gradient-to-b from-fairway-2 to-fairway text-white shadow-[0_16px_32px_-16px_rgba(14,31,22,0.8)] ${isSoon(round) ? 'ring-2 ring-[#1C8E47]' : ''}`}
    >
      {isSoon(round) && <SoonBanner iso={round.tee_time} warn={false} />}
      <CardArt round={round} role="hosting" forecast={round.id === d.next?.id ? d.forecast : null} dark />
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.06em] text-flag uppercase">You’re hosting · {teeOffIn(round.tee_time)}</div>
          <div className="truncate font-display text-[24px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(round)}</div>
          <div className="mt-1 truncate text-sm text-white/65">{round.course_name}</div>
          <div className="mt-0.5 truncate text-[13px] text-white/50">{facts}</div>
        </div>
        {waiting > 0 ? (
          <div className="flex items-center gap-2.5 rounded-2xl bg-white/10 px-3 py-2.5">
            <span className="grid min-w-6 place-items-center rounded-full bg-alert px-1.5 font-mono text-[12px] leading-6 font-semibold">{waiting}</span>
            <span className="text-[14px] font-semibold">{waiting === 1 ? 'Request waiting on you' : 'Requests waiting on you'}</span>
          </div>
        ) : null}
        <div className="mt-auto flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <AvatarStack players={lineup(round)} total={round.max_players} onDark />
            <span className="truncate text-[13px] text-white/65">{open ? `${open} open` : 'Full'}</span>
          </div>
          <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-flag py-1.5 pr-2 pl-3 text-[13px] font-semibold text-fairway">
            {waiting ? 'Review' : 'Manage'} <Icon name="back" size={14} className="rotate-180" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// A round you've joined or asked to join: a light card about the host's game.
function JoinedCard({ round, d, card, wide }: { round: RoundRow; d: HomeData; card: string; wide: boolean }) {
  const role = roleIn(round, d.me)
  const pending = role === 'requested'
  const soon = isSoon(round)
  const host = round.host?.display_name ?? null
  return (
    <Link
      to={`/rounds/${round.id}`}
      className={`${card} ${cardSize(wide)} text-fairway ${
        pending ? `!border-2 border-dashed !bg-white/45 !shadow-none ${soon ? '!border-alert' : '!border-[#C9B98F]'}` : ''
      } ${soon ? `ring-2 ${pending ? 'ring-alert' : 'ring-[#1C8E47]'}` : ''}`}
    >
      {soon && <SoonBanner iso={round.tee_time} warn={pending} />}
      <CardArt round={round} role={role} forecast={round.id === d.next?.id ? d.forecast : null} faded={pending} />
      <div className={`flex flex-1 flex-col gap-3 p-4 ${pending ? (soon ? 'opacity-85' : 'opacity-60') : ''}`}>
        <div>
          <div className={`text-xs font-semibold ${pending && soon ? 'text-danger' : 'text-green'}`}>{pending ? (soon ? `${teeOffIn(round.tee_time)} · still waiting on the host` : 'Not confirmed yet · waiting on the host') : teeOffIn(round.tee_time)}</div>
          <div className="truncate font-display text-[24px] leading-[1.05] font-extrabold tracking-[-0.03em]">{roundTitle(round)}</div>
          <div className="mt-1.5 flex items-center gap-2 text-sm text-[#4A544E]">
            <Avatar name={host ?? 'Host'} src={round.host?.avatar_url} size={22} />
            <span className="truncate">{firstName(host)} hosts · {round.course_name}</span>
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

function MyRoundCard({ round, d, card, wide }: { round: RoundRow; d: HomeData; card: string; wide: boolean }) {
  return round.host_id === d.me ? <HostedCard round={round} d={d} wide={wide} /> : <JoinedCard round={round} d={d} card={card} wide={wide} />
}

// Every round you're in, hosting or waiting on, swiped sideways.
// Chips narrow it to the rounds you host or the ones you've joined.
function FilterChip({ on, onClick, label, count }: { on: boolean; onClick: () => void; label: string; count: number }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full px-3 text-[13px] font-semibold ${
        on ? 'bg-fairway text-flag' : 'border border-white/90 bg-white/80 text-fairway shadow-[0_4px_12px_-6px_rgba(14,31,22,0.3)]'
      }`}
    >
      {label} <span className={`font-mono ${on ? '' : 'text-muted'}`}>{count}</span>
    </button>
  )
}

export function MyRounds({ d, card }: { d: HomeData; card: string }) {
  const [show, setShow] = useState<'all' | keyof typeof roles>('all')
  const by = (role: keyof typeof roles) => d.mine.filter((r) => roleIn(r, d.me) === role)
  const groups = [
    { key: 'hosting', label: 'Hosting', rounds: by('hosting') },
    { key: 'playing', label: 'Joined', rounds: by('playing') },
    { key: 'requested', label: 'Requested', rounds: by('requested') },
  ] as const
  const kinds = groups.filter((g) => g.rounds.length)
  const rounds = show === 'all' ? d.mine : (groups.find((g) => g.key === show)?.rounds ?? [])
  return (
    <Section
      title="Your rounds"
      icon="tee"
      action={
        <Link to="/calendar" className="inline-flex items-center gap-1 text-sm font-semibold text-green no-underline">
          <Icon name="calendar" size={16} /> Calendar
        </Link>
      }
    >
      {kinds.length > 1 && (
        <div className="relative -mx-5 flex gap-1.5 overflow-x-auto px-5 pb-1">
          <FilterChip on={show === 'all'} onClick={() => setShow('all')} label="All" count={d.mine.length} />
          {kinds.map((g) => (
            <FilterChip key={g.key} on={show === g.key} onClick={() => setShow(g.key)} label={g.label} count={g.rounds.length} />
          ))}
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

// A slim Plus strip under the four tiles, for golfers who don't have Plus.
// During a trial it only appears for the last few days, as a reminder.
const TRIAL_REMINDER_DAYS = 3

export function PlusCard({ d }: { d: HomeData }) {
  const p = d.plan
  if (!p || (p.active && (!p.trial || daysLeft(p.endsAt) > TRIAL_REMINDER_DAYS))) return null
  const left = daysLeft(p.endsAt)
  const text = p.active
    ? `Plus trial ends in ${left} day${left === 1 ? '' : 's'}`
    : p.trialUsed
      ? `Get Plus · from ${PLUS_PRICES.monthly} a month`
      : `Try Plus free for ${TRIAL_DAYS} days`
  return (
    <Link
      to="/plus"
      className="relative mt-2 flex min-h-11 items-center gap-2.5 rounded-full border border-white/25 bg-fairway/70 py-1.5 pr-3 pl-1.5 text-white no-underline backdrop-blur-md"
    >
      <span className="grid h-7 place-items-center rounded-full bg-flag px-2.5 text-[11px] font-bold tracking-[0.06em] text-fairway">PLUS</span>
      <span className="min-w-0 flex-1 truncate text-[14px] font-semibold">{text}</span>
      <Icon name="back" size={15} className="shrink-0 rotate-180 text-white/70" />
    </Link>
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
