import type { CategoryDef, Game, GameTheme } from '../types'

/**
 * Source of truth for the built-in game library. Used both to render the app
 * (as a fallback if the `games` table is empty/unreachable) and as the seed
 * payload inserted into Supabase.
 */

const ticketToRideTheme: GameTheme = {
  primary: '#0e4f8f',
  accent: '#f2b134',
  bg: '#eef5fb',
  text: '#0b2e52',
  icon: 'train',
}

const catanTheme: GameTheme = {
  primary: '#8a5a2c',
  accent: '#e0a63e',
  bg: '#fbf3e6',
  text: '#4a2f14',
  icon: 'hexagon',
}

const wingspanTheme: GameTheme = {
  primary: '#2f6d4f',
  accent: '#9fc98a',
  bg: '#eef7ef',
  text: '#1c3d2b',
  icon: 'feather',
}

const splendorTheme: GameTheme = {
  primary: '#7c1fa2',
  accent: '#2fb6a8',
  bg: '#f5eefb',
  text: '#3a0a4f',
  icon: 'gem',
}

const genericTheme: GameTheme = {
  primary: '#475569',
  accent: '#6366f1',
  bg: '#f1f5f9',
  text: '#1e293b',
  icon: 'dice',
}

const ticketToRideCategories: CategoryDef[] = [
  {
    key: 'route',
    label: 'Route claimed',
    type: 'table',
    weight: 1,
    repeatable: true,
    options: [
      { label: '1 car (1 pt)', value: 1 },
      { label: '2 cars (2 pts)', value: 2 },
      { label: '3 cars (4 pts)', value: 4 },
      { label: '4 cars (7 pts)', value: 7 },
      { label: '5 cars (10 pts)', value: 10 },
      { label: '6 cars (15 pts)', value: 15 },
    ],
    helpText: 'Add one entry per route you claim',
  },
  {
    key: 'destination_ticket',
    label: 'Destination ticket',
    type: 'number',
    weight: 1,
    repeatable: true,
    helpText: 'Positive if completed, negative if not',
  },
  {
    key: 'longest_path',
    label: 'Longest continuous path',
    type: 'checkbox',
    weight: 10,
  },
]

const catanCategories: CategoryDef[] = [
  { key: 'settlements', label: 'Settlements', type: 'counter', weight: 1, min: 0, max: 5 },
  { key: 'cities', label: 'Cities', type: 'counter', weight: 2, min: 0, max: 4 },
  { key: 'dev_card_vp', label: 'Victory point cards', type: 'counter', weight: 1 },
  { key: 'longest_road', label: 'Longest road', type: 'checkbox', weight: 2 },
  { key: 'largest_army', label: 'Largest army', type: 'checkbox', weight: 2 },
]

const wingspanCategories: CategoryDef[] = [
  { key: 'bird_points', label: 'Bird points', type: 'number', weight: 1 },
  { key: 'bonus_cards', label: 'Bonus cards', type: 'number', weight: 1 },
  { key: 'end_round_goals', label: 'End-of-round goals', type: 'number', weight: 1 },
  { key: 'eggs', label: 'Eggs', type: 'counter', weight: 1 },
  { key: 'cached_food', label: 'Food cached on cards', type: 'counter', weight: 1 },
  { key: 'tucked_cards', label: 'Tucked cards', type: 'counter', weight: 1 },
]

const splendorCategories: CategoryDef[] = [
  { key: 'card_points', label: 'Development card points', type: 'number', weight: 1 },
  { key: 'nobles', label: 'Nobles visited', type: 'counter', weight: 3 },
]

const genericCategories: CategoryDef[] = [
  {
    key: 'round',
    label: 'Round score',
    type: 'number',
    weight: 1,
    repeatable: true,
    helpText: 'Add one entry per round',
  },
]

export const BUILT_IN_GAMES: Omit<Game, 'id' | 'created_at'>[] = [
  {
    slug: 'ticket-to-ride',
    name: 'Ticket to Ride',
    is_builtin: true,
    theme: ticketToRideTheme,
    categories: ticketToRideCategories,
    scoring_rules: { mode: 'weighted_sum' },
  },
  {
    slug: 'catan',
    name: 'Catan',
    is_builtin: true,
    theme: catanTheme,
    categories: catanCategories,
    scoring_rules: { mode: 'weighted_sum' },
  },
  {
    slug: 'wingspan',
    name: 'Wingspan',
    is_builtin: true,
    theme: wingspanTheme,
    categories: wingspanCategories,
    scoring_rules: { mode: 'weighted_sum' },
  },
  {
    slug: 'splendor',
    name: 'Splendor',
    is_builtin: true,
    theme: splendorTheme,
    categories: splendorCategories,
    scoring_rules: { mode: 'weighted_sum' },
  },
  {
    slug: 'generic',
    name: 'Generic Scoring',
    is_builtin: true,
    theme: genericTheme,
    categories: genericCategories,
    scoring_rules: { mode: 'weighted_sum' },
  },
]
