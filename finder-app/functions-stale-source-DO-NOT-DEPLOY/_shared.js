// Shared helpers for the scheduled notification functions in this folder.
// Not deployed as its own endpoint — just imported by the others.

import { createClient } from "@supabase/supabase-js";

// ─── Firebase Cloud Messaging (native app push) ──────────────────────────────
// Sends push to the NATIVE Android/iOS apps installed from the stores, which
// web-push cannot reach. Lazily initialised and fully optional: if the
// FIREBASE_SERVICE_ACCOUNT env var isn't set yet (i.e. you haven't created the
// Firebase project), every FCM call simply no-ops and returns, so the rest of
// the notification system keeps working unchanged. Once you paste the Firebase
// service-account JSON into that env var, native push activates automatically —
// no code change needed.
//
// REQUIRED env (only when you're ready to turn native push on):
//   FIREBASE_SERVICE_ACCOUNT — the full service-account JSON from Firebase
//     Console → Project Settings → Service accounts → "Generate new private
//     key". Paste the entire JSON file contents as the value of this one env
//     var (Netlify supports multi-line values).
let _fcmApp = null;
let _fcmTried = false;
async function getFcm() {
  if (_fcmTried) return _fcmApp;
  _fcmTried = true;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (!raw) { console.log("FCM: FIREBASE_SERVICE_ACCOUNT not set — native push disabled"); return null; }
  try {
    const admin = await import("firebase-admin");
    const creds = JSON.parse(raw);
    // Avoid re-initialising if a previous invocation already did (warm lambda).
    _fcmApp = admin.apps?.length ? admin.app() : admin.initializeApp({ credential: admin.credential.cert(creds) });
    return _fcmApp;
  } catch (e) {
    console.error("FCM init failed — check FIREBASE_SERVICE_ACCOUNT is valid JSON", e.message);
    return null;
  }
}

// Send a notification to a batch of native device tokens. Returns the list of
// tokens that are dead (unregistered / invalid) so the caller can delete them.
// No-ops to an empty result if Firebase isn't configured.
export async function sendNativePush(tokens, { title, body, url }) {
  const app = await getFcm();
  if (!app || !tokens?.length) return { sent: 0, dead: [] };
  const admin = await import("firebase-admin");
  const messaging = admin.messaging(app);
  let sent = 0; const dead = [];
  // FCM sendEachForMulticast handles up to 500 tokens per call.
  for (let i = 0; i < tokens.length; i += 500) {
    const batch = tokens.slice(i, i + 500);
    try {
      const res = await messaging.sendEachForMulticast({
        tokens: batch,
        notification: { title, body },
        data: url ? { url } : {},
        android: { priority: "high", notification: { sound: "default" } },
        apns: { payload: { aps: { sound: "default" } } },
      });
      res.responses.forEach((r, idx) => {
        if (r.success) sent++;
        else {
          const code = r.error?.code || "";
          if (code.includes("registration-token-not-registered") || code.includes("invalid-argument")) {
            dead.push(batch[idx]);
          }
        }
      });
    } catch (e) {
      console.error("FCM multicast failed", e.message);
    }
  }
  return { sent, dead };
}

// IMPORTANT: this uses the SERVICE ROLE key, not the anon key used by the
// client app. The service role key bypasses Row Level Security, which is
// correct here — these are trusted backend jobs, not user requests. Never
// expose this key to the browser/client bundle.
export function adminClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
  return createClient(url, key);
}

// List every kv row whose key starts with `prefix`.
export async function kvListByPrefix(sb, prefix) {
  const { data, error } = await sb.from("kv").select("key,value").like("key", `${prefix}%`);
  if (error) throw error;
  return data || [];
}

export async function kvGet(sb, key) {
  const { data, error } = await sb.from("kv").select("value").eq("key", key).maybeSingle();
  if (error) throw error;
  return data ? data.value : null;
}

export async function kvSet(sb, key, value) {
  const { error } = await sb.from("kv").upsert({ key, value, updated_at: new Date().toISOString() });
  if (error) throw error;
}

export async function kvDelete(sb, key) {
  const { error } = await sb.from("kv").delete().eq("key", key);
  if (error) throw error;
}

