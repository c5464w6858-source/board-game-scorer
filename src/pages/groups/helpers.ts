const fmt = (d: string, opts: Intl.DateTimeFormatOptions) => new Date(`${d}T12:00:00Z`).toLocaleDateString('en-GB', { timeZone: 'UTC', ...opts })

// "12–15 Mar 2027", "28 Feb – 2 Mar", or a single day.
export function dateRange(start: string | null, end: string | null) {
  if (!start) return null
  if (!end || end === start) return fmt(start, { weekday: 'short', day: 'numeric', month: 'short' })
  const sameMonth = start.slice(0, 7) === end.slice(0, 7)
  return sameMonth
    ? `${fmt(start, { day: 'numeric' })}–${fmt(end, { day: 'numeric', month: 'short' })}`
    : `${fmt(start, { day: 'numeric', month: 'short' })} – ${fmt(end, { day: 'numeric', month: 'short' })}`
}
