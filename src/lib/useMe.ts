import { useAuth } from './auth'
import { fetchMyAvailability } from './availability'
import { fetchBuddyIds, fetchProfile } from './profiles'
import { useAsync } from './useAsync'
import { DEFAULT_RADIUS_MILES, type MatchProfile } from './match'

export function useUserId() {
  const { session } = useAuth()
  return session!.user.id
}

// The signed-in golfer's profile plus what the match score needs.
export function useMe() {
  const id = useUserId()
  const state = useAsync(async () => {
    const [profile, buddyIds, free] = await Promise.all([fetchProfile(id), fetchBuddyIds(id), fetchMyAvailability(id)])
    const match: MatchProfile = {
      handicap: profile?.handicap ?? null,
      playStyle: profile?.play_style ?? [],
      home: profile?.home_club ? { lat: profile.home_club.lat, lon: profile.home_club.lon } : null,
      buddyIds,
      free,
      radius: profile?.search_radius_miles ?? DEFAULT_RADIUS_MILES,
    }
    return { profile, match }
  }, [id])
  return { id, ...state }
}
