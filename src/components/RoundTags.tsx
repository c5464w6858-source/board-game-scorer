import type { RoundRow } from '../lib/rounds'
import { Icon } from './ui'

// Women-only and beginner-friendly tags, shown wherever a round is described.
export function RoundTags({ round, onDark }: { round: Pick<RoundRow, 'women_only' | 'beginner_friendly'>; onDark?: boolean }) {
  if (!round.women_only && !round.beginner_friendly) return null
  const tag = `inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[12px] font-semibold ${
    onDark ? 'border border-white/20 bg-white/10 text-white backdrop-blur' : 'bg-[#F1EFE8] text-fairway'
  }`
  return (
    <span className="flex flex-wrap gap-1.5">
      {round.women_only && (
        <span className={tag}>
          <Icon name="user" size={13} /> Women only
        </span>
      )}
      {round.beginner_friendly && (
        <span className={tag}>
          <Icon name="check" size={13} /> Beginner friendly
        </span>
      )}
    </span>
  )
}
