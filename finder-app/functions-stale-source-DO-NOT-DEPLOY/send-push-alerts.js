// Scheduled function: checks for new listings near each subscriber and sends
// a real web push notification. Runs every 6 hours (see schedule below).
//
// REQUIRED environment variables (set in Netlify → Site settings → Environment):
//   SUPABASE_URL                 — same project URL the app uses
//   SUPABASE_SERVICE_ROLE_KEY    — Project Settings → API → service_role key
//                                  (NOT the anon key — this one bypasses RLS,
//                                  which is correct for a trusted backend job,
//                                  but never expose it to the client app)
//   VAPID_PUBLIC_KEY             — already generated for you, see README
//   VAPID_PRIVATE_KEY            — already generated for you, see README
//   VAPID_SUBJECT                — mailto:hello@includeme.uk (a contact
//                                  address, required by the push spec)
//
// This only fires for subscribers whose saved preferences include
// `newActivities: true` (the default). Holiday-club / event / availability
// triggers from NotifSubModal are stored but not yet wired to a specific
// "new content" check — flagged here rather than silently ignored, since
// those would need their own definition of "new" (e.g. a holiday-dates
// field) before they can trigger anything meaningfully.

import webpush from "web-push";
import { adminClient, kvListByPrefix, kvSet, kvDelete, haversineKm, newListingsSince, newEventsSince, sendNativePush } from "./_shared.js";

export const config = { schedule: "0 */6 * * *" }; // every 6 hours, UTC

