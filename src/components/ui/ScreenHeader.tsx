import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from './Icon'

export function RoundIconButton({
  label,
  icon,
  onClick,
  className = '',
}: {
  label: string
  icon: Parameters<typeof Icon>[0]['name']
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className={`grid size-11 shrink-0 place-items-center rounded-full border border-line bg-card ${className}`}
    >
      <Icon name={icon} size={20} />
    </button>
  )
}

export function ScreenHeader({
  kind = 'back',
  onBack,
  center,
  right,
}: {
  kind?: 'back' | 'close'
  onBack?: () => void
  center?: ReactNode
  right?: ReactNode
}) {
  const navigate = useNavigate()
  return (
    <header className="flex items-center gap-3">
      <RoundIconButton
        label={kind === 'close' ? 'Close' : 'Back'}
        icon={kind}
        onClick={onBack ?? (() => navigate(-1))}
      />
      <div className="flex-1 text-[15px] text-muted">{center}</div>
      {right}
    </header>
  )
}
