import { useId } from 'react'

type Pt = { x: number; y: number }

const W = 360
const H = 170

// Small seeded random generator, so a hole always draws the same way.
function random(seed: string) {
  let h = 1779033703
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 3432918353)
  let a = (h << 13) | (h >>> 19)
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
const line = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ')

// An overhead drawing of a hole: tee, fairway, bunkers, water, trees and green.
// Length follows the yardage and the layout is seeded by course and hole, so each hole differs.
export function HoleOverhead({ hole, par, yards, seed = '' }: { hole: number; par: number; yards: number | null; seed?: string }) {
  const id = useId().replace(/:/g, '')
  const r = random(`${seed}:${hole}:${par}`)
  const between = (lo: number, hi: number) => lo + r() * (hi - lo)
  const side = () => (r() < 0.5 ? -1 : 1)

  const length = clamp(yards ?? (par === 3 ? 165 : par === 5 ? 510 : 390), 90, 620)
  const span = 70 + (length / 620) * 250
  const tee = { x: (W - span) / 2, y: H / 2 + between(-45, 45) }
  const green = { x: tee.x + span, y: H / 2 + between(-45, 45) }
  const bend = par === 3 ? between(-12, 12) : r() < 0.7 ? side() * between(45, 85) : between(-15, 15)
  const ctrl = { x: (tee.x + green.x) / 2 + between(-20, 20), y: clamp((tee.y + green.y) / 2 + bend, 10, H - 10) }

  const at = (t: number): Pt => ({
    x: (1 - t) ** 2 * tee.x + 2 * (1 - t) * t * ctrl.x + t ** 2 * green.x,
    y: (1 - t) ** 2 * tee.y + 2 * (1 - t) * t * ctrl.y + t ** 2 * green.y,
  })
  const normal = (t: number): Pt => {
    const dx = 2 * (1 - t) * (ctrl.x - tee.x) + 2 * t * (green.x - ctrl.x)
    const dy = 2 * (1 - t) * (ctrl.y - tee.y) + 2 * t * (green.y - ctrl.y)
    const n = Math.hypot(dx, dy) || 1
    return { x: -dy / n, y: dx / n }
  }
  const offset = (t: number, by: number): Pt => {
    const p = at(t)
    const n = normal(t)
    return { x: p.x + n.x * by, y: p.y + n.y * by }
  }
  const inside = (p: Pt, margin: number): Pt => ({ x: clamp(p.x, margin, W - margin), y: clamp(p.y, margin, H - margin) })
  const range = (from: number, to: number) => Array.from({ length: 24 }, (_, i) => at(from + ((to - from) * i) / 23))
  const centre = range(0, 1)

  const fairwayWidth = par === 5 ? 30 : 27
  const fairway = par === 3 ? range(0.8, 0.94) : range(0.22, 0.9)

  // Water sometimes: in front of the green on a short hole, along the side on a long one.
  const water: { c: Pt; rx: number; ry: number; rot: number }[] = []
  if (r() < 0.35) {
    if (par === 3) water.push({ c: at(between(0.5, 0.68)), rx: between(22, 32), ry: between(28, 40), rot: between(-20, 20) })
    else {
      const t = between(0.4, 0.7)
      const by = side() * between(36, 44)
      // Use the other side if this one runs off the edge.
      const fits = (p: Pt) => p.y > 22 && p.y < H - 22
      const c = fits(offset(t, by)) ? offset(t, by) : offset(t, -by)
      water.push({ c: inside(c, 22), rx: between(30, 48), ry: between(12, 18), rot: between(-15, 15) })
    }
  }

  const bunkers: { c: Pt; rx: number; ry: number; rot: number }[] = []
  const landing = par === 5 ? [between(0.38, 0.45), between(0.66, 0.74)] : par === 4 ? [between(0.5, 0.62)] : []
  for (const t of landing) if (r() < 0.85) bunkers.push({ c: inside(offset(t, side() * between(18, 22)), 12), rx: between(8, 13), ry: between(5, 7), rot: between(-30, 30) })
  const greenside = 1 + Math.floor(r() * (par === 3 ? 3 : 2))
  for (let i = 0; i < greenside; i++) {
    const a = between(0, Math.PI * 2)
    bunkers.push({ c: { x: green.x + Math.cos(a) * 22, y: green.y + Math.sin(a) * 18 }, rx: between(7, 10), ry: between(4, 6), rot: (a * 180) / Math.PI + 90 })
  }

  // Trees wherever they won't block the hole or sit in the water.
  const clear = (p: Pt, gap: number) =>
    centre.every((c) => Math.hypot(c.x - p.x, c.y - p.y) > gap) &&
    water.every((w) => Math.hypot(w.c.x - p.x, w.c.y - p.y) > Math.max(w.rx, w.ry) + 8) &&
    Math.hypot(green.x - p.x, green.y - p.y) > 40
  const trees: { c: Pt; size: number }[] = []
  for (let i = 0; i < 90 && trees.length < 34; i++) {
    const p = { x: between(-6, W + 6), y: between(-6, H + 6) }
    if (clear(p, 38)) trees.push({ c: p, size: between(6, 11) })
  }

  const greenRot = between(-40, 40)
  const pin = { x: green.x + between(-6, 6), y: green.y + between(-4, 4) }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label={`Overhead view of hole ${hole}, par ${par}`}>
      <defs>
        <radialGradient id={`${id}rough`} cx="50%" cy="50%" r="75%">
          <stop offset="0%" stopColor="#3f7d36" />
          <stop offset="100%" stopColor="#24552a" />
        </radialGradient>
        <pattern id={`${id}stripes`} width="18" height="18" patternUnits="userSpaceOnUse" patternTransform="rotate(35)">
          <rect width="18" height="18" fill="#6cb24c" />
          <rect width="9" height="18" fill="#7cc257" />
        </pattern>
        <radialGradient id={`${id}water`} cx="40%" cy="35%" r="70%">
          <stop offset="0%" stopColor="#5fa8d6" />
          <stop offset="100%" stopColor="#2c6e9c" />
        </radialGradient>
      </defs>

      <rect width={W} height={H} fill={`url(#${id}rough)`} />
      <path d={line(range(0.02, 0.98))} fill="none" stroke="#4d913d" strokeWidth={fairwayWidth + 22} strokeLinecap="round" strokeLinejoin="round" />

      {water.map((w, i) => (
        <ellipse key={i} cx={w.c.x} cy={w.c.y} rx={w.rx} ry={w.ry} transform={`rotate(${w.rot} ${w.c.x} ${w.c.y})`} fill={`url(#${id}water)`} stroke="#a9d6ef" strokeOpacity="0.5" strokeWidth="1.5" />
      ))}

      <path d={line(fairway)} fill="none" stroke={`url(#${id}stripes)`} strokeWidth={fairwayWidth} strokeLinecap="round" strokeLinejoin="round" />

      {bunkers.map((b, i) => (
        <ellipse key={i} cx={b.c.x} cy={b.c.y} rx={b.rx} ry={b.ry} transform={`rotate(${b.rot} ${b.c.x} ${b.c.y})`} fill="#ecdcae" stroke="#c9b27a" strokeWidth="1" />
      ))}

      <ellipse cx={green.x} cy={green.y} rx="19" ry="14" transform={`rotate(${greenRot} ${green.x} ${green.y})`} fill="#7cc257" />
      <ellipse cx={green.x} cy={green.y} rx="15.5" ry="11" transform={`rotate(${greenRot} ${green.x} ${green.y})`} fill="#9ad874" />

      <rect x={tee.x - 6} y={tee.y - 8} width="12" height="16" rx="3" fill="#9ad874" stroke="#5e9e45" strokeWidth="1" />

      <path d={line(centre)} fill="none" stroke="white" strokeOpacity="0.55" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />

      {trees.map((t, i) => (
        <g key={i}>
          <circle cx={t.c.x + 2} cy={t.c.y + 2.5} r={t.size} fill="#000" opacity="0.25" />
          <circle cx={t.c.x} cy={t.c.y} r={t.size} fill="#1d4a22" />
          <circle cx={t.c.x - t.size * 0.3} cy={t.c.y - t.size * 0.3} r={t.size * 0.55} fill="#2f6a30" />
        </g>
      ))}

      <line x1={pin.x} y1={pin.y} x2={pin.x} y2={pin.y - 18} stroke="white" strokeWidth="1.5" />
      <path d={`M${pin.x} ${pin.y - 18} l10 3.5 l-10 3.5 z`} fill="#e94b3c" />
      <circle cx={pin.x} cy={pin.y} r="1.8" fill="#0b1a12" />
    </svg>
  )
}
