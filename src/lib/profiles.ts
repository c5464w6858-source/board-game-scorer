import { supabase } from './supabase'
import type { Tables, TablesUpdate } from './database.types'

export type Profile = Tables<'profiles'>
export type ProfileUpdate = Pick<
  TablesUpdate<'profiles'>,
  'display_name' | 'home_area' | 'bio' | 'handicap' | 'home_club_id' | 'play_style' | 'bag' | 'avatar_url'
>

export interface GolferStats {
  rounds: number
  buddies: number
  // null until the golfer has attendance history: shown as "New".
  showsUpPct: number | null
}

export async function fetchProfile(id: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*, home_club:courses!profiles_home_club_id_fkey(id, name, lat, lon)')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

export type ProfileWithClub = NonNullable<Awaited<ReturnType<typeof fetchProfile>>>

export async function fetchStats(id: string): Promise<GolferStats> {
  const { data, error } = await supabase.rpc('golfer_stats', { p_user_id: id })
  if (error) throw error
  const row = data[0]
  return {
    rounds: Number(row?.rounds ?? 0),
    buddies: Number(row?.buddies ?? 0),
    showsUpPct: row?.shows_up_pct == null ? null : Number(row.shows_up_pct),
  }
}

export async function updateProfile(id: string, patch: ProfileUpdate) {
  const { error } = await supabase.from('profiles').update(patch).eq('id', id)
  if (error) throw error
}

export async function uploadAvatar(userId: string, file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const path = `${userId}/avatar-${Date.now()}.${ext}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) throw error
  return supabase.storage.from('avatars').getPublicUrl(path).data.publicUrl
}

// Ids of golfers connected to the user (accepted connections only).
export async function fetchBuddyIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('connections')
    .select('requester_id, addressee_id')
    .eq('status', 'accepted')
  if (error) throw error
  return data.map((c) => (c.requester_id === userId ? c.addressee_id : c.requester_id))
}