// Mirrors the client-side haversine() in src/App.jsx — keep in sync if that changes.
export function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Thin wrapper over Resend's HTTP API — no SDK dependency needed.
// Returns {ok, error}. Logs but does not throw, so one failed email in a
// batch doesn't crash the whole scheduled run.
export async function sendEmail({ to, subject, html }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATIONS_FROM_EMAIL || "IncludeMe <notifications@includeme.uk>";
  if (!key) {
    console.warn("RESEND_API_KEY not set — skipping email send to", to);
    return { ok: false, error: "RESEND_API_KEY not set" };
  }
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!r.ok) {
      const body = await r.text();
      console.error("Resend error", r.status, body);
      return { ok: false, error: `${r.status} ${body}` };
    }
    return { ok: true };
  } catch (e) {
    console.error("Resend fetch failed", e);
    return { ok: false, error: String(e) };
  }
}

// Shared activation logic — used by activate-tier.js (free/manual instant
// activation) and stripe-webhook.js (real paid activation after Stripe
// confirms payment). Keeping this in one place means both paths always
// activate listings identically.
export async function activateListingTier(sb, actId, tier, extra = {}) {
  const { data: row, error: getErr } = await sb.from("kv").select("value").eq("key", `activity:${actId}`).maybeSingle();
  if (getErr) throw getErr;
  if (!row || !row.value) throw new Error(`listing ${actId} not found`);
  const act = row.value;
  const updated = tier === "featured"
    ? { ...act, featured: true, verifiedPaid: true, verified: true, ...extra }
    : { ...act, verifiedPaid: true, verified: true, ...extra };
  const { error: setErr } = await sb.from("kv").upsert({ key: `activity:${actId}`, value: updated, updated_at: new Date().toISOString() });
  if (setErr) throw setErr;
  return updated;
}

// Downgrade a listing when a Stripe subscription is cancelled or payment
// fails permanently. Only clears the flag for the tier that lapsed — if
// someone had Featured and it's cancelled, they also lose Verified (Featured
// includes Verified), but if they separately still hold a valid Verified
// subscription this would incorrectly clear it too — Stripe webhook handler
// is responsible for checking that before calling this.
export async function deactivateListingTier(sb, actId, tier) {
  const { data: row, error: getErr } = await sb.from("kv").select("value").eq("key", `activity:${actId}`).maybeSingle();
  if (getErr) throw getErr;
  if (!row || !row.value) return null;
  const act = row.value;
  const updated = tier === "featured"
    ? { ...act, featured: false }
    : { ...act, featured: false, verifiedPaid: false, verified: false };
  const { error: setErr } = await sb.from("kv").upsert({ key: `activity:${actId}`, value: updated, updated_at: new Date().toISOString() });
  if (setErr) throw setErr;
  return updated;
}

// Activities added/claimed by users live as `activity:*` rows (the static
// SEED list bundled into the app almost never counts as "new"). Returns
// only those created after `sinceIso`.
export function activitiesSince(activityRows, sinceIso) {
  const since = sinceIso ? new Date(sinceIso).getTime() : 0;
  return activityRows
    .map(r => r.value)
    .filter(a => a && a.createdAt && new Date(a.createdAt).getTime() > since);
}

// The dedicated "notify me about this" feed (Option A). When new listings are
// published — whether added to the bundled SEED catalogue in a release, or
// created live in the app — a `new-listing:<id>` row is written here with an
// `addedAt` timestamp. The notification jobs (weekly email, web push, native
// push) read ONLY from this feed, never from the full SEED catalogue. That's
// what guarantees the ~500-strong back-catalogue can never trigger a blast:
// nothing notifies unless it was explicitly pushed to this feed, and each
// subscriber only ever sees feed entries newer than when they subscribed.
export async function newListingsSince(sb, sinceIso) {
  const rows = await kvListByPrefix(sb, "new-listing:");
  const since = sinceIso ? new Date(sinceIso).getTime() : 0;
  return rows
    .map(r => r.value)
    .filter(a => a && a.addedAt && new Date(a.addedAt).getTime() > since)
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
}

// The new-events feed: when a provider adds a dated session/event to a listing
// (a holiday club, a one-off class), a `new-event:<id>` row is written here.
// Same safety model as new-listings — nothing notifies unless explicitly
// published, and only events newer than a subscriber's last-notified time fire.
export async function newEventsSince(sb, sinceIso) {
  const rows = await kvListByPrefix(sb, "new-event:");
  const since = sinceIso ? new Date(sinceIso).getTime() : 0;
  return rows
    .map(r => r.value)
    .filter(e => e && e.addedAt && new Date(e.addedAt).getTime() > since)
    .sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
}
