import { acceptedPlayers, type RoundRow } from './rounds'
import { defaultTee, playingHandicap, shotsOnHole, stablefordPoints, type Card, type Hole } from './scorecard'

export interface Player {
  id: string
  name: string
  avatar: string | null
  handicap: number | null
}

export const scoreKey = (userId: string, hole: number) => `${userId}:${hole}`

// Host and accepted players, with you first.
export function playersOf(r: RoundRow, me: string): Player[] {
  const host = { id: r.host_id, name: r.host?.display_name ?? 'Host', avatar: r.host?.avatar_url ?? null, handicap: r.host?.handicap ?? null }
  const all = [
    host,
    ...acceptedPlayers(r).map((q) => ({
      id: q.user_id,
      name: q.profile?.display_name ?? 'Golfer',
      avatar: q.profile?.avatar_url ?? null,
      handicap: q.profile?.handicap ?? null,
    })),
  ]
  return all.sort((a, b) => Number(b.id === me) - Number(a.id === me))
}

// Without a card from the API, fall back to par 4s so scoring still works.
export function holesFor(r: Pick<RoundRow, 'holes'>, card: Card | null): Hole[] {
  const count = r.holes === 9 ? 9 : 18
  const fromCard = card?.holes.filter((h) => h.hole <= count) ?? []
  if (fromCard.length === count) return fromCard
  return Array.from({ length: count }, (_, i) => ({ course_id: '', hole: i + 1, par: 4, stroke_index: i + 1, yards: null }))
}

// Everything needed to score a round: its holes, tees and each player's shots.
export function setupScoring(round: RoundRow, card: Card | null, me: string) {
  return scoringFor(round, card, playersOf(round, me))
}

// The same for any round shape, e.g. a society round, with its own players.
export function scoringFor(round: { holes: number; tee_id: string | null }, card: Card | null, roster: Player[]) {
  const holes = holesFor(round, card)
  const tee = card ? (card.tees.find((t) => t.id === round.tee_id) ?? defaultTee(card)) : null
  const nine = holes.length === 9
  // On nine holes, play off half the handicap, using the stroke-index order of those nine.
  const siRank = new Map([...holes].sort((a, b) => a.stroke_index - b.stroke_index).map((h, i) => [h.hole, i + 1]))
  const players = roster.map((p) => {
    const full = playingHandicap(p.handicap, tee, card?.holes ?? holes)
    const playing = nine ? Math.round(full / 2) : full
    const shots = (h: Hole) => shotsOnHole(playing, nine ? siRank.get(h.hole)! : h.stroke_index, holes.length)
    return { ...p, playing, shots }
  })
  return { holes, tee, players, hasCard: Boolean(card) }
}

export type ScoringPlayer = ReturnType<typeof scoringFor>['players'][number]

// Stableford points, gross and par for the holes each player has scored, best first.
export function leaderboard(players: ScoringPlayer[], holes: Hole[], scores: Map<string, number>) {
  return players
    .map((p) => {
      let points = 0
      let gross = 0
      let par = 0
      let thru = 0
      for (const h of holes) {
        const s = scores.get(scoreKey(p.id, h.hole))
        if (s == null) continue
        points += stablefordPoints(s, h.par, p.shots(h))
        gross += s
        par += h.par
        thru += 1
      }
      return { ...p, points, gross, toPar: gross - par, thru }
    })
    .sort((a, b) => b.points - a.points || a.gross - b.gross)
}
