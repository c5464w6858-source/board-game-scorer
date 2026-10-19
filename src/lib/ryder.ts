import { supabase } from './supabase'
import type { Enums, Tables, TablesUpdate } from './database.types'
import { shotsOnHole, type Hole } from './scorecard'

export type MatchFormat = Enums<'match_format'>
export type Match = Tables<'group_matches'>

export const matchFormats: { value: MatchFormat; label: string; blurb: string }[] = [
  { value: 'fourball', label: 'Fourballs', blurb: 'Pairs, everyone plays their own ball, best score counts' },
  { value: 'foursomes', label: 'Foursomes', blurb: 'Pairs share one ball and take alternate shots' },
  { value: 'singles', label: 'Singles', blurb: 'One on one' },
]
export const formatLabel = (f: MatchFormat) => matchFormats.find((m) => m.value === f)?.label ?? f

export async function fetchMatches(roundIds: string[]): Promise<Match[]> {
  if (!roundIds.length) return []
  const { data, error } = await supabase.from('group_matches').select('*').in('group_round_id', roundIds).order('sort')
  if (error) throw error
  return data
}

export async function addMatch(m: { group_round_id: string; format: MatchFormat; side_a: string[]; side_b: string[]; sort: number }) {
  const { error } = await supabase.from('group_matches').insert(m)
  if (error) throw error
}

export async function deleteMatch(id: string) {
  const { error } = await supabase.from('group_matches').delete().eq('id', id)
  if (error) throw error
}

export async function updateGroup(id: string, patch: Pick<TablesUpdate<'groups'>, 'ryder_cup' | 'team_a_name' | 'team_b_name'>) {
  const { error } = await supabase.from('groups').update(patch).eq('id', id)
  if (error) throw error
}

export async function setTeam(groupId: string, userId: string, team: 1 | 2 | null) {
  const { error } = await supabase.from('group_members').update({ team }).match({ group_id: groupId, user_id: userId })
  if (error) throw error
}

// In foursomes each side plays one ball, scored under its first player.
export const ballsOf = (side: string[], format: MatchFormat) => (format === 'foursomes' ? side.slice(0, 1) : side)

export interface MatchState {
  up: number // positive: side A up
  thru: number
  finished: boolean
  winner: 'a' | 'b' | 'halved' | null
  pointsA: number
  pointsB: number
  label: string // "2 UP thru 12", "3 & 2", "Halved", "All square thru 4", "Not started"
}

// Match play from hole scores. Shots are given off the lowest handicap in the
// match: full difference in singles and fourballs, half the pair's combined
// handicap in foursomes.
export function matchState(m: Match, holes: Hole[], scores: Map<string, number>, playing: Map<string, number>): MatchState {
  const sideHcp = (side: string[]) =>
    m.format === 'foursomes' ? Math.round(side.reduce((n, id) => n + (playing.get(id) ?? 0), 0) / 2) : null
  const balls = [
    ...ballsOf(m.side_a, m.format).map((id) => ({ id, side: 'a' as const, hcp: sideHcp(m.side_a) ?? playing.get(id) ?? 0 })),
    ...ballsOf(m.side_b, m.format).map((id) => ({ id, side: 'b' as const, hcp: sideHcp(m.side_b) ?? playing.get(id) ?? 0 })),
  ]
  const low = Math.min(...balls.map((b) => b.hcp))
  let up = 0
  let thru = 0
  let finishedAt: number | null = null
  for (const h of holes) {
    const best = (side: 'a' | 'b') => {
      const nets = balls
        .filter((b) => b.side === side)
        .map((b) => {
          const s = scores.get(`${b.id}:${h.hole}`)
          return s == null ? null : s - shotsOnHole(b.hcp - low, h.stroke_index, holes.length)
        })
        .filter((n): n is number => n != null)
      return nets.length ? Math.min(...nets) : null
    }
    const a = best('a')
    const b = best('b')
    if (a == null || b == null) break
    if (a < b) up += 1
    else if (b < a) up -= 1
    thru = h.hole
    if (Math.abs(up) > holes.length - thru) {
      finishedAt = thru
      break
    }
  }
  const left = holes.length - thru
  const finished = finishedAt != null || thru === holes.length
  const winner = !finished ? null : up > 0 ? 'a' : up < 0 ? 'b' : 'halved'
  const label = !thru
    ? 'Not started'
    : finished
      ? up === 0
        ? 'Halved'
        : left
          ? `${Math.abs(up)} & ${left}`
          : `${Math.abs(up)} UP`
      : up === 0
        ? `All square thru ${thru}`
        : `${Math.abs(up)} UP thru ${thru}`
  return {
    up,
    thru,
    finished,
    winner,
    pointsA: winner === 'a' ? 1 : winner === 'halved' ? 0.5 : 0,
    pointsB: winner === 'b' ? 1 : winner === 'halved' ? 0.5 : 0,
    label,
  }
}

export const points = (n: number) => (Number.isInteger(n) ? `${n}` : `${Math.floor(n)}½`.replace(/^0½$/, '½'))
