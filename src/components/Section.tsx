import type { ReactNode } from 'react'
import { Icon, type IconName } from './ui'

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
