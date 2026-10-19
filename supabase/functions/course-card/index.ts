// Fetches a course's scorecard (tees, par, stroke index, yards) from the UK
// Golf Course API on RapidAPI and caches it in course_tees / course_holes.
// Called by the app the first time a course's card is needed. The free plan
// allows only a few requests a minute, so each course is looked up at most
// once a week and the key stays server-side.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const HOST = 'uk-golf-course-data-api.p.rapidapi.com'
const RETRY_AFTER_DAYS = 7
const MAX_MATCH_KM = 3

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}
const reply = (body: unknown, status = 200) => Response.json(body, { status, headers: cors })

interface ApiClub { id: string; name: string; latitude: number | null; longitude: number | null }
interface ApiTee {
  id: string; name: string; colour: string | null; gender: string | null
  total_yardage: number | null; par: number; course_rating: number | null; slope_rating: number | null
}
interface ApiCourse { id: string; name: string; holes: number | null; par: number | null; tee_sets: ApiTee[] }
interface ApiHole { hole_number: number; par: number; stroke_index: number; yardage: number | null }

class RateLimited extends Error {}

async function api<T>(path: string): Promise<T | null> {
  const res = await fetch(`https://${HOST}${path}`, {
    headers: { 'x-rapidapi-key': Deno.env.get('GOLF_API_KEY')!, 'x-rapidapi-host': HOST },
  })
  if (res.status === 429) throw new RateLimited()
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`Golf API ${res.status}: ${(await res.text()).slice(0, 200)}`)
  return (await res.json()) as T
}

function km(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = (d: number) => (d * Math.PI) / 180
  const a = Math.sin(rad(lat2 - lat1) / 2) ** 2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(rad(lon2 - lon1) / 2) ** 2
  return 6371 * 2 * Math.asin(Math.sqrt(a))
}

// "Canons Brook Golf Course" -> "canons brook", which also matches "Canons Brook Golf Club".
const searchName = (name: string) =>
  name.toLowerCase().replace(/\b(golf|course|club|links|the|and|ltd|limited)\b|&|[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

function nearest(clubs: ApiClub[], lat: number, lon: number) {
  let best: ApiClub | null = null
  let bestKm = MAX_MATCH_KM
  for (const c of clubs) {
    if (c.latitude == null || c.longitude == null) continue
    const d = km(lat, lon, c.latitude, c.longitude)
    if (d <= bestKm) [best, bestKm] = [c, d]
  }
  return best
}

async function findClub(course: { name: string; lat: number; lon: number; postcode: string | null }) {
  const byName = await api<{ clubs: ApiClub[] }>(`/clubs?search=${encodeURIComponent(searchName(course.name))}&per_page=20`)
  const match = nearest(byName?.clubs ?? [], course.lat, course.lon)
  if (match || !course.postcode) return match
  const outward = course.postcode.trim().split(/\s+/)[0]
  const byPostcode = await api<{ clubs: ApiClub[] }>(`/clubs?postcode=${encodeURIComponent(outward)}&per_page=50`)
  return nearest(byPostcode?.clubs ?? [], course.lat, course.lon)
}

// Clubs can have several courses (e.g. an 18 and a 9). Prefer the one whose
// hole count matches OpenStreetMap, then the longest.
function pickCourse(courses: ApiCourse[], holes: number | null) {
  const withTees = courses.filter((c) => c.tee_sets?.length)
  const sameHoles = withTees.filter((c) => holes != null && c.holes === holes)
  const pool = sameHoles.length ? sameHoles : withTees
  return pool.sort((a, b) => (b.holes ?? 0) - (a.holes ?? 0))[0] ?? null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })
  const { course_id } = await req.json().catch(() => ({}))
  if (typeof course_id !== 'string') return reply({ error: 'course_id is required' }, 400)

  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { data: course } = await db
    .from('courses')
    .select('id, name, lat, lon, postcode, holes, card_checked_at')
    .eq('id', course_id)
    .maybeSingle()
  if (!course) return reply({ error: 'Course not found' }, 404)

  const { count } = await db.from('course_tees').select('id', { count: 'exact', head: true }).eq('course_id', course_id)
  if (count) return reply({ status: 'ready' })
  const retryAfter = Date.now() - RETRY_AFTER_DAYS * 24 * 60 * 60 * 1000
  if (course.card_checked_at && new Date(course.card_checked_at).getTime() > retryAfter) return reply({ status: 'none' })

  // Claim the lookup first so parallel calls don't each spend API requests.
  await db.from('courses').update({ card_checked_at: new Date().toISOString() }).eq('id', course_id)

  try {
    const club = await findClub(course)
    if (!club) return reply({ status: 'none' })
    const detail = await api<{ courses: ApiCourse[] }>(`/clubs/${club.id}`)
    const picked = pickCourse(detail?.courses ?? [], course.holes)
    if (!picked) return reply({ status: 'none' })
    const card = await api<{ tee_set: { id: string } | null; holes: ApiHole[] }>(`/courses/${picked.id}/scorecard`)
    const holes = (card?.holes ?? []).filter((h) => h.hole_number >= 1 && h.hole_number <= 18 && h.par && h.stroke_index)
    if (!holes.length) return reply({ status: 'none' })

    const defaultTee = card?.tee_set?.id ?? picked.tee_sets[0].id
    const tees = [...picked.tee_sets]
      .sort((a, b) => (b.total_yardage ?? 0) - (a.total_yardage ?? 0))
      .map((t, i) => ({
        id: t.id,
        course_id,
        name: t.name,
        colour: t.colour,
        gender: t.gender,
        par: t.par,
        yards: t.total_yardage,
        course_rating: t.course_rating,
        slope: t.slope_rating,
        is_default: t.id === defaultTee,
        sort: i,
      }))
    const { error: teeError } = await db.from('course_tees').upsert(tees)
    if (teeError) throw teeError
    const { error: holeError } = await db.from('course_holes').upsert(
      holes.map((h) => ({ course_id, hole: h.hole_number, par: h.par, stroke_index: h.stroke_index, yards: h.yardage })),
    )
    if (holeError) throw holeError
    await db.from('courses').update({ golfapi_club_id: club.id, holes: course.holes ?? picked.holes }).eq('id', course_id)
    return reply({ status: 'ready' })
  } catch (e) {
    // Give the next caller a go straight away if we were only rate limited or hit an error.
    await db.from('courses').update({ card_checked_at: null }).eq('id', course_id)
    if (e instanceof RateLimited) return reply({ status: 'busy' })
    return reply({ error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
