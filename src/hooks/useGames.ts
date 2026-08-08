import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { BUILT_IN_GAMES } from '../games/catalog'
import type { Game } from '../types'

/** Built-in games as a client-side fallback, in case the DB hasn't been seeded yet. */
const FALLBACK_GAMES: Game[] = BUILT_IN_GAMES.map((g, i) => ({
  ...g,
  id: `fallback-${i}`,
  created_at: new Date(0).toISOString(),
}))

export function useGames() {
  const [games, setGames] = useState<Game[]>(FALLBACK_GAMES)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    supabase
      .from('games')
      .select('*')
      .order('is_builtin', { ascending: false })
      .order('name')
      .then(({ data }) => {
        if (cancelled) return
        if (data && data.length > 0) setGames(data)
        setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return { games, loading }
}
