import type { ReactNode } from 'react'

// A labelled checkbox row, used for settings like "Auto-accept buddies".
export function ToggleRow({
  label,
  hint,
  checked,
  onChange,
}: {
  label: ReactNode
  hint?: ReactNode
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-4 py-2">
      <span>
        <span className="block">{label}</span>
        {hint && <span className="block text-sm text-muted">{hint}</span>}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-6 shrink-0 accent-green"
      />
    </label>
  )
}
