import { matchScore, roundDistanceMiles } from '../../lib/match'
import { fetchMyPlan } from '../../lib/plus'
import { fetchMyRounds, fetchUpcomingRounds, fitsPreferences, isMyRound, isOpenTo, pendingRequests } from '../../lib/rounds'
import { useAsync } from '../../lib/useAsync'
import { useMe } from '../../lib/useMe'
import { fetchForecast } from '../../lib/weather'

// Everything the Home screen shows, shared by each Home layout.
export function useHomeData() {
  const me = useMe()
  const rounds = useAsync(async () => {
    // Rounds you're hosting or playing in, plus ones you've asked to join, soonest first.
    const [all, mine] = await Promise.all([fetchUpcomingRounds(), fetchMyRounds(me.id)])
    const next = mine.find((r) => isMyRound(r, me.id)) ?? null
    const forecast = next?.course ? await fetchForecast(next.course.lat, next.course.lon, next.tee_time) : null
    return { all, mine, next, forecast }
  }, [me.id])

  // Only used for the Plus card, so a failure here leaves Home as it was.
  const plan = useAsync(() => fetchMyPlan(me.id).catch(() => null), [me.id])

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
    me: me.id,
    name: me.data?.profile?.display_name ?? null,
    mine: rounds.data?.mine ?? [],
    next: rounds.data?.next ?? null,
    forecast: rounds.data?.forecast ?? null,
    openCount: open.length,
    plan: plan.data ?? null,
    picks,
    urgent,
    waiting,
  }
}

export type HomeData = ReturnType<typeof useHomeData>
