export type CategoryType = 'number' | 'counter' | 'checkbox' | 'table'

export interface CategoryOption {
  label: string
  value: number
}

export interface CategoryDef {
  key: string
  label: string
  type: CategoryType
  /** Points contributed per unit of stored value. Table/number categories store the final point value directly, so weight is 1. */
  weight: number
  /** For counter/number categories: allow more than one entry (e.g. repeated route claims, round scores). */
  repeatable?: boolean
  min?: number
  max?: number
  options?: CategoryOption[]
  helpText?: string
}

export interface GameTheme {
  primary: string
  accent: string
  bg: string
  text: string
  icon: string
}

export interface ScoringRules {
  mode: 'weighted_sum'
}

export interface Game {
  id: string
  slug: string
  name: string
  is_builtin: boolean
  theme: GameTheme
  categories: CategoryDef[]
  scoring_rules: ScoringRules
  created_at: string
}

export interface Session {
  id: string
  join_code: string
  game_id: string
  status: 'active' | 'finished'
  created_at: string
  finished_at: string | null
}

export interface SessionPlayer {
  id: string
  session_id: string
  name: string
  device_id: string | null
  joined_at: string
}

export interface ScoreEntry {
  id: string
  session_id: string
  player_id: string
  category_key: string
  value: number
  round: number | null
  updated_at: string
}
