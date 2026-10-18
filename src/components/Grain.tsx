// Fine film-grain texture laid over flat colour so it reads as tactile, not
// digital-flat. Pure SVG noise, no image file.
const noise =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.55 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")"

export function Grain({ opacity = 0.08 }: { opacity?: number }) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 mix-blend-overlay"
      style={{ backgroundImage: noise, opacity }}
    />
  )
}
