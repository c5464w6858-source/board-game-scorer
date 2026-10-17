import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/auth'

export function Home() {
  const { session } = useAuth()
  return (
    <div>
      <h1 className="text-3xl font-bold">BuddyGolf</h1>
      <p className="mt-2">Signed in as {session?.user.email}</p>
      <button className="mt-4 rounded border border-green-700 px-3 py-1" onClick={() => supabase.auth.signOut()}>
        Sign out
      </button>
    </div>
  )
}
