import { acceptedPlayers, spotsLeft, type RoundRow } from '../../lib/rounds'

export const lineup = (r: RoundRow) => [
  { name: r.host?.display_name ?? 'Host', avatarUrl: r.host?.avatar_url },
  ...acceptedPlayers(r).map((p) => ({ name: p.profile?.display_name ?? 'Golfer', avatarUrl: p.profile?.avatar_url })),
]

export const spotsText = (r: RoundRow) => {
  const n = spotsLeft(r)
  return n ? `${n} spot${n === 1 ? '' : 's'} open` : 'Full'
}

export const distanceText = (miles: number | null | undefined) =>
  miles == null ? null : miles < 0.5 ? 'At your club' : `${miles.toFixed(1)} mi`
