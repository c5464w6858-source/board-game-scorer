import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types'

export const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

if (!supabaseUrl || !key) {
  throw new Error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY — copy .env.example to .env',
  )
}

export const supabaseKey: string = key
export const supabase = createClient<Database>(supabaseUrl, key)
