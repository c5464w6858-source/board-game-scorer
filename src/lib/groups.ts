import type { QueryData } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Enums, Tables, TablesInsert } from './database.types'

export type GroupKind = Enums<'group_kind'>
export type GroupScore = Tables<'group_scores'>

export const groupKinds: { value: GroupKind; label: string; blurb: string }[] = [
  { value: 'society', label: 'Society', blurb: 'Regular fixtures and an order of merit' },
  { value: 'trip', label: 'Golf trip', blurb: 'A few rounds away with the lads or lasses' },
  { value: 'event', label: 'One-off event', blurb: 'A day out, charity day or stag do' },
]
export const kindLabel = (k: GroupKind) => groupKinds.find((g) => g.value === k)?.label ?? k

const GROUP_SELECT = `
  *,
  group_members(user_id, role, joined_at, profile:profiles(id, display_name, avatar_url, handicap)),
  group_rounds(*, course:courses(id, name, town, lat, lon))
`
const groupQuery = () => supabase.from('groups').select(GROUP_SELECT)
export type GroupRow = QueryData<ReturnType<typeof groupQuery>>[number]
export type GroupMember = GroupRow['group_members'][number]
export type GroupRound = GroupRow['group_rounds'][number]

const byTeeTime = (a: { tee_time: string }, b: { tee_time: string }) => a.tee_time.localeCompare(b.tee_time)

// Groups you're in, with members and schedule, soonest round first.
export async function fetchMyGroups(): Promise<GroupRow[]> {
  const { data, error } = await groupQuery().order('created_at', { ascending: false })
  if (error) throw error
  return data.map((g) => ({ ...g, group_rounds: [...g.group_rounds].sort(byTeeTime) }))
}

export async function fetchGroup(id: string): Promise<GroupRow | null> {
  const { data, error } = await groupQuery().eq('id', id).maybeSingle()
  if (error) throw error
  return data && { ...data, group_rounds: [...data.group_rounds].sort(byTeeTime) }
}

export async function createGroup(input: Omit<TablesInsert<'groups'>, 'id' | 'owner_id' | 'invite_code' | 'created_at'>) {
  const { data, error } = await supabase.from('groups').insert(input).select('id').single()
  if (error) throw error
  return data.id
}

export async function joinGroup(code: string): Promise<string> {
  const { data, error } = await supabase.rpc('join_group', { p_code: code })
  if (error) throw error
  return data
}

export async function leaveGroup(groupId: string, userId: string) {
  const { error } = await supabase.from('group_members').delete().match({ group_id: groupId, user_id: userId })
  if (error) throw error
}

export async function setMemberRole(groupId: string, userId: string, role: Enums<'group_role'>) {
  const { error } = await supabase.from('group_members').update({ role }).match({ group_id: groupId, user_id: userId })
  if (error) throw error
}

export async function addGroupRound(input: Omit<TablesInsert<'group_rounds'>, 'id' | 'created_at'>) {
  const { data, error } = await supabase.from('group_rounds').insert(input).select('id').single()
  if (error) throw error
  return data.id
}

export async function deleteGroupRound(id: string) {
  const { error } = await supabase.from('group_rounds').delete().eq('id', id)
  if (error) throw error
}

// Every score in the group, across all its rounds.
export async function fetchGroupScores(roundIds: string[]): Promise<GroupScore[]> {
  if (!roundIds.length) return []
  const { data, error } = await supabase.from('group_scores').select('*').in('group_round_id', roundIds)
  if (error) throw error
  return data
}

export async function saveGroupScores(rows: { group_round_id: string; user_id: string; hole: number; strokes: number }[]) {
  if (!rows.length) return
  const { error } = await supabase.from('group_scores').upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })))
  if (error) throw error
}

// Live score changes for one group round. Returns an unsubscribe.
export function subscribeToGroupScores(roundId: string, onChange: (s: GroupScore) => void) {
  const channel = supabase
    .channel(`group-scores-${roundId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'group_scores', filter: `group_round_id=eq.${roundId}` },
      (payload) => payload.new && 'hole' in payload.new && onChange(payload.new as GroupScore),
    )
    .subscribe()
  return () => {
    void supabase.removeChannel(channel)
  }
}

export const inviteLink = (code: string) => `${window.location.origin}/groups/join/${code}`
