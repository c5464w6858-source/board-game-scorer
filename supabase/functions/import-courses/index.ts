// Imports every named UK golf course from OpenStreetMap into public.courses.
// Safe to re-run: rows are upserted by OSM id. Runs at most once a day,
// since anyone holding the public anon key can call it.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

// Public Overpass servers, tried in order until one answers.
const OVERPASS_URLS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]
const QUERY = `
[out:json][timeout:180];
area["ISO3166-1"="GB"][admin_level=2]->.uk;
nwr["leisure"="golf_course"]["name"](area.uk);
out center tags;
`

interface OsmElement {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat: number; lon: number }
  tags: Record<string, string>
}

function toCourse(el: OsmElement) {
  const t = el.tags
  const lat = el.lat ?? el.center?.lat
  const lon = el.lon ?? el.center?.lon
  if (lat == null || lon == null) return null
  const holes = parseInt(t['golf:holes'] ?? t.holes ?? '', 10)
  return {
    id: `${el.type}/${el.id}`,
    name: t.name,
    lat,
    lon,
    town: t['addr:city'] ?? t['addr:town'] ?? t['addr:village'] ?? null,
    postcode: t['addr:postcode'] ?? null,
    website: t.website ?? t['contact:website'] ?? t.url ?? null,
    phone: t.phone ?? t['contact:phone'] ?? null,
    holes: Number.isFinite(holes) && holes > 0 && holes < 100 ? holes : null,
    booking_url: t['reservation:website'] ?? null,
    updated_at: new Date().toISOString(),
  }
}

async function fetchElements(): Promise<OsmElement[]> {
  const failures: string[] = []
  for (const url of OVERPASS_URLS) {
    try {
      const res = await fetch(`${url}?data=${encodeURIComponent(QUERY)}`, {
        headers: {
          Accept: '*/*',
          'User-Agent': 'BuddyGolf/1.0 (+https://buddygolf.netlify.app)',
        },
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`)
      return ((await res.json()) as { elements: OsmElement[] }).elements
    } catch (e) {
      failures.push(`${new URL(url).host}: ${e instanceof Error ? e.message : e}`)
    }
  }
  throw new Error(`All Overpass servers failed (${failures.join('; ')})`)
}

Deno.serve(async () => {
  const db = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Block if a run succeeded in the last day or one is still in progress. A
  // run killed mid-import never finishes, so only count recent unfinished ones.
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString()
  const { count } = await db
    .from('course_imports')
    .select('id', { count: 'exact', head: true })
    .or(
      `and(started_at.gte.${dayAgo},course_count.not.is.null),` +
        `and(started_at.gte.${tenMinutesAgo},finished_at.is.null)`,
    )
  if (count) {
    return Response.json({ skipped: 'Already imported in the last 24 hours' }, { status: 429 })
  }

  const { data: run } = await db.from('course_imports').insert({}).select('id').single()

  try {
    const elements = await fetchElements()

    const courses = elements.map(toCourse).filter((c) => c !== null)
    for (let i = 0; i < courses.length; i += 500) {
      const { error } = await db.from('courses').upsert(courses.slice(i, i + 500))
      if (error) throw error
    }

    await db
      .from('course_imports')
      .update({ finished_at: new Date().toISOString(), course_count: courses.length })
      .eq('id', run!.id)
    return Response.json({ imported: courses.length })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    await db
      .from('course_imports')
      .update({ finished_at: new Date().toISOString(), error: message })
      .eq('id', run!.id)
    return Response.json({ error: message }, { status: 500 })
  }
})
