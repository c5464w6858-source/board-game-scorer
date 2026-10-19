import type { ReactNode } from 'react'
import { Icon } from '../../components/ui'
import { roundButton } from '../../components/surfaces'

export const field =
  'min-h-12 rounded-full border border-[#DEDBD0] bg-white/90 px-4 text-fairway shadow-[inset_0_1px_2px_rgba(14,31,22,0.06)] placeholder:text-muted/70 focus:border-green focus:outline-none'

// A disabled lime button on the dark bar reads as greyed out rather than muddy.
export const darkDisabled = 'disabled:bg-none disabled:bg-white/12 disabled:text-white/45 disabled:opacity-100 disabled:shadow-none'

// Photo header for both hosting steps: close or back, step progress, title.
export function HostHeader({ step, title, subtitle, onBack }: { step: 1 | 2; title: string; subtitle: ReactNode; onBack: () => void }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        <button type="button" aria-label={step === 1 ? 'Close' : 'Back'} onClick={onBack} className={roundButton}>
          <Icon name={step === 1 ? 'close' : 'back'} size={20} />
        </button>
        <div className="flex flex-1 flex-col gap-1.5">
          <span className="text-[12px] font-semibold tracking-[0.08em] text-white/70 uppercase">Step {step} of 2</span>
          <div className="flex gap-1.5" aria-hidden="true">
            <span className="h-1.5 flex-1 rounded-full bg-flag" />
            <span className={`h-1.5 flex-1 rounded-full ${step === 2 ? 'bg-flag' : 'bg-white/20'}`} />
          </div>
        </div>
        <span className="size-11" />
      </div>
      <div>
        <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-[13px] font-semibold text-fairway">
          <Icon name="flag" size={15} />
          Free to host
        </span>
        <h1 className="m-0 font-display text-[30px] leading-[1.02] font-extrabold tracking-[-0.035em]">{title}</h1>
        <p className="mt-1 mb-0 text-sm text-white/80">{subtitle}</p>
      </div>
    </div>
  )
}

// Dark bar pinned just above the tab bar, in the same style as a round you host.
export function HostBar({ title, note, children }: { title: ReactNode; note: ReactNode; children: ReactNode }) {
  return (
    <>
      <div className="h-24" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom)))] z-[900] mx-auto max-w-[480px] bg-gradient-to-t from-[#ECEAE3] via-[#ECEAE3]/90 to-transparent px-5 pt-6 pb-3">
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

export function Choice({ label, hint, checked, onSelect }: { label: ReactNode; hint?: ReactNode; checked: boolean; onSelect: () => void }) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center gap-3 px-4 py-2.5">
      <input type="radio" name="who" checked={checked} onChange={onSelect} className="peer sr-only" />
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
