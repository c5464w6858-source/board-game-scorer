// Seeds demo data with exactly two golfers: Paul (the signed-in user) and Steve.
// Safe to re-run: it reuses the two accounts and rebuilds their rounds.
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... SEED_PASSWORD=... npm run seed
//
// The service-role key bypasses row-level security. Keep it out of the repo and
// out of client code.
import { readFile } from 'node:fs/promises'
import { createClient } from '@supabase/supabase-js'

const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const key = process.env.SUPABASE_SERVICE_ROLE_KEY
const password = process.env.SEED_PASSWORD
if (!url || !key || !password) {
  console.error('Set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and SEED_PASSWORD (min 6 characters).')
  process.exit(1)
}

const db = createClient(url, key, { auth: { persistSession: false } })
const ok = ({ data, error }) => {
  if (error) throw error
  return data
}

async function ensureUser(email) {
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true })
  if (!error) return data.user.id
  const list = ok(await db.auth.admin.listUsers({ perPage: 1000 }))
  const found = list.users.find((u) => u.email === email)
  if (!found) throw error
  await db.auth.admin.updateUserById(found.id, { password })
  return found.id
}

// UK wall-clock time `daysAhead` days from now, as a UTC ISO string.
function londonTime(daysAhead, hhmm) {
  const day = new Date(Date.now() + daysAhead * 864e5).toISOString().slice(0, 10)
  const asUtc = Date.parse(`${day}T${hhmm}:00Z`)
  const shown = Date.parse(
    new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/London', dateStyle: 'short', timeStyle: 'medium' })
      .format(new Date(asUtc))
      .replace(' ', 'T') + 'Z',
  )
  return new Date(asUtc - (shown - asUtc)).toISOString()
}

async function uploadAvatar(userId, file) {
  const path = `${userId}/seed-${file}`
  const body = await readFile(new URL(`../design/mockup/assets/${file}`, import.meta.url))
  ok(await db.storage.from('avatars').upload(path, body, { upsert: true, contentType: 'image/jpeg' }))
  return db.storage.from('avatars').getPublicUrl(path).data.publicUrl
}

console.log(`Seeding ${url}`)
const paul = await ensureUser('paul@buddygolf.test')
const steve = await ensureUser('steve@buddygolf.test')

const club = ok(await db.from('courses').select('id, name, town').ilike('name', 'Canons Brook%').limit(1))[0]
if (!club) console.warn('Canons Brook not found in courses: rounds will have no course link.')

ok(
  await db.from('profiles').upsert([
    {
      id: paul,
      display_name: 'Paul W.',
      handicap: 9.8,
      home_area: 'Harlow',
      home_club_id: club?.id ?? null,
      play_style: ['early_tee_times', 'walking', 'small_stakes', 'stays_for_one'],
      bag: { driver: 'Titleist 917D', irons: 'Titleist 716', putter: 'Odyssey', ball: 'Seed' },
      avatar_url: await uploadAvatar(paul, 'paul.jpg'),
    },
    {
      id: steve,
      display_name: 'Steve B.',
      handicap: 16.4,
      home_area: 'Harlow',
      home_club_id: club?.id ?? null,
      play_style: ['walking'],
      avatar_url: await uploadAvatar(steve, 'steve.jpg'),
    },
  ]),
)

ok(await db.from('rounds').delete().in('host_id', [paul, steve]))
await db.from('connections').delete().in('requester_id', [paul, steve])
ok(await db.from('connections').insert({ requester_id: steve, addressee_id: paul, status: 'accepted' }))

const base = {
  course_id: club?.id ?? null,
  course_name: club?.name ?? 'Canons Brook GC',
  location: club?.town ?? 'Harlow',
  max_players: 4,
  format: 'stableford',
}

const [sunday, midweek, saturday] = ok(
  await db
    .from('rounds')
    .insert([
      { ...base, host_id: steve, title: 'Sunday Stableford', tee_time: londonTime(7, '07:30'), holes: 18, walking: true, pace_note: 'Under 4 hrs', green_fee_pence: 3800, min_handicap: 8, max_handicap: 20 },
      { ...base, host_id: steve, title: 'Midweek nine', tee_time: londonTime(4, '17:40'), holes: 9, walking: true, pace_note: 'Quick pace', green_fee_pence: 2200, max_players: 3 },
      { ...base, host_id: paul, title: 'Saturday Stroke', format: 'stroke', tee_time: londonTime(2, '09:10'), holes: 18, green_fee_pence: 4200 },
    ])
    .select('id'),
)

// Paul is in Steve's Sunday round; Steve is asking to join Paul's Saturday one.
ok(await db.from('round_requests').insert([
  { round_id: sunday.id, user_id: paul, status: 'accepted' },
  { round_id: saturday.id, user_id: steve, status: 'pending', message: 'Any room for one more?' },
]))
ok(await db.from('round_messages').insert([
  { round_id: sunday.id, user_id: steve, body: "Bacon roll at 7 in the clubhouse, first one's on me" },
  { round_id: sunday.id, user_id: steve, body: 'Everyone pays the pro shop on the day' },
]))

console.log(`Done. Sign in as paul@buddygolf.test (or steve@buddygolf.test) with SEED_PASSWORD.`)
console.log(`Open to request: ${midweek.id}`)
