// A drawn par-4 hole (tee, dogleg fairway, bunkers, green and flag) in brand
// colours, used as artwork instead of a photo.
export function HoleArt({ className = '' }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 360 150" preserveAspectRatio="xMidYMid slice" className={className}>
      <rect width="360" height="150" fill="#CFE8D6" />
      <path d="M0 110 C60 90 90 130 160 112 S280 60 360 78 V150 H0Z" fill="#BFE0C8" />
      <path d="M0 40 C70 30 120 60 200 44 S320 10 360 20 V0 H0Z" fill="#BFE0C8" />
      {/* Fairway */}
      <path
        d="M34 118 C70 104 112 100 150 92 C196 82 226 66 262 58 C286 53 300 50 316 46"
        fill="none"
        stroke="#7CC48F"
        strokeWidth="34"
        strokeLinecap="round"
      />
      {/* Bunkers */}
      <ellipse cx="206" cy="94" rx="15" ry="8" fill="#EFE3C4" />
      <ellipse cx="292" cy="76" rx="10" ry="6" fill="#EFE3C4" />
      {/* Green */}
      <ellipse cx="316" cy="44" rx="26" ry="17" fill="#4FAE6A" />
      {/* Tee */}
      <rect x="22" y="110" width="22" height="14" rx="4" fill="#5DB477" />
      {/* Shot path */}
      <path d="M36 116 Q120 70 200 82 T314 46" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="2 6" strokeLinecap="round" opacity="0.9" />
      {/* Flag */}
      <line x1="318" y1="44" x2="318" y2="14" stroke="#0E1F16" strokeWidth="2" strokeLinecap="round" />
      <path d="M318 14 L338 20 L318 26Z" fill="#C8F169" stroke="#0E1F16" strokeWidth="1.2" strokeLinejoin="round" />
      <circle cx="318" cy="44" r="2.5" fill="#0E1F16" />
    </svg>
  )
}
