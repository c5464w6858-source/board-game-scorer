import { supabase } from './supabase'
import type { Tables } from './database.types'

export type Tee = Tables<'course_tees'>
export type Hole = Tables<'course_holes'>
export type Score = Tables<'scores'>
export interface Card {
  tees: Tee[]
  holes: Hole[]
}

async function readCard(courseId: string): Promise<Card> {
  const [tees, holes] = await Promise.all([
    supabase.from('course_tees').select('*').eq('course_id', courseId).order('sort'),
    supabase.from('course_holes').select('*').eq('course_id', courseId).order('hole'),
  ])
  if (tees.error) throw tees.error
  if (holes.error) throw holes.error
  return { tees: tees.data, holes: holes.data }
}

// The course's scorecard. The first time a course is used, the course-card
// function fetches it from the UK Golf Course API and saves it for everyone.
// Returns null when no card is available for this course.
export async function fetchCard(courseId: string): Promise<Card | null> {
  const card = await readCard(courseId)
  if (card.holes.length) return card
  const { data, error } = await supabase.functions.invoke<{ status: string }>('course-card', { body: { course_id: courseId } })
  if (error || data?.status !== 'ready') return null
  const fetched = await readCard(courseId)
  return fetched.holes.length ? fetched : null
}

export const teeLabel = (t: Tee) => (t.gender && t.gender !== 'Male' ? `${t.name} (${t.gender === 'Female' ? 'ladies' : t.gender.toLowerCase()})` : t.name)

export const defaultTee = (card: Card) => card.tees.find((t) => t.is_default) ?? card.tees[0] ?? null

// Course handicap under WHS: index × slope / 113 + (course rating − par).
// Individual Stableford uses 95% of it, rounded.
export function playingHandicap(index: number | null, tee: Tee | null, holes: Hole[]) {
  if (index == null) return 0
  const par = tee?.par || holes.reduce((n, h) => n + h.par, 0) || 72
  const slope = tee?.slope ?? 113
  const rating = tee?.course_rating ?? par
  const course = index * (slope / 113) + (rating - par)
  return Math.round(course * 0.95)
}

// Shots received on a hole. Plus handicaps give shots back on the easiest holes.
export function shotsOnHole(playing: number, strokeIndex: number, holeCount = 18) {
  if (playing >= 0) return Math.floor(playing / holeCount) + (strokeIndex <= playing % holeCount ? 1 : 0)
  const back = -playing
  return -(Math.floor(back / holeCount) + (strokeIndex > holeCount - (back % holeCount) ? 1 : 0))
}

export const stablefordPoints = (strokes: number, par: number, shots: number) => Math.max(0, 2 + par + shots - strokes)

export async function fetchScores(roundId: string): Promise<Score[]> {
  const { data, error } = await supabase.from('scores').select('*').eq('round_id', roundId)
  if (error) throw error
  return data
}

export async function saveScores(rows: { round_id: string; user_id: string; hole: number; strokes: number }[]) {
  if (!rows.length) return
  const { error } = await supabase.from('scores').upsert(rows.map((r) => ({ ...r, updated_at: new Date().toISOString() })))
  if (error) throw error
}

// Live score changes for one round (Supabase Realtime). Returns an unsubscribe.
export function subscribeToScores(roundId: string, onChange: (s: Score) => void) {
  const channel = supabase
    .channel(`round-scores-${roundId}`)
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'scores', filter: `round_id=eq.${roundId}` },
      (payload) => payload.new && 'hole' in payload.new && onChange(payload.new as Score),
    )
    .subscribe()
  return () => {
    void supabase.removeChannel(channel)
  }
}
