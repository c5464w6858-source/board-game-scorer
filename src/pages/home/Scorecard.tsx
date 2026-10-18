import { formatLabels, pounds } from '../../lib/format'
import type { RoundRow } from '../../lib/rounds'

// Round details laid out like a printed scorecard: ruled columns, small caps
// headings, numbers in mono.
export function Scorecard({ round, onDark }: { round: RoundRow; onDark?: boolean }) {
  const cells = [
    { label: 'Format', value: formatLabels[round.format], mono: false },
    { label: 'Holes', value: String(round.holes), mono: true },
    { label: 'Walking', value: round.walking ? 'Yes' : 'Buggy ok', mono: false },
    { label: 'Fee', value: round.green_fee_pence == null ? '–' : pounds(round.green_fee_pence), mono: true },
  ]
  return (
    <dl className={`m-0 grid grid-cols-4 overflow-hidden rounded-xl border text-center ${onDark ? 'border-white/20 bg-white/10 text-white backdrop-blur' : 'border-[#DAD7CC] bg-[#FBFAF6]'}`}>
      {cells.map((c, i) => (
        <div key={c.label} className={`flex flex-col ${i ? (onDark ? 'border-l border-white/20' : 'border-l border-[#DAD7CC]') : ''}`}>
          <dt className={`border-b py-1 text-[10px] font-semibold tracking-[0.1em] uppercase ${onDark ? 'border-white/20 bg-white/10 text-white/75' : 'border-[#DAD7CC] bg-[#F1EFE8] text-muted'}`}>{c.label}</dt>
          <dd className={`m-0 py-1.5 text-[13px] font-semibold ${c.mono ? 'font-mono' : ''}`}>{c.value}</dd>
        </div>
      ))}
    </dl>
  )
}
