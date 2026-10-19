import { matchScore, roundDistanceMiles } from '../../lib/match'
import { fetchUpcomingRounds, fitsPreferences, isMyRound, isOpenTo, pendingRequests } from '../../lib/rounds'
import { useAsync } from '../../lib/useAsync'
import { useMe } from '../../lib/useMe'
import { fetchForecast } from '../../lib/weather'

// Everything the Home screen shows, shared by each Home layout.
export function useHomeData() {
  const me = useMe()
  const rounds = useAsync(async () => {
    const all = await fetchUpcomingRounds()
    const next = all.find((r) => isMyRound(r, me.id)) ?? null
    const forecast = next?.course ? await fetchForecast(next.course.lat, next.course.lon, next.tee_time) : null
    return { all, next, forecast }
  }, [me.id])

  const loading = me.loading || rounds.loading
  const error = me.error ?? rounds.error ?? (!loading && (!rounds.data || !me.data) ? 'Something went wrong' : null)
  const all = rounds.data?.all ?? []
  const open = all.filter((r) => isOpenTo(r, me.id) && fitsPreferences(r, me.data?.profile))
  const matchProfile = me.data?.match
  const picks = matchProfile
    ? open
        .map((r) => ({ round: r, match: matchScore(r, matchProfile), miles: roundDistanceMiles(r, matchProfile) }))
        .sort((a, b) => b.match.percent - a.match.percent)
        .slice(0, 6)
    : []
  // Urgent rounds you could fill and would travel to, soonest first.
  const urgent = matchProfile
    ? open.filter((r) => {
        const d = roundDistanceMiles(r, matchProfile)
        return r.urgent && (d == null || d <= matchProfile.radius)
      })
    : []
  const waiting = all
    .filter((r) => r.host_id === me.id)
    .flatMap((r) => pendingRequests(r).map((q) => ({ round: r, request: q })))

  return {
    reload: rounds.reload,
    loading,
    error,
    name: me.data?.profile?.display_name ?? null,
    next: rounds.data?.next ?? null,
    forecast: rounds.data?.forecast ?? null,
    openCount: open.length,
    picks,
    urgent,
    waiting,
  }
}

export type HomeData = ReturnType<typeof useHomeData>
