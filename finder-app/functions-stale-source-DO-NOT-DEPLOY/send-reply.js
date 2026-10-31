// When a provider replies to a family's enquiry from within the app, this
// delivers that reply to the family: saves it to the family's in-app inbox,
// emails them, and fires a push (web + native) "you've had a response."
//
// This is the lightweight reply path (not a full live-chat inbox): one reply
// per step, but it closes the loop so families get pulled back to the app.
//
// REQUIRED env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY,
//               RESEND_API_KEY (email), VAPID_* (web push), FIREBASE_* (native)

import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";
import { adminClient, sendEmail, sendNativePush, kvListByPrefix } from "./_shared.js";

export async function handler(event) {
  const json = (c, b) => ({ statusCode: c, headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });

  let p;
  try { p = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "invalid body" }); }
  const { enquiryId, toUserId, toEmail, actName, replyText } = p;
  if (!toUserId && !toEmail) return json(400, { error: "recipient required" });
  if (!replyText) return json(400, { error: "replyText required" });

  // Verify the replier is signed in (the provider).
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "missing auth token" });
  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !userData?.user) return json(401, { error: "invalid session" });
  const provider = userData.user;

  const sb = adminClient();
  const safe = s => String(s || "").replace(/[<>]/g, "");

  // 1. Save to the family's in-app inbox (so they see it in the app).
  if (toUserId) {
    try {
      const key = `replies:${toUserId}`;
      const { data: existing } = await sb.from("kv").select("value").eq("key", key).maybeSingle();
      const list = existing?.value ? existing.value : [];
      list.push({
        id: `rep-${Date.now()}`, enquiryId, actName,
        fromName: provider.user_metadata?.orgName || provider.user_metadata?.name || "The provider",
        text: replyText, sentAt: new Date().toISOString(), read: false,
      });
      await sb.from("kv").upsert({ key, value: list }, { onConflict: "key" });
    } catch (e) { console.error("save reply to inbox failed", e.message); }
  }

  // 2. Email the family.
  let emailed = false;
  if (toEmail) {
    const html = `
      <div style="font-family:-apple-system,Segoe UI,Roboto,sans-serif;max-width:560px;margin:0 auto;color:#1A1712;">
        <p style="font-size:13px;color:#7A7468;margin:0 0 16px;">You've had a reply to your enquiry about <strong>${safe(actName)}</strong> on IncludeMe:</p>
        <div style="background:#F7F6F2;border-left:3px solid #0F6B5C;border-radius:8px;padding:14px 16px;margin-bottom:16px;">
          <p style="margin:0;white-space:pre-wrap;font-size:15px;line-height:1.6;">${safe(replyText)}</p>
        </div>
        <p style="font-size:13px;color:#514B40;">Open IncludeMe to see your messages, or reply directly to this email.</p>
      </div>`;
    const r = await sendEmail({ to: toEmail, subject: `Reply to your enquiry — ${actName || "IncludeMe"}`, html });
    emailed = r.ok;
  }

  // 3. Push (web + native) to the family if they're a subscriber.
  try {
    const vapidPublic = process.env.VAPID_PUBLIC_KEY, vapidPrivate = process.env.VAPID_PRIVATE_KEY;
    if (vapidPublic && vapidPrivate && toUserId) {
      webpush.setVapidDetails(process.env.VAPID_SUBJECT || "mailto:hello@includeme.uk", vapidPublic, vapidPrivate);
      const subs = await kvListByPrefix(sb, "notif_sub:");
      for (const row of subs) {
        if (row.value?.userId !== toUserId) continue;
        const ps = row.value.pushSubscription;
        if (ps?.endpoint) {
          try { await webpush.sendNotification({ endpoint: ps.endpoint, keys: ps.keys },
            JSON.stringify({ title: "You've had a reply", body: `${actName || "A provider"} responded to your enquiry`, url: "/" })); } catch {}
        }
      }
    }
    if (toUserId) {
      const tokenRows = await kvListByPrefix(sb, "fcm_token:");
      const tokens = tokenRows.filter(r => r.value?.userId === toUserId).map(r => r.value.token);
      if (tokens.length) await sendNativePush(tokens, { title: "You've had a reply", body: `${actName || "A provider"} responded to your enquiry`, url: "/" });
    }
  } catch (e) { console.error("reply push failed", e.message); }

  return json(200, { ok: true, emailed });
}
