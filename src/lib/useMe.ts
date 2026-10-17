import { useAuth } from './auth'
import { fetchBuddyIds, fetchProfile } from './profiles'
import { useAsync } from './useAsync'
import type { MatchProfile } from './match'

export function useUserId() {
  const { session } = useAuth()
  return session!.user.id
}

// The signed-in golfer's profile plus what the match score needs.
export function useMe() {
  const id = useUserId()
  const state = useAsync(async () => {
    const [profile, buddyIds] = await Promise.all([fetchProfile(id), fetchBuddyIds(id)])
    const match: MatchProfile = {
      handicap: profile?.handicap ?? null,
      playStyle: profile?.play_style ?? [],
      home: profile?.home_club ? { lat: profile.home_club.lat, lon: profile.home_club.lon } : null,
      buddyIds,
    }
    return { profile, match }
  }, [id])
  return { id, ...state }
}
