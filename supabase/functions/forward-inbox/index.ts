// Forwards every email that arrives in the hello@buddygolf.uk inbox to Paul's
// Yahoo address. Called by a Resend webhook (inbox.email.received). The webhook
// only says an email arrived; the message itself is fetched and forwarded by
// Resend using the RESEND_API_KEY secret, so a made-up call forwards nothing.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

const FORWARD_TO = 'paul_whitehouse1@yahoo.co.uk'
const API = 'https://api.resend.com'

interface Event {
  type?: string
  data?: {
    email_id?: string
    inbox_id?: string
    thread_id?: string
    email?: { direction?: string; from?: string; subject?: string }
  }
}

Deno.serve(async (req) => {
  const key = Deno.env.get('RESEND_API_KEY')
  if (!key) return Response.json({ error: 'RESEND_API_KEY is not set' }, { status: 500 })

  const ev = (await req.json().catch(() => ({}))) as Event
  const d = ev.data
  if (ev.type !== 'inbox.email.received' || !d?.email_id || !d.inbox_id || !d.thread_id) {
    return Response.json({ skipped: 'not an inbox email' })
  }
  if (d.email?.direction && d.email.direction !== 'inbound') return Response.json({ skipped: 'not inbound' })

  const res = await fetch(`${API}/inboxes/${d.inbox_id}/threads/${d.thread_id}/emails/${d.email_id}/forward`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ to: [FORWARD_TO] }),
  })
  const out = await res.text()
  console.log('FORWARD', res.status, out.slice(0, 500))
  // A non-2xx makes Resend retry the webhook, so a failed forward is tried again.
  return new Response(out, { status: res.ok ? 200 : 502 })
})