export async function handler() {
  const vapidPublic = process.env.VAPID_PUBLIC_KEY;
  const vapidPrivate = process.env.VAPID_PRIVATE_KEY;
  const vapidSubject = process.env.VAPID_SUBJECT || "mailto:hello@includeme.uk";
  if (!vapidPublic || !vapidPrivate) {
    console.warn("VAPID keys not set — skipping push run");
    return { statusCode: 200, body: "skipped: VAPID keys not configured" };
  }
  webpush.setVapidDetails(vapidSubject, vapidPublic, vapidPrivate);

  const sb = adminClient();
  const subRows = await kvListByPrefix(sb, "notif_sub:");

  let sent = 0, expired = 0, skipped = 0;

  for (const row of subRows) {
    const sub = row.value;
    const ps = sub?.pushSubscription;
    if (!sub || !ps || !ps.endpoint || sub.types?.newActivities === false) { skipped++; continue; }

    // Read ONLY from the dedicated new-listings feed (Option A).
    const feed = await newListingsSince(sb, sub.lastNotifiedAt);
    const newOnes = feed.filter(a => {
        if (!sub.loc || a.lat == null || a.lng == null) return true; // no location filter set — notify anyway
        return haversineKm(sub.loc.lat, sub.loc.lng, a.lat, a.lng) <= (sub.radius || 20) * 1.60934; // radius is stored in miles
      });

    if (newOnes.length === 0) continue;

    const title = newOnes.length === 1 ? "New listing near you" : `${newOnes.length} new listings near you`;
    const body = newOnes.length === 1
      ? newOnes[0].name
      : newOnes.slice(0, 3).map(a => a.name).join(", ") + (newOnes.length > 3 ? "…" : "");

    try {
      await webpush.sendNotification(
        { endpoint: ps.endpoint, keys: ps.keys },
        JSON.stringify({ title, body, url: newOnes.length === 1 ? `/?id=${newOnes[0].id}` : "/" })
      );
      sent++;
      await kvSet(sb, row.key, { ...sub, lastNotifiedAt: new Date().toISOString() });
    } catch (e) {
      // 404/410 = the browser unsubscribed or the subscription expired — clean it up.
      if (e.statusCode === 404 || e.statusCode === 410) {
        await kvDelete(sb, row.key);
        expired++;
      } else {
        console.error("push send failed for", row.key, e.statusCode, e.body);
      }
    }
  }

  const summary = `push run: ${sent} sent, ${expired} expired subs removed, ${skipped} skipped`;
  console.log(summary);

  // ─── Native app push (FCM) ─────────────────────────────────────────────────
  // Same new-listings feed, but sent to native Android/iOS device tokens saved
  // by the installed app. No-ops entirely if Firebase isn't configured yet.
  let nativeSent = 0, nativeDead = 0, nativeSkipped = 0;
  try {
    const tokenRows = await kvListByPrefix(sb, "fcm_token:");
    for (const row of tokenRows) {
      const t = row.value;
      if (!t || !t.token || t.types?.newActivities === false) { nativeSkipped++; continue; }
      const feed = await newListingsSince(sb, t.lastNotifiedAt);
      const newOnes = feed.filter(a => {
        if (!t.loc || a.lat == null || a.lng == null) return true;
        return haversineKm(t.loc.lat, t.loc.lng, a.lat, a.lng) <= (t.radius || 20) * 1.60934;
      });
      if (newOnes.length === 0) continue;
      const title = newOnes.length === 1 ? "New listing near you" : `${newOnes.length} new listings near you`;
      const body = newOnes.length === 1
        ? newOnes[0].name
        : newOnes.slice(0, 3).map(a => a.name).join(", ") + (newOnes.length > 3 ? "…" : "");
      const { sent: s, dead } = await sendNativePush([t.token], {
        title, body, url: newOnes.length === 1 ? `/?id=${newOnes[0].id}` : "/",
      });
      nativeSent += s;
      if (dead.includes(t.token)) { await kvDelete(sb, row.key); nativeDead++; }
      else await kvSet(sb, row.key, { ...t, lastNotifiedAt: new Date().toISOString() });
    }
  } catch (e) {
    console.error("native push run failed", e.message);
  }
  const nativeSummary = `native push: ${nativeSent} sent, ${nativeDead} dead tokens removed, ${nativeSkipped} skipped`;
  console.log(nativeSummary);

  // ─── New EVENT notifications (web + native) ─────────────────────────────────
  // Same subscribers, but driven by the new-events feed (a provider added a
  // dated session/holiday club). Uses a separate lastEventNotifiedAt marker so
  // event and listing notifications don't clobber each other's timestamps.
  let evSent = 0;
  try {
    const webSubs = await kvListByPrefix(sb, "notif_sub:");
    const tokenRows = await kvListByPrefix(sb, "fcm_token:");
    // Web push for events
    for (const row of webSubs) {
      const sub = row.value;
      const ps = sub?.pushSubscription;
      if (!sub || !ps || !ps.endpoint || sub.types?.events === false) continue;
      const evs = (await newEventsSince(sb, sub.lastEventNotifiedAt)).filter(e => {
        if (!sub.loc || e.lat == null || e.lng == null) return true;
        return haversineKm(sub.loc.lat, sub.loc.lng, e.lat, e.lng) <= (sub.radius || 20) * 1.60934;
      });
      if (!evs.length) continue;
      const title = evs.length === 1 ? "New event near you" : `${evs.length} new events near you`;
      const body = evs.length === 1 ? `${evs[0].name} — ${evs[0].listingName}` : evs.slice(0, 3).map(e => e.name).join(", ");
      try {
        await webpush.sendNotification({ endpoint: ps.endpoint, keys: ps.keys },
          JSON.stringify({ title, body, url: evs.length === 1 ? `/?id=${evs[0].listingId}` : "/" }));
        evSent++;
        await kvSet(sb, row.key, { ...sub, lastEventNotifiedAt: new Date().toISOString() });
      } catch (e) {
        if (e.statusCode === 404 || e.statusCode === 410) await kvDelete(sb, row.key);
      }
    }
    // Native push for events
    for (const row of tokenRows) {
      const t = row.value;
      if (!t || !t.token || t.types?.events === false) continue;
      const evs = (await newEventsSince(sb, t.lastEventNotifiedAt)).filter(e => {
        if (!t.loc || e.lat == null || e.lng == null) return true;
        return haversineKm(t.loc.lat, t.loc.lng, e.lat, e.lng) <= (t.radius || 20) * 1.60934;
      });
      if (!evs.length) continue;
      const title = evs.length === 1 ? "New event near you" : `${evs.length} new events near you`;
      const body = evs.length === 1 ? `${evs[0].name} — ${evs[0].listingName}` : evs.slice(0, 3).map(e => e.name).join(", ");
      const { sent: s, dead } = await sendNativePush([t.token], { title, body, url: evs.length === 1 ? `/?id=${evs[0].listingId}` : "/" });
      evSent += s;
      if (dead.includes(t.token)) await kvDelete(sb, row.key);
      else await kvSet(sb, row.key, { ...t, lastEventNotifiedAt: new Date().toISOString() });
    }
  } catch (e) {
    console.error("event notification run failed", e.message);
  }
  console.log(`event push: ${evSent} sent`);

  return { statusCode: 200, body: `${summary} | ${nativeSummary} | events: ${evSent}` };
}
