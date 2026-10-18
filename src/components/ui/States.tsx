import type { ReactNode } from 'react'
import { Card } from './Card'

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <p role="status" className="py-10 text-center text-muted">
      {label}
    </p>
  )
}

export function ErrorNote({ message }: { message: string }) {
  return (
    <p role="alert" className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
      {message}
    </p>
  )
}

export function Empty({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <Card className="flex flex-col items-center gap-3 p-6 text-center">
      <div className="font-display text-lg font-bold">{title}</div>
      {children}
    </Card>
  )
}
