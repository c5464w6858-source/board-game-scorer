const TZ = 'Europe/London'

const part = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('en-GB', { timeZone: TZ, ...opts }).format(d)

export const teeTime = (iso: string) => part(new Date(iso), { hour: '2-digit', minute: '2-digit' })

// "Sun 26 Oct"
export const shortDate = (iso: string) =>
  part(new Date(iso), { weekday: 'short', day: 'numeric', month: 'short' }).replace(',', '')

// "Sun 26 Oct · 07:30"
export const dateAndTime = (iso: string) => `${shortDate(iso)} · ${teeTime(iso)}`

// "Saturday, 18 Oct"
export const longDate = (d: Date) =>
  part(d, { weekday: 'long', day: 'numeric', month: 'short' })

export function dayLabel(iso: string, now = new Date()) {
  const key = (d: Date) => part(d, { year: 'numeric', month: '2-digit', day: '2-digit' })
  const tomorrow = new Date(now.getTime() + 864e5)
  if (key(new Date(iso)) === key(now)) return 'Today'
  if (key(new Date(iso)) === key(tomorrow)) return 'Tomorrow'
  return shortDate(iso)
}

export function greeting(now = new Date()) {
  const h = Number(part(now, { hour: '2-digit', hour12: false }))
  return h < 12 ? 'Morning' : h < 18 ? 'Afternoon' : 'Evening'
}

// Prices are information only; they are never charged in the app.
export const pounds = (pence: number) =>
  `£${(pence / 100).toFixed(pence % 100 ? 2 : 0)}`

export const feeLabel = (pence: number | null) => (pence == null ? null : `${pounds(pence)} · pay at the club`)

export const handicapText = (h: number | null) => (h == null ? '–' : h.toFixed(1))

export function handicapRange(min: number | null, max: number | null) {
  if (min == null && max == null) return 'Any handicap'
  if (min == null) return `HCP up to ${max}`
  if (max == null) return `HCP ${min}+`
  return `HCP ${min}–${max}`
}

// "Steve B." from a display name; falls back to the name as typed.
export function shortName(name: string | null) {
  if (!name) return 'Golfer'
  const [first, ...rest] = name.trim().split(/\s+/)
  return rest.length ? `${first} ${rest[rest.length - 1][0].toUpperCase()}.` : first
}

export const firstName = (name: string | null) => (name ?? 'Golfer').trim().split(/\s+/)[0]

export const formatLabels = {
  stableford: 'Stableford',
  stroke: 'Stroke',
  match: 'Match',
  scramble: 'Scramble',
} as const

export const playStyles = [
  { value: 'early_tee_times', label: 'Early tee times' },
  { value: 'walking', label: 'Walking' },
  { value: 'small_stakes', label: 'Small stakes' },
  { value: 'stays_for_one', label: 'Stays for one' },
] as const

export const playStyleLabel = (v: string) => playStyles.find((p) => p.value === v)?.label ?? v

const ymd = (d: Date) => part(d, { year: 'numeric', month: '2-digit', day: '2-digit' }).split('/').reverse().join('-')

// The next `n` calendar days in UK time, for date chips.
export function upcomingDays(n: number, now = new Date()) {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now.getTime() + i * 864e5)
    return { key: ymd(d), dow: part(d, { weekday: 'short' }), day: part(d, { day: 'numeric' }) }
  })
}

// "2026-10-26" + "07:30" as UK wall-clock time to a UTC ISO string.
export function londonToIso(day: string, time: string) {
  const asUtc = Date.parse(`${day}T${time}:00Z`)
  const shown = new Date(
    new Intl.DateTimeFormat('sv-SE', {
      timeZone: TZ,
      dateStyle: 'short',
      timeStyle: 'medium',
    })
      .format(new Date(asUtc))
      .replace(' ', 'T') + 'Z',
  ).getTime()
  return new Date(asUtc - (shown - asUtc)).toISOString()
}

export const weekdayName = (day: string) =>
  part(new Date(`${day}T12:00:00Z`), { weekday: 'long' })

// "Tee off in 15 hrs" / "Tee off in 3 days" / "Teeing off now"
export function teeOffIn(iso: string, now = new Date()) {
  const mins = Math.round((new Date(iso).getTime() - now.getTime()) / 60000)
  if (mins <= 0) return 'Teeing off now'
  if (mins < 60) return `Tee off in ${mins} min`
  const hrs = Math.round(mins / 60)
  if (hrs < 36) return `Tee off in ${hrs} hr${hrs === 1 ? '' : 's'}`
  return `Tee off in ${Math.round(hrs / 24)} days`
}
