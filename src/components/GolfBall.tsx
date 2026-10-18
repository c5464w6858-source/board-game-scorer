// A golf ball with shaded dimples, drawn in SVG. Used large and faint as a
// brand flourish on dark surfaces.
const dimples = (() => {
  const out: { x: number; y: number; r: number }[] = []
  // Hex-packed dimples inside the ball, shrinking toward the edge for curvature.
  for (let row = -7; row <= 7; row++) {
    for (let col = -7; col <= 7; col++) {
      const x = 100 + col * 13 + (row % 2 ? 6.5 : 0)
      const y = 100 + row * 11.3
      const d = Math.hypot(x - 100, y - 100)
      if (d > 88) continue
      out.push({ x, y, r: 4.6 * Math.sqrt(1 - (d / 96) ** 2) + 0.6 })
    }
  }
  return out
})()

export function GolfBall({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 200 200" className={className}>
      <defs>
        <radialGradient id="gb-body" cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="1" />
          <stop offset="0.7" stopColor="#FFFFFF" stopOpacity="0.55" />
          <stop offset="1" stopColor="#FFFFFF" stopOpacity="0.25" />
        </radialGradient>
        <radialGradient id="gb-dimple" cx="0.65" cy="0.7" r="0.7">
          <stop offset="0" stopColor="#0E1F16" stopOpacity="0.35" />
          <stop offset="1" stopColor="#0E1F16" stopOpacity="0" />
        </radialGradient>
        <clipPath id="gb-clip">
          <circle cx="100" cy="100" r="96" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill="url(#gb-body)" />
      <g clipPath="url(#gb-clip)">
        {dimples.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.r} fill="url(#gb-dimple)" />
        ))}
      </g>
    </svg>
  )
}

// A very subtle repeating dimple texture for large dark areas.
export const dimpleTexture =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='22' height='19'><circle cx='5.5' cy='4.75' r='3' fill='white' fill-opacity='0.035'/><circle cx='16.5' cy='14.25' r='3' fill='white' fill-opacity='0.035'/></svg>\")"
