import { supabase } from './supabase'

export const PLUS_PRICES = { monthly: '£3.99', yearly: '£29.99' }
export const TRIAL_DAYS = 14

export interface Plan {
  // Plus is on right now (trial or paid).
  active: boolean
  trial: boolean
  // When the trial or paid period ends.
  endsAt: string | null
  // Already used the one free trial.
  trialUsed: boolean
}

export async function fetchMyPlan(userId: string): Promise<Plan> {
  const { data, error } = await supabase.from('subscriptions').select('*').eq('user_id', userId).maybeSingle()
  if (error) throw error
  if (!data) return { active: false, trial: false, endsAt: null, trialUsed: false }
  const trial = data.status === 'trialing'
  const endsAt = trial ? data.trial_ends_at : data.current_period_end
  const running = endsAt == null ? data.status !== 'canceled' : new Date(endsAt).getTime() > Date.now()
  return { active: running && data.status !== 'canceled', trial, endsAt, trialUsed: true }
}

export async function startPlusTrial() {
  const { error } = await supabase.rpc('start_plus_trial')
  if (error) throw error
}

export const daysLeft = (iso: string | null) => (iso ? Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)) : 0)
