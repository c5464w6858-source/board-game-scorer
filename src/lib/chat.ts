import { supabase } from './supabase'
import type { Tables } from './database.types'

export type Message = Tables<'round_messages'>

export async function fetchMessages(roundId: string, limit = 100): Promise<Message[]> {
  const { data, error } = await supabase
    .from('round_messages')
    .select('*')
    .eq('round_id', roundId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data.reverse()
}

export async function sendMessage(roundId: string, body: string) {
  const { error } = await supabase.from('round_messages').insert({ round_id: roundId, body: body.trim() })
  if (error) throw error
}

// Live new messages for one round (Supabase Realtime). Returns an unsubscribe.
export function subscribeToMessages(roundId: string, onMessage: (m: Message) => void) {
  const channel = supabase
    .channel(`round-chat-${roundId}`)
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'round_messages', filter: `round_id=eq.${roundId}` },
      (payload) => onMessage(payload.new as Message),
    )
    .subscribe()
  return () => {
    void supabase.removeChannel(channel)
  }
}

// The latest message in each of the user's round chats, newest first.
export async function fetchLastMessages(roundIds: string[]): Promise<Map<string, Message>> {
  const last = new Map<string, Message>()
  if (!roundIds.length) return last
  const { data, error } = await supabase
    .from('round_messages')
    .select('*')
    .in('round_id', roundIds)
    .order('created_at', { ascending: false })
    .limit(200)
  if (error) throw error
  for (const m of data) if (!last.has(m.round_id)) last.set(m.round_id, m)
  return last
}
