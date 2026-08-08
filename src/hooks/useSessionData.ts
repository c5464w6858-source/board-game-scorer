import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Game, ScoreEntry, Session, SessionPlayer } from '../types'

interface SessionData {
  loading: boolean
  error: string | null
  session: Session | null
  game: Game | null
  players: SessionPlayer[]
  scores: ScoreEntry[]
  refresh: () => Promise<void>
}

export function useSessionData(joinCode: string): SessionData {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [game, setGame] = useState<Game | null>(null)
  const [players, setPlayers] = useState<SessionPlayer[]>([])
  const [scores, setScores] = useState<ScoreEntry[]>([])

  const load = useCallback(async () => {
    const { data: sessionRow, error: sessionErr } = await supabase
      .from('sessions')
      .select('*')
      .eq('join_code', joinCode.toUpperCase())
      .maybeSingle()

    if (sessionErr) {
      setError(sessionErr.message)
      setLoading(false)
      return
    }
    if (!sessionRow) {
      setError(`No session found for code "${joinCode}"`)
      setLoading(false)
      return
    }
    setSession(sessionRow)

    const [{ data: gameRow, error: gameErr }, { data: playerRows, error: playersErr }, { data: scoreRows, error: scoresErr }] =
      await Promise.all([
        supabase.from('games').select('*').eq('id', sessionRow.game_id).single(),
        supabase.from('session_players').select('*').eq('session_id', sessionRow.id).order('joined_at'),
        supabase.from('scores').select('*').eq('session_id', sessionRow.id),
      ])

    if (gameErr) setError(gameErr.message)
    if (playersErr) setError(playersErr.message)
    if (scoresErr) setError(scoresErr.message)

    if (gameRow) setGame(gameRow)
    if (playerRows) setPlayers(playerRows)
    if (scoreRows) setScores(scoreRows)
    setLoading(false)
  }, [joinCode])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (!session) return
    const channel = supabase
      .channel(`session-${session.id}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'scores', filter: `session_id=eq.${session.id}` },
        () => load(),
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'session_players', filter: `session_id=eq.${session.id}` },
        () => load(),
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [session, load])

  return { loading, error, session, game, players, scores, refresh: load }
}
