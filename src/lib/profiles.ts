import { supabase } from './supabase'
import type { Tables, TablesInsert, TablesUpdate } from './database.types'

export type Profile = Tables<'profiles'>
export type ProfileUpdate = Pick<
  TablesUpdate<'profiles'>,
  | 'display_name'
  | 'home_area'
  | 'bio'
  | 'handicap'
  | 'home_club_id'
  | 'home_club_member'
  | 'play_style'
  | 'bag'
  | 'avatar_url'
  | 'onboarded_at'
>

// Private to the golfer; clubs only ever see golfers with clubs_can_contact.
export type Preferences = Tables<'golfer_preferences'>
export type PreferencesUpdate = Omit<TablesInsert<'golfer_preferences'>, 'user_id' | 'updated_at'>

export const playFrequencies = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'occasionally', label: 'Now and then' },
] as const

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

export async function fetchPreferences(userId: string): Promise<Preferences | null> {
  const { data, error } = await supabase.from('golfer_preferences').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  return data
}

export async function savePreferences(userId: string, patch: PreferencesUpdate) {
  const { error } = await supabase
    .from('golfer_preferences')
    .upsert({ ...patch, user_id: userId, updated_at: new Date().toISOString() })
  if (error) throw error
}

// Whether the golfer has finished (or skipped) first-run setup.
export async function fetchOnboarded(userId: string): Promise<boolean> {
  const { data, error } = await supabase.from('profiles').select('onboarded_at').eq('id', userId).maybeSingle()
  if (error) throw error
  return Boolean(data?.onboarded_at)
}

// Your connection status with each golfer you've connected with or asked.
export async function fetchConnectionStatus(userId: string): Promise<Map<string, 'pending' | 'accepted'>> {
  const { data, error } = await supabase.from('connections').select('requester_id, addressee_id, status').in('status', ['pending', 'accepted'])
  if (error) throw error
  return new Map(data.map((c) => [c.requester_id === userId ? c.addressee_id : c.requester_id, c.status as 'pending' | 'accepted']))
}

export async function sendBuddyRequest(addresseeId: string) {
  const { error } = await supabase.from('connections').insert({ addressee_id: addresseeId })
  if (error) throw error
}
