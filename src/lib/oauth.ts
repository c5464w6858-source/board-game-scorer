import { supabase, supabaseKey, supabaseUrl } from './supabase'

export type OAuthProvider = 'google' | 'apple'

const names: Record<OAuthProvider, string> = { google: 'Google', apple: 'Apple' }

// Supabase sends a disabled provider to a raw JSON error page, so check the
// project's public auth settings first and explain instead.
async function isEnabled(provider: OAuthProvider) {
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, { headers: { apikey: supabaseKey } })
    if (!res.ok) return true
    const { external } = await res.json()
    return Boolean(external?.[provider])
  } catch {
    return true
  }
}

// Redirects away to the provider; only returns if something went wrong.
export async function signInWith(provider: OAuthProvider): Promise<string> {
  if (!(await isEnabled(provider))) return `${names[provider]} sign-in isn't switched on yet. Use email for now.`
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: { redirectTo: window.location.origin },
  })
  return error?.message ?? ''
}
