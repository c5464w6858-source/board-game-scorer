import type { Hole, Tee } from '../lib/scorecard'
import { TeeDot } from './ScorecardTable'
import { Icon } from './ui'

// The hole you're on: number, yards off your tees, par and stroke index.
// Slides in from the side you moved towards, so a new hole is obvious.
export function HolePanel({
  hole,
  holeCount,
  yards,
  tee,
  accent,
  back = false,
}: {
  hole: Hole
  holeCount: number
  yards: { value: number | null; approx: boolean }
  tee: Tee | null
  accent: 'flag' | 'gold'
  back?: boolean
}) {
  const accentText = accent === 'gold' ? 'text-gold' : 'text-flag'

  return (
    <div key={hole.hole} className={`flex items-end justify-between gap-4 ${back ? 'animate-hole-back' : 'animate-hole-next'}`}>
      <div>
        <div className="text-[14px] text-white/70">
          Hole <span className="font-mono">{hole.hole}</span> of <span className="font-mono">{holeCount}</span>
        </div>
        <div className="font-display text-[88px] leading-[0.85] font-extrabold tracking-[-0.04em]">{hole.hole}</div>
      </div>
      <div className="flex flex-col items-end gap-1.5 text-right">
        {tee && (
          <span className="inline-flex items-center gap-1.5 text-[12px] font-semibold text-white/70">
            <TeeDot colour={tee.colour} /> {tee.name} tees
          </span>
        )}
        <div className="leading-none">
          <span className={`font-mono text-[40px] font-semibold ${accentText}`}>
            {yards.value == null ? '–' : `${yards.approx ? '≈' : ''}${yards.value}`}
          </span>
          <span className="ml-1 text-[14px] text-white/70">yds</span>
        </div>
        <div className="flex gap-1.5">
          <span className="rounded-full bg-white/12 px-2.5 py-1 text-[13px] font-semibold">
            Par <span className="font-mono">{hole.par}</span>
          </span>
          <span className="rounded-full bg-white/12 px-2.5 py-1 text-[13px] font-semibold">
            SI <span className="font-mono">{hole.stroke_index}</span>
          </span>
        </div>
      </div>
    </div>
  )
}

// Brief "Hole 3 saved" confirmation shown above the save bar.
export function SavedToast({ hole, accent }: { hole: number; accent: 'flag' | 'gold' }) {
  return (
    <div
      key={hole}
      role="status"
      className="pointer-events-none fixed inset-x-0 bottom-[calc(76px+max(1rem,env(safe-area-inset-bottom))+88px)] z-[950] mx-auto flex max-w-[480px] justify-center px-5"
    >
      <span
        className={`inline-flex animate-toast items-center gap-2 rounded-full px-4 py-2 text-[14px] font-semibold shadow-[0_10px_24px_-10px_rgba(0,0,0,0.7)] ${
          accent === 'gold' ? 'bg-gold text-navy' : 'bg-flag text-fairway'
        }`}
      >
        <Icon name="check" size={16} /> Hole {hole} saved
      </span>
    </div>
  )
}
