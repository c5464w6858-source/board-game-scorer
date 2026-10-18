import { useState, type InputHTMLAttributes } from 'react'
import { Icon } from './ui'

const inputTone = {
  light: 'border-line bg-card text-fairway placeholder:text-muted/70',
  dark: 'border-fairway-line bg-fairway-2 text-white placeholder:text-muted-dark/60',
  glass: 'border-white/70 bg-white/80 text-fairway placeholder:text-muted/80',
}

// Labelled field for the sign-in screens. 16px text stops iOS zooming on focus.
export function AuthField({
  label,
  type,
  tone = 'light',
  ...rest
}: { label: string; tone?: keyof typeof inputTone } & InputHTMLAttributes<HTMLInputElement>) {
  const [shown, setShown] = useState(false)
  const isPassword = type === 'password'
  return (
    <label className="flex flex-col gap-1.5">
      <span className={`text-sm font-medium ${tone === 'dark' ? 'text-muted-dark' : ''}`}>{label}</span>
      <span className="relative">
        <input
          type={isPassword && shown ? 'text' : type}
          className={`min-h-12 w-full rounded-2xl border px-4 text-[16px] ${inputTone[tone]} ${isPassword ? 'pr-14' : ''}`}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            className={`absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-full ${tone === 'dark' ? 'text-muted-dark' : 'text-muted'}`}
          >
            <Icon name={shown ? 'eyeOff' : 'eye'} size={20} />
          </button>
        )}
      </span>
    </label>
  )
}
