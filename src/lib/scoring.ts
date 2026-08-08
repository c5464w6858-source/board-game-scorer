import type { CategoryDef, Game, ScoreEntry } from '../types'

/** Total for one player: sum over categories of weight * (sum of that category's stored values). */
export function computeTotal(game: Game, playerId: string, scores: ScoreEntry[]): number {
  const byCategory = new Map<string, number>()
  for (const s of scores) {
    if (s.player_id !== playerId) continue
    byCategory.set(s.category_key, (byCategory.get(s.category_key) ?? 0) + s.value)
  }
  return game.categories.reduce((total, cat) => {
    const raw = byCategory.get(cat.key) ?? 0
    return total + raw * cat.weight
  }, 0)
}

export function categoryRawTotal(category: CategoryDef, playerId: string, scores: ScoreEntry[]): number {
  return scores
    .filter((s) => s.player_id === playerId && s.category_key === category.key)
    .reduce((sum, s) => sum + s.value, 0)
}

export function nextRoundIndex(category: CategoryDef, playerId: string, scores: ScoreEntry[]): number {
  const rounds = scores
    .filter((s) => s.player_id === playerId && s.category_key === category.key)
    .map((s) => s.round ?? 0)
  return rounds.length ? Math.max(...rounds) + 1 : 1
}
