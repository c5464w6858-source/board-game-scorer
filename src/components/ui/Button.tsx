import type { ButtonHTMLAttributes } from 'react'
import { Link, type LinkProps } from 'react-router-dom'

const variants = {
  primary: 'bg-green text-white',
  dark: 'bg-fairway text-white',
  outline: 'bg-card text-fairway border border-line',
  flag: 'bg-flag text-fairway',
  danger: 'bg-danger text-white',
} as const

const sizes = {
  md: 'min-h-11 px-4 text-[15px]',
  lg: 'min-h-14 px-6 text-[17px]',
} as const

type Style = { variant?: keyof typeof variants; size?: keyof typeof sizes; full?: boolean }

function cls({ variant = 'primary', size = 'md', full }: Style, extra = '') {
  return `inline-flex items-center justify-center gap-2 rounded-full font-semibold disabled:opacity-50 ${variants[variant]} ${sizes[size]} ${full ? 'w-full' : ''} ${extra}`
}

export function Button({
  variant,
  size,
  full,
  className,
  type = 'button',
  ...rest
}: Style & ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={cls({ variant, size, full }, className)} {...rest} />
}

export function LinkButton({ variant, size, full, className, ...rest }: Style & LinkProps) {
  return <Link className={cls({ variant, size, full }, className)} {...rest} />
}
