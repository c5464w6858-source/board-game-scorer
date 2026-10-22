// Sends one outreach email from the BuddyGolf address with a PDF attached.
// Called by hand from the database (pg_net), which proves itself with the same
// shared secret as send-push. The Resend key is the RESEND_API_KEY secret.
import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

interface Payload {
  to: string
  subject: string
  text: string
  html: string
  pdf_url: string
  filename: string
  reply_to?: string
  bcc?: string
}

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

Deno.serve(async (req) => {
  const { data: config } = await db.rpc('push_config')
  if (!config || req.headers.get('x-push-secret') !== (config as Record<string, string>).push_secret) {
    return Response.json({ error: 'Not allowed' }, { status: 401 })
  }
  const key = Deno.env.get('RESEND_API_KEY')
  if (!key) return Response.json({ error: 'RESEND_API_KEY is not set' }, { status: 500 })

  const m = (await req.json()) as Payload
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'BuddyGolf <hello@buddygolf.uk>',
      to: [m.to],
      bcc: m.bcc ? [m.bcc] : undefined,
      reply_to: m.reply_to ?? 'hello@buddygolf.uk',
      subject: m.subject,
      text: m.text,
      html: m.html,
      attachments: [{ filename: m.filename, path: m.pdf_url }],
    }),
  })
  return Response.json(await res.json().catch(() => ({})), { status: res.status })
})
