import { distanceKm } from './courses'
import { playStyleLabel } from './format'
import { acceptedPlayers, type RoundRow } from './rounds'

export interface MatchProfile {
  handicap: number | null
  playStyle: string[]
  home: { lat: number; lon: number } | null
  buddyIds: string[]
}

export interface Match {
  percent: number
  reasons: string[]
}

const MILES_PER_KM = 0.621371
// profiles.search_radius_miles arrives in Phase 2; until then everyone gets this.
export const DEFAULT_RADIUS_MILES = 15

export const miles = (km: number) => km * MILES_PER_KM

export function roundDistanceMiles(round: RoundRow, me: MatchProfile): number | null {
  if (!me.home || !round.course) return null
  return miles(distanceKm(me.home.lat, me.home.lon, round.course.lat, round.course.lon))
}

function roundStyles(round: RoundRow) {
  const tags = new Set<string>()
  if (round.walking) tags.add('walking')
  if (new Date(round.tee_time).getUTCHours() < 9) tags.add('early_tee_times')
  return tags
}

// Explainable 0-100 score (build spec, section 6). Each part is only counted
// when we have the data to judge it, and the total is scaled to the parts we
// can judge, so a golfer with no home club isn't punished.
//   handicap closeness 35 | distance 25 | availability 15 | buddies 15 | style 10
// Availability arrives in Phase 2, so it is left out for now.
export function matchScore(round: RoundRow, me: MatchProfile): Match {
  let earned = 0
  let possible = 0
  const scored: { points: number; reason: string }[] = []

  const hostHcp = round.host?.handicap ?? null
  if (me.handicap != null && hostHcp != null) {
    const gap = Math.abs(me.handicap - hostHcp)
    const points = 35 * Math.max(0, 1 - gap / 15)
    possible += 35
    earned += points
    if (points >= 17.5) scored.push({ points, reason: `Handicap within ${Math.max(1, Math.round(gap))} shots of yours` })
  }

  const dist = roundDistanceMiles(round, me)
  if (dist != null) {
    const points = 25 * Math.max(0, 1 - dist / DEFAULT_RADIUS_MILES)
    possible += 25
    earned += points
    if (points >= 12.5) scored.push({ points, reason: `${dist.toFixed(1)} miles from home` })
  }

  possible += 15
  const buddyHere = [round.host_id, ...acceptedPlayers(round).map((p) => p.user_id)].find((id) =>
    me.buddyIds.includes(id),
  )
  if (buddyHere) {
    earned += 15
    const name =
      buddyHere === round.host_id
        ? round.host?.display_name
        : acceptedPlayers(round).find((p) => p.user_id === buddyHere)?.profile?.display_name
    scored.push({ points: 15, reason: `${name ?? 'A buddy'} is playing` })
  }

  const shared = [...roundStyles(round)].filter((t) => me.playStyle.includes(t))
  if (me.playStyle.length) {
    possible += 10
    earned += 10 * Math.min(1, shared.length / 2)
    if (shared.length) scored.push({ points: 5 * shared.length, reason: `You both like ${shared.map((s) => playStyleLabel(s).toLowerCase()).join(' and ')}` })
  }

  return {
    percent: possible ? Math.round((earned / possible) * 100) : 0,
    reasons: scored.sort((a, b) => b.points - a.points).slice(0, 2).map((s) => s.reason),
  }
}
