// Faint golf-course contour lines, used as texture on dark surfaces instead of photos.
export function Contours({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" className={`pointer-events-none absolute inset-0 size-full ${className}`}>
      <g fill="none" stroke="currentColor" strokeWidth="1">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <ellipse key={i} cx="330" cy="40" rx={40 + i * 34} ry={26 + i * 22} transform={`rotate(-18 330 40)`} />
        ))}
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={`b${i}`} cx="40" cy="270" rx={30 + i * 30} ry={18 + i * 18} transform="rotate(12 40 270)" />
        ))}
      </g>
    </svg>
  )
}
