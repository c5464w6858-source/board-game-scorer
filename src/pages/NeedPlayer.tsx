import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import photo from '../assets/login-group.jpg'
import { Avatar, ErrorNote, Icon, OpenSpot } from '../components/ui'
import { firstName, handicapText, pounds, teeTime } from '../lib/format'
import { roundDistanceMiles } from '../lib/match'
import { acceptedPlayers, type RoundRow } from '../lib/rounds'
import { useMe } from '../lib/useMe'

function countdown(iso: string, now: number) {
  const mins = Math.max(0, Math.floor((new Date(iso).getTime() - now) / 60000))
  const h = Math.floor(mins / 60)
  return h ? `${h}h ${String(mins % 60).padStart(2, '0')}m` : `${mins}m`
}

const day = (iso: string) => {
  const d = new Date(iso)
  const key = (x: Date) => x.toLocaleDateString('en-CA', { timeZone: 'Europe/London' })
  if (key(d) === key(new Date())) return 'Today'
  if (key(d) === key(new Date(Date.now() + 864e5))) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'Europe/London' })
}

// The "Need a player" alert (design 09): a dark, urgent take on an open round
// where the first golfer to say "I'm in" gets the spot.
export function NeedPlayer({
  round,
  forecast,
  busy,
  error,
  onJoin,
}: {
  round: RoundRow
  forecast: { temp: number; label: string } | null
  busy: boolean
  error: string | null
  onJoin: () => void
}) {
  const navigate = useNavigate()
  const me = useMe()
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(t)
  }, [])

  const host = firstName(round.host?.display_name ?? null)
  const players = acceptedPlayers(round)
  const miles = me.data ? roundDistanceMiles(round, me.data.match) : null
  const buddy = me.data?.match.buddyIds.includes(round.host_id)
  // Rough drive time at an average 30 mph on UK roads.
  const drive = miles != null ? `${Math.max(5, Math.round((miles / 30) * 60))} min` : '–'
  const tiles: [string, string][] = [
    ['At the club', round.green_fee_pence != null ? pounds(round.green_fee_pence) : '–'],
    ['Weather', forecast ? `${forecast.temp}° ${forecast.label}` : '–'],
    ['Drive', drive],
  ]

  return (
    <div className="relative -mx-5 -mt-5 min-h-[calc(100vh-7rem)] px-5 pt-5 text-white">
      <div aria-hidden="true" className="fixed inset-0 mx-auto max-w-[480px] bg-[#0B1A12]" />
      <img src={photo} alt="" aria-hidden="true" className="absolute inset-x-0 top-0 h-[380px] w-full object-cover opacity-20 [mask-image:linear-gradient(to_bottom,black,transparent)]" />

      <div className="relative flex flex-col gap-6">
        <div className="relative flex min-h-11 items-center justify-center">
          <button type="button" aria-label="Close" onClick={() => navigate(-1)} className="absolute left-0 grid size-11 place-items-center rounded-full border border-white/15 bg-white/10 backdrop-blur">
            <Icon name="close" size={20} />
          </button>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-flag px-3.5 py-1.5 text-[14px] font-semibold text-fairway">
            <Icon name="bell" size={15} /> Need a player
          </span>
        </div>

        <div>
          <div className="text-[14px] text-white/70">Tees off in</div>
          <div className="font-mono text-[64px] leading-none font-semibold tracking-[-0.03em] text-flag">{countdown(round.tee_time, now)}</div>
        </div>

        <div>
          <h1 className="m-0 font-display text-[30px] leading-[1.05] font-extrabold tracking-[-0.035em]">
            {host} needs a playing partner at {round.course?.name ?? round.course_name}
          </h1>
          <p className="mt-2 mb-0 text-[15px] text-white/75">
            {day(round.tee_time)} <span className="font-mono">{teeTime(round.tee_time)}</span> · {round.holes} holes
            {miles == null ? '' : miles < 0.5 ? ' · your home club' : ` · ${miles.toFixed(1)} mi from you`}
          </p>
        </div>

        <div className="flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.06] p-3.5">
          <span className="flex items-center">
            <Avatar name={round.host?.display_name ?? 'Host'} src={round.host?.avatar_url} size={40} border="#0B1A12" />
            {players.slice(0, 2).map((p) => (
              <span key={p.id} className="-ml-3">
                <Avatar name={p.profile?.display_name ?? 'Golfer'} src={p.profile?.avatar_url} size={40} border="#0B1A12" />
              </span>
            ))}
            <span className="-ml-3 rounded-full ring-2 ring-[#0B1A12]"><OpenSpot size={40} onDark /></span>
          </span>
          <span className="min-w-0">
            <span className="block truncate font-semibold">{buddy ? `${host} is a buddy of yours` : `Hosted by ${host}`}</span>
            <span className="block truncate text-[13px] text-white/60">
              HCP <span className="font-mono">{handicapText(round.host?.handicap ?? null)}</span>
              {round.walking ? ' · walking' : ''}
            </span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {tiles.map(([label, v]) => (
            <div key={label} className="rounded-[18px] border border-white/10 bg-white/[0.06] px-3.5 py-3">
              <div className="text-[12px] text-white/60">{label}</div>
              <div className="truncate font-mono text-[18px] font-semibold">{v}</div>
            </div>
          ))}
        </div>

        <p className="m-0 text-[14px] text-white/70">
          First to say yes gets the spot. Nothing to pay in the app: you pay the pro shop when you arrive.
        </p>
        {error && <ErrorNote message={error} />}
      </div>

      <div className="h-36" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom)))] z-[900] mx-auto flex max-w-[480px] flex-col gap-1 bg-gradient-to-t from-[#0B1A12] via-[#0B1A12]/90 to-transparent px-5 pt-6 pb-2">
        <button type="button" disabled={busy} onClick={onJoin} className="min-h-14 rounded-full bg-gradient-to-b from-[#DBF79A] to-flag text-[17px] font-semibold text-fairway disabled:opacity-60">
          {busy ? 'Grabbing the spot…' : "I'm in"}
        </button>
        <button type="button" onClick={() => navigate(-1)} className="min-h-12 text-[15px] font-semibold text-white/85">
          Not this time
        </button>
      </div>
    </div>
  )
}
