import { supabase } from './supabase'

export async function requestToJoin(roundId: string, message?: string) {
  const { error } = await supabase
    .from('round_requests')
    .insert({ round_id: roundId, message: message?.trim() || null })
  if (error) throw error
}

export async function withdrawRequest(requestId: string) {
  const { error } = await supabase.from('round_requests').update({ status: 'withdrawn' }).eq('id', requestId)
  if (error) throw error
}

export async function decideRequest(requestId: string, status: 'accepted' | 'declined') {
  const { error } = await supabase.from('round_requests').update({ status }).eq('id', requestId)
  if (error) throw error
}
