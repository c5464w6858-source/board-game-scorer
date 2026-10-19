import type { ReactNode } from 'react'
import { Icon } from '../../components/ui'
import { roundButton } from '../../components/surfaces'

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
