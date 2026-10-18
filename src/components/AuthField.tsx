import { useState, type InputHTMLAttributes } from 'react'
import { Icon } from './ui'

const input = 'min-h-12 w-full rounded-2xl border border-line bg-card px-4 text-[16px] placeholder:text-muted/70'

// Labelled field for the sign-in screens. 16px text stops iOS zooming on focus.
export function AuthField({ label, type, ...rest }: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false)
  const isPassword = type === 'password'
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <span className="relative">
        <input type={isPassword && shown ? 'text' : type} className={`${input} ${isPassword ? 'pr-14' : ''}`} {...rest} />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-full text-muted"
          >
            <Icon name={shown ? 'eyeOff' : 'eye'} size={20} />
          </button>
        )}
      </span>
    </label>
  )
}
