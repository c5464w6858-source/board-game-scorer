import type { ReactNode } from 'react'

export function Chip({
  children,
  outline,
  active,
  onClick,
}: {
  children: ReactNode
  outline?: boolean
  active?: boolean
  onClick?: () => void
}) {
  const style = active
    ? 'bg-fairway text-white'
    : outline
      ? 'border border-line bg-card'
      : 'bg-chip'
  const base = `inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${style}`
  return onClick ? (
    <button type="button" onClick={onClick} className={`${base} min-h-11 px-4`} aria-pressed={active}>
      {children}
    </button>
  ) : (
    <span className={base}>{children}</span>
  )
}

export function MatchBadge({ percent, onDark }: { percent: number; onDark?: boolean }) {
  return (
    <span
      className={`rounded-full px-2 py-1 font-mono text-xs font-semibold ${onDark ? 'bg-flag text-fairway' : 'bg-green-tint text-green-dark'}`}
    >
      {percent}% match
    </span>
  )
}
