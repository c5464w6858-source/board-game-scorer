import type { QueryData } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { TablesInsert } from './database.types'

// Row-level security decides which requests come back: everyone sees accepted
// ones, requesters see their own, and the host sees all of them.
const ROUND_SELECT = `
  *,
  host:profiles!rounds_host_id_fkey(id, display_name, avatar_url, handicap),
  course:courses(id, name, town, postcode, lat, lon, website, booking_url),
  round_requests(id, user_id, status, message, created_at, profile:profiles(id, display_name, avatar_url, handicap))
`

const roundsQuery = () => supabase.from('rounds').select(ROUND_SELECT)
export type RoundRow = QueryData<ReturnType<typeof roundsQuery>>[number]
export type RequestRow = RoundRow['round_requests'][number]

export const acceptedPlayers = (r: RoundRow) => r.round_requests.filter((q) => q.status === 'accepted')
export const pendingRequests = (r: RoundRow) => r.round_requests.filter((q) => q.status === 'pending')
export const spotsLeft = (r: RoundRow) => Math.max(0, r.max_players - 1 - acceptedPlayers(r).length)
export const myRequest = (r: RoundRow, userId: string) => r.round_requests.find((q) => q.user_id === userId)
export const roundTitle = (r: RoundRow) => r.title?.trim() || `${r.course_name}`

export async function fetchRound(id: string): Promise<RoundRow | null> {
  const { data, error } = await roundsQuery().eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

// Rounds still to play, soonest first. Pass hostId to see only that host's.
export async function fetchUpcomingRounds(limit = 50): Promise<RoundRow[]> {
  const { data, error } = await roundsQuery()
    .eq('cancelled', false)
    .gt('tee_time', new Date().toISOString())
    .order('tee_time')
    .limit(limit)
  if (error) throw error
  return data
}

// The golfer's "games I'm shown" choices from the Safety page.
// Rounds you host or have asked to join (pending or accepted) from a date on,
// soonest first. Not limited to the open-games feed, so none go missing.
export async function fetchMyRounds(userId: string, from: Date = new Date()): Promise<RoundRow[]> {
  const { data: asked, error: askError } = await supabase
    .from('round_requests')
    .select('round_id')
    .eq('user_id', userId)
    .in('status', ['pending', 'accepted'])
  if (askError) throw askError
  const ids = asked.map((q) => q.round_id)
  const { data, error } = await roundsQuery()
    .eq('cancelled', false)
    .gte('tee_time', from.toISOString())
    .or(ids.length ? `host_id.eq.${userId},id.in.(${ids.join(',')})` : `host_id.eq.${userId}`)
    .order('tee_time')
  if (error) throw error
  return data
}

export const fitsPreferences = (r: RoundRow, prefs: { women_only: boolean; beginner_friendly: boolean } | null | undefined) =>
  (!prefs?.women_only || r.women_only) && (!prefs?.beginner_friendly || r.beginner_friendly)

export const isOpenTo = (r: RoundRow, userId: string) =>
  r.host_id !== userId && spotsLeft(r) > 0 && !myRequest(r, userId)

// Rounds the user hosts or has been accepted into.
export const isMyRound = (r: RoundRow, userId: string) =>
  r.host_id === userId || r.round_requests.some((q) => q.user_id === userId && q.status === 'accepted')

export type NewRound = Omit<TablesInsert<'rounds'>, 'id' | 'host_id' | 'created_at' | 'cancelled'>

export async function createRound(round: NewRound) {
  const { data, error } = await supabase.from('rounds').insert(round).select('id').single()
  if (error) throw error
  return data.id
}

export async function cancelRound(id: string) {
  const { error } = await supabase.from('rounds').update({ cancelled: true }).eq('id', id)
  if (error) throw error
}

// Mark a round as needing a player: the first golfer to say yes gets the spot.
export async function setUrgent(roundId: string, urgent: boolean) {
  const { error } = await supabase.from('rounds').update({ urgent }).eq('id', roundId)
  if (error) throw error
}
