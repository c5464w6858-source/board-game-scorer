// Sends a Web Push notification to every device of the given golfers.
// Called only by the database (private.push), which proves itself with the
// shared secret from the vault. Devices that have gone away are removed.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'
import webpush from 'npm:web-push@3.6.7'

interface Payload {
  user_ids: string[]
  title: string
  body: string
  url: string
  tag?: string | null
}

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
let config: Record<string, string> | null = null

Deno.serve(async (req) => {
  if (!config) {
    // Read the keys once per instance, with one retry for a cold start.
    let { data, error } = await db.rpc('push_config')
    if (error || !data) ({ data, error } = await db.rpc('push_config'))
    if (error || !data) {
      console.error('push_config failed', error?.message)
      return Response.json({ error: 'Push is not set up' }, { status: 500 })
    }
    config = data as Record<string, string>
    webpush.setVapidDetails('https://buddygolf.netlify.app', config.vapid_public_key, config.vapid_private_key)
  }
  if (req.headers.get('x-push-secret') !== config.push_secret) {
    return Response.json({ error: 'Not allowed' }, { status: 401 })
  }

  const msg = (await req.json()) as Payload
  if (!Array.isArray(msg.user_ids) || msg.user_ids.length === 0) return Response.json({ sent: 0 })

  const { data: subs, error } = await db
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .in('user_id', msg.user_ids.slice(0, 500))
  if (error) return Response.json({ error: error.message }, { status: 500 })

  const payload = JSON.stringify({ title: msg.title, body: msg.body, url: msg.url, tag: msg.tag ?? undefined })
  const gone: string[] = []
  let sent = 0
  await Promise.all(
    (subs ?? []).map(async (s) => {
      try {
        await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } }, payload, {
          TTL: 60 * 60 * 12,
          urgency: 'high',
        })
        sent++
      } catch (e) {
        const status = (e as { statusCode?: number }).statusCode
        if (status === 404 || status === 410) gone.push(s.id)
        else console.error('push failed', status, (e as Error).message)
      }
    }),
  )
  if (gone.length) await db.from('push_subscriptions').delete().in('id', gone)
  return Response.json({ sent, removed: gone.length })
})
