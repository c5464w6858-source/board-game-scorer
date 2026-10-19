import { supabase } from './supabase'
import type { Enums } from './database.types'

export type ReportReason = Enums<'report_reason'>

export const reportReasons: { value: ReportReason; label: string }[] = [
  { value: 'no_show', label: 'Didn’t show up' },
  { value: 'abusive', label: 'Rude or abusive behaviour' },
  { value: 'unsafe', label: 'Made me feel unsafe' },
  { value: 'fake_profile', label: 'Fake profile or handicap' },
  { value: 'payment', label: 'Asked me for money' },
]

export const genders = [
  { value: 'woman', label: 'Woman' },
  { value: 'man', label: 'Man' },
  { value: 'non_binary', label: 'Non-binary' },
  { value: 'prefer_not', label: 'Prefer not to say' },
] as const

// Golfers you've blocked, newest first.
export async function fetchBlocked() {
  const { data, error } = await supabase
    .from('blocks')
    .select('blocked_id, created_at, golfer:profiles!blocks_blocked_id_fkey(id, display_name, avatar_url)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function blockGolfer(golferId: string) {
  const { error } = await supabase.from('blocks').upsert({ blocked_id: golferId }, { onConflict: 'blocker_id,blocked_id', ignoreDuplicates: true })
  if (error) throw error
}

export async function unblockGolfer(golferId: string) {
  const { error } = await supabase.from('blocks').delete().eq('blocked_id', golferId)
  if (error) throw error
}

// Reports are insert-only: golfers can never read them back.
export async function sendReport(report: { reported_id: string; reason: ReportReason; details: string | null; round_id?: string | null }) {
  const { error } = await supabase.from('reports').insert(report)
  if (error) throw error
}
