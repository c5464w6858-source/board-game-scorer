export function Avatar({
  name,
  src,
  size = 34,
  ring,
  border,
}: {
  name: string
  src?: string | null
  size?: number
  ring?: boolean
  border?: string
}) {
  const style = {
    width: size,
    height: size,
    borderRadius: size / 2,
    border: border ? `2px solid ${border}` : undefined,
  }
  const ringCls = ring ? 'ring-[3px] ring-green ring-offset-2 ring-offset-clubhouse' : ''
  return src ? (
    <img src={src} alt={name} style={style} className={`shrink-0 object-cover ${ringCls}`} />
  ) : (
    <span
      role="img"
      aria-label={name}
      style={{ ...style, fontSize: size * 0.38 }}
      className={`inline-grid shrink-0 place-items-center bg-green-tint font-semibold text-green-dark ${ringCls}`}
    >
      {name.trim().charAt(0).toUpperCase()}
    </span>
  )
}

export function OpenSpot({ size = 34, onDark }: { size?: number; onDark?: boolean }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size, borderRadius: size / 2 }}
      className={`inline-block shrink-0 border-2 border-dashed ${onDark ? 'border-[#5E7A69] bg-fairway' : 'border-[#9AA39D]'}`}
    />
  )
}

export interface Seat {
  name: string
  avatarUrl?: string | null
}

// Overlapping faces followed by dashed open spots, up to `total` seats.
export function AvatarStack({
  players,
  total,
  size = 34,
  onDark,
}: {
  players: Seat[]
  total: number
  size?: number
  onDark?: boolean
}) {
  const open = Math.max(0, total - players.length)
  const edge = onDark ? '#0E1F16' : '#F5F4EF'
  return (
    <span className="inline-flex items-center">
      {players.map((p, i) => (
        <span key={i} style={{ marginLeft: i ? -10 : 0 }}>
          <Avatar name={p.name} src={p.avatarUrl} size={size} border={edge} />
        </span>
      ))}
      {Array.from({ length: open }, (_, i) => (
        <span key={`o${i}`} style={{ marginLeft: players.length + i ? -10 : 0 }}>
          <OpenSpot size={size} onDark={onDark} />
        </span>
      ))}
    </span>
  )
}
