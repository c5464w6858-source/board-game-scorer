import type { ReactNode } from 'react'
import { Icon } from './ui'

// Form controls and the pinned action bar shared by the PhotoPage screens.
export const field =
  'min-h-12 rounded-full border border-[#DEDBD0] bg-white/90 px-4 text-fairway shadow-[inset_0_1px_2px_rgba(14,31,22,0.06)] placeholder:text-muted/70 focus:border-green focus:outline-none'

// A disabled lime button on the dark bar reads as greyed out rather than muddy.
export const darkDisabled = 'disabled:bg-none disabled:bg-white/12 disabled:text-white/45 disabled:opacity-100 disabled:shadow-none'

// Dark bar pinned just above the tab bar (the host's style on Round detail).
export function ActionBar({ title, note, children, noTabBar }: { title: ReactNode; note: ReactNode; children: ReactNode; noTabBar?: boolean }) {
  return (
    <>
      <div className="h-24" aria-hidden="true" />
      <div className={`fixed inset-x-0 ${noTabBar ? 'bottom-0 pb-[max(1rem,env(safe-area-inset-bottom))]' : 'bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom)))] pb-3'} z-[900] mx-auto max-w-[480px] bg-gradient-to-t from-[#ECEAE3] via-[#ECEAE3]/90 to-transparent px-5 pt-6`}>
        <div className="flex items-center justify-between gap-3 rounded-[22px] bg-fairway py-2.5 pr-2.5 pl-4 text-white shadow-[0_16px_32px_-16px_rgba(14,31,22,0.7)]">
          <div className="min-w-0">
            <div className="truncate font-semibold">{title}</div>
            <div className="truncate text-[13px] text-muted-dark">{note}</div>
          </div>
          <div className="flex shrink-0 gap-2">{children}</div>
        </div>
      </div>
    </>
  )
}

export function Switch({ label, hint, checked, onChange }: { label: ReactNode; hint?: ReactNode; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 py-2.5">
      <span>
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-[13px] text-muted">{hint}</span>}
      </span>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
      <span
        aria-hidden="true"
        className="relative h-7 w-12 shrink-0 rounded-full bg-[#D9D6CC] transition-colors peer-checked:bg-green peer-focus-visible:outline-2 peer-focus-visible:outline-green after:absolute after:top-0.5 after:left-0.5 after:size-6 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:after:translate-x-5"
      />
    </label>
  )
}

export function Choice({ label, hint, checked, onSelect, name = 'who' }: { label: ReactNode; hint?: ReactNode; checked: boolean; onSelect: () => void; name?: string }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-2.5">
      <input type="radio" name={name} checked={checked} onChange={onSelect} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`grid size-6 shrink-0 place-items-center rounded-full border-2 peer-focus-visible:outline-2 peer-focus-visible:outline-green ${checked ? 'border-green bg-green text-white' : 'border-[#CFCBBE] bg-white'}`}
      >
        {checked && <Icon name="check" size={14} />}
      </span>
      <span className="flex-1">
        <span className="block font-semibold">{label}</span>
        {hint && <span className="block text-[13px] text-muted">{hint}</span>}
      </span>
    </label>
  )
}

// A labelled field inside a glass card group.
export function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5 px-4 py-3">
      <span className="text-[13px] font-semibold text-muted">{label}</span>
      {children}
    </label>
  )
}

// A selectable chip: dark with a lime tick when chosen.
export function Pick({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onClick}
      className={`inline-flex min-h-10 items-center gap-1.5 rounded-full px-3.5 text-[14px] font-semibold ${
        on
          ? 'bg-fairway text-flag shadow-[0_8px_16px_-10px_rgba(14,31,22,0.8)]'
          : 'border border-white/90 bg-white/80 text-fairway shadow-[0_4px_12px_-6px_rgba(14,31,22,0.3)] backdrop-blur'
      }`}
    >
      {on && <Icon name="check" size={14} />}
      {children}
    </button>
  )
}
