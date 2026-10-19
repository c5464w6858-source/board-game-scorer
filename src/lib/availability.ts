import { supabase } from './supabase'
import type { Enums } from './database.types'
import { teeTime, ymd } from './format'

export type Slot = Enums<'day_slot'>
export const slotKey = (day: string, slot: Slot) => `${day}:${slot}`

// Which free slot a tee time falls in: morning before noon UK time, else afternoon.
export function roundSlot(iso: string) {
  const d = new Date(iso)
  return { day: ymd(d), slot: (Number(teeTime(iso).slice(0, 2)) < 12 ? 'am' : 'pm') as Slot }
}

// Your free slots from today on, as "2026-10-24:am" keys.
export async function fetchMyAvailability(userId: string): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('availability')
    .select('day, slot')
    .eq('user_id', userId)
    .gte('day', ymd(new Date()))
  if (error) throw error
  return new Set(data.map((a) => slotKey(a.day, a.slot)))
}

// Replace your free slots on these days with the ones chosen.
export async function saveAvailability(userId: string, days: string[], chosen: Set<string>) {
  const { error: clearError } = await supabase.from('availability').delete().eq('user_id', userId).in('day', days)
  if (clearError) throw clearError
  const rows = [...chosen]
    .map((k) => k.split(':') as [string, Slot])
    .filter(([day]) => days.includes(day))
    .map(([day, slot]) => ({ user_id: userId, day, slot }))
  if (!rows.length) return
  const { error } = await supabase.from('availability').insert(rows)
  if (error) throw error
}

// Golfers who said they're free in this slot, with what's needed to judge distance.
export async function fetchFreeGolfers(day: string, slot: Slot) {
  const { data, error } = await supabase
    .from('availability')
    .select('profile:profiles(id, display_name, avatar_url, handicap, search_radius_miles, home_club:courses!profiles_home_club_id_fkey(lat, lon))')
    .eq('day', day)
    .eq('slot', slot)
  if (error) throw error
  return data.map((a) => a.profile).filter((p) => p != null)
}
