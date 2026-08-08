import { supabase } from './supabase'
import { getDeviceId, setMyPlayerId } from './device'
import type { Game } from '../types'

function randomCode(game: Game): string {
  const prefix = game.slug
    .split('-')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3)
  const digits = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}-${digits}`
}

/** Creates a session for the given game and joins the creator as the first player. */
export async function createSession(game: Game, hostName: string) {
  let joinCode = ''
  let sessionId = ''

  for (let attempt = 0; attempt < 5; attempt++) {
    joinCode = randomCode(game)
    const { data, error } = await supabase
      .from('sessions')
      .insert({ join_code: joinCode, game_id: game.id })
      .select('id, join_code')
      .single()

    if (!error && data) {
      sessionId = data.id
      break
    }
    if (error && !error.message.includes('duplicate')) {
      throw error
    }
  }

  if (!sessionId) throw new Error('Could not allocate a join code, try again')

  const player = await joinSession(sessionId, joinCode, hostName)
  return { joinCode, sessionId, player }
}

export async function findSessionByCode(joinCode: string) {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .eq('join_code', joinCode.toUpperCase())
    .maybeSingle()
  if (error) throw error
  return data
}

export async function joinSession(sessionId: string, joinCode: string, name: string) {
  const { data, error } = await supabase
    .from('session_players')
    .insert({ session_id: sessionId, name, device_id: getDeviceId() })
    .select('*')
    .single()
  if (error) throw error
  setMyPlayerId(joinCode, data.id)
  return data
}
