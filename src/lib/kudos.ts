import { supabase } from './supabase'
import type { Enums, Tables } from './database.types'

export type KudosTag = Enums<'kudos_tag'>
export type Kudos = Tables<'kudos'>

export const kudosTags: { value: KudosTag; label: string }[] = [
  { value: 'great_company', label: 'Great company' },
  { value: 'kept_the_pace', label: 'Kept the pace' },
  { value: 'clutch_putter', label: 'Clutch putter' },
  { value: 'would_play_again', label: 'Would play again' },
]

// Kudos you gave in this round, plus any given to you once they're revealed.
export async function fetchKudos(roundId: string): Promise<Kudos[]> {
  const { data, error } = await supabase.from('kudos').select('*').eq('round_id', roundId)
  if (error) throw error
  return data
}

export async function giveKudos(roundId: string, toId: string, tag: KudosTag) {
  const { error } = await supabase.from('kudos').insert({ round_id: roundId, to_id: toId, tag })
  if (error) throw error
}

export async function takeBackKudos(roundId: string, fromId: string, toId: string, tag: KudosTag) {
  const { error } = await supabase.from('kudos').delete().match({ round_id: roundId, from_id: fromId, to_id: toId, tag })
  if (error) throw error
}
