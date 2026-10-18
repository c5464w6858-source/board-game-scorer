// A drawn par-4 hole (tee, dogleg fairway with mowing stripes, bunkers, green
// and flag) in muted sage tones, used as artwork instead of a photo.
export function HoleArt({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" className={className}>
      <defs>
        <linearGradient id="ha-sky" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E6ECE0" />
          <stop offset="1" stopColor="#CFDAC7" />
        </linearGradient>
        <linearGradient id="ha-fair" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#9DB894" />
          <stop offset="1" stopColor="#B4CBAA" />
        </linearGradient>
        <radialGradient id="ha-green" cx="0.4" cy="0.35" r="0.8">
          <stop offset="0" stopColor="#8DB283" />
          <stop offset="1" stopColor="#6E9566" />
        </radialGradient>
        <pattern id="ha-stripes" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(-24)">
          <rect width="7" height="14" fill="#FFFFFF" opacity="0.13" />
        </pattern>
        <filter id="ha-soft" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#2F4A3A" floodOpacity="0.25" />
        </filter>
      </defs>
      <rect width="360" height="150" fill="url(#ha-sky)" />
      <path d="M0 110 C60 90 90 130 160 112 S280 60 360 78 V150 H0Z" fill="#C3D0BA" opacity="0.8" />
      <path d="M0 40 C70 30 120 60 200 44 S320 10 360 20 V0 H0Z" fill="#C3D0BA" opacity="0.7" />
      {/* Fairway with mowing stripes */}
      <g filter="url(#ha-soft)">
        <path
          id="ha-fairway"
          d="M34 118 C70 104 112 100 150 92 C196 82 226 66 262 58 C286 53 300 50 316 46"
          fill="none"
          stroke="url(#ha-fair)"
          strokeWidth="34"
          strokeLinecap="round"
        />
      </g>
      <path
        d="M34 118 C70 104 112 100 150 92 C196 82 226 66 262 58 C286 53 300 50 316 46"
        fill="none"
        stroke="url(#ha-stripes)"
        strokeWidth="34"
        strokeLinecap="round"
      />
      {/* Bunkers */}
      <ellipse cx="206" cy="95" rx="15" ry="8" fill="#F3EBD7" stroke="#E2D6B8" strokeWidth="1" />
      <ellipse cx="292" cy="77" rx="10" ry="6" fill="#F3EBD7" stroke="#E2D6B8" strokeWidth="1" />
      {/* Green */}
      <ellipse cx="316" cy="44" rx="26" ry="17" fill="url(#ha-green)" filter="url(#ha-soft)" />
      {/* Tee */}
      <rect x="22" y="110" width="22" height="14" rx="4" fill="#7FA277" filter="url(#ha-soft)" />
      {/* Shot path */}
      <path d="M36 116 Q120 70 200 82 T314 46" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" opacity="0.95" />
      {/* Flag */}
      <line x1="318" y1="44" x2="318" y2="14" stroke="#0E1F16" strokeWidth="2" strokeLinecap="round" />
      <path d="M318 14 L338 20 L318 26Z" fill="#C8F169" stroke="#0E1F16" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="318" cy="44" r="2.5" fill="#0E1F16" />
    </svg>
  )
}
