import { supabase } from './supabase'
import type { Tables } from './database.types'

export type Course = Tables<'courses'>
export type CoursePin = Pick<Course, 'id' | 'name' | 'lat' | 'lon'>

const PAGE = 1000

// PostgREST caps responses at 1000 rows, so page through all ~3k courses.
export async function fetchCoursePins(): Promise<CoursePin[]> {
  const pins: CoursePin[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase
      .from('courses')
      .select('id, name, lat, lon')
      .order('id')
      .range(from, from + PAGE - 1)
    if (error) throw error
    pins.push(...data)
    if (data.length < PAGE) return pins
  }
}

export async function searchCourses(query: string): Promise<Course[]> {
  // Strip characters that have meaning in PostgREST's or() filter syntax.
  const q = query.replace(/[,()*%]/g, ' ').trim()
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .or(`name.ilike.*${q}*,town.ilike.*${q}*,postcode.ilike.${q}*`)
    .order('name')
    .limit(50)
  if (error) throw error
  return data
}

export async function coursesNear(lat: number, lon: number): Promise<Course[]> {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .gte('lat', lat - 0.4)
    .lte('lat', lat + 0.4)
    .gte('lon', lon - 0.6)
    .lte('lon', lon + 0.6)
  if (error) throw error
  return data
    .map((c) => ({ ...c, distanceKm: distanceKm(lat, lon, c.lat, c.lon) }))
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, 50)
}

export async function fetchCourse(id: string): Promise<Course | null> {
  const { data, error } = await supabase.from('courses').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data
}

export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const rad = Math.PI / 180
  const a =
    Math.sin(((lat2 - lat1) * rad) / 2) ** 2 +
    Math.cos(lat1 * rad) * Math.cos(lat2 * rad) * Math.sin(((lon2 - lon1) * rad) / 2) ** 2
  return 12742 * Math.asin(Math.sqrt(a))
}

// The club's own site is where its live tee sheet (usually BRS) lives.
export function teeTimesUrl(course: Course) {
  return course.booking_url ?? course.website
}

export function teeTimesSearchUrl(course: Course) {
  const q = `${course.name} ${course.town ?? ''} tee times`.replace(/\s+/g, ' ').trim()
  return `https://www.google.com/search?q=${encodeURIComponent(q)}`
}
