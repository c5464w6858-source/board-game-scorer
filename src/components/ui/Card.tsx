import type { HTMLAttributes, ReactNode } from 'react'

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-[20px] border border-line bg-card ${className}`} {...rest} />
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="m-0 text-xs font-semibold uppercase tracking-[0.08em] text-muted">{children}</h2>
  )
}

export function StatTile({ value, label }: { value: ReactNode; label: string }) {
  return (
    <Card className="p-3.5">
      <div className="font-display text-[28px] leading-none font-bold tracking-tight">{value}</div>
      <div className="mt-1.5 text-sm text-muted">{label}</div>
    </Card>
  )
}
