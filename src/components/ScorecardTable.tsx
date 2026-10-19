import { teeLabel, type Hole, type Tee } from '../lib/scorecard'

const teeColours: Record<string, string> = {
  white: '#FFFFFF',
  yellow: '#F2C94C',
  red: '#D64545',
  blue: '#2F6FD6',
  black: '#1A1A1A',
  green: '#2E8B57',
  purple: '#7B4FC9',
  orange: '#EB8A2F',
  gold: '#C9A227',
  silver: '#B8BDC2',
}

export function TeeDot({ colour }: { colour: string | null }) {
  const fill = teeColours[(colour ?? '').toLowerCase()] ?? '#9AA39D'
  return <span aria-hidden="true" className="inline-block size-3 shrink-0 rounded-full border border-fairway/25" style={{ background: fill }} />
}

// Tee chips: pick which tee's totals and ratings to show.
export function TeePicker({ tees, value, onChange }: { tees: Tee[]; value: string | null; onChange: (id: string) => void }) {
  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1">
      {tees.map((t) => {
        const on = t.id === value
        return (
          <button
            key={t.id}
            type="button"
            aria-pressed={on}
            onClick={() => onChange(t.id)}
            className={`inline-flex min-h-10 shrink-0 items-center gap-2 rounded-full px-3.5 text-[14px] font-semibold ${
              on ? 'bg-fairway text-white shadow-[0_8px_16px_-10px_rgba(14,31,22,0.8)]' : 'border border-white/90 bg-white/80 text-fairway backdrop-blur'
            }`}
          >
            <TeeDot colour={t.colour} />
            {teeLabel(t)}
          </button>
        )
      })}
    </div>
  )
}

function Nine({ holes, label }: { holes: Hole[]; label: string }) {
  if (!holes.length) return null
  const par = holes.reduce((n, h) => n + h.par, 0)
  const yards = holes.every((h) => h.yards != null) ? holes.reduce((n, h) => n + (h.yards ?? 0), 0) : null
  const cell = 'px-1 py-1.5 text-center'
  return (
    <table className="w-full table-fixed border-collapse font-mono text-[12px]">
      <thead>
        <tr className="bg-fairway text-white">
          <th className={`${cell} w-9 rounded-l-lg text-left font-sans text-[11px] font-semibold`}>Hole</th>
          {holes.map((h) => <th key={h.hole} className={`${cell} font-semibold`}>{h.hole}</th>)}
          <th className={`${cell} w-10 rounded-r-lg font-sans text-[11px] font-semibold text-flag`}>{label}</th>
        </tr>
      </thead>
      <tbody>
        <tr className="border-b border-line-soft">
          <th className={`${cell} text-left font-sans text-[11px] font-semibold text-muted`}>Par</th>
          {holes.map((h) => <td key={h.hole} className={`${cell} font-semibold`}>{h.par}</td>)}
          <td className={`${cell} font-semibold`}>{par}</td>
        </tr>
        <tr className="border-b border-line-soft">
          <th className={`${cell} text-left font-sans text-[11px] font-semibold text-muted`}>SI</th>
          {holes.map((h) => <td key={h.hole} className={`${cell} text-muted`}>{h.stroke_index}</td>)}
          <td className={cell} />
        </tr>
        {yards != null && (
          <tr>
            <th className={`${cell} text-left font-sans text-[11px] font-semibold text-muted`}>Yds</th>
            {holes.map((h) => <td key={h.hole} className={`${cell} text-[10.5px] text-muted`}>{h.yards}</td>)}
            <td className={`${cell} text-[10.5px] text-muted`}>{yards}</td>
          </tr>
        )}
      </tbody>
    </table>
  )
}

// Front and back nine, hole by hole. Yards are for the course's default tee.
export function ScorecardTable({ holes }: { holes: Hole[] }) {
  return (
    <div className="flex flex-col gap-3">
      <Nine holes={holes.filter((h) => h.hole <= 9)} label="Out" />
      <Nine holes={holes.filter((h) => h.hole > 9)} label="In" />
    </div>
  )
}
