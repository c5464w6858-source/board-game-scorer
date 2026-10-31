// Publishes one or more listings to the `new-listing:` notification feed
// (Option A). This is the ONLY thing that makes a listing eligible to trigger
// a weekly email / web push / native push. The bulk SEED back-catalogue is
// never published here, so it can never cause a notification blast.
//
// Two callers:
//   1. Admin, after adding a batch of new SEED listings in a release — calls
//      this with the new listings' minimal notify-fields (id, name, lat, lng,
//      location, type). Admin-only, verified by ADMIN_EMAILS.
//   2. The live "Add listing" flow in the app, when a provider creates a brand
//      new listing — passes that single listing so it notifies nearby families.
//
// A listing already in the feed is skipped (idempotent) so re-publishing a
// batch doesn't reset timestamps or double-notify.
//
// REQUIRED env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY

import { createClient } from "@supabase/supabase-js";
import { adminClient } from "./_shared.js";

const ADMIN_EMAILS = ["paul_whitehouse1@yahoo.co.uk"];

export async function handler(event) {
  const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });

  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "invalid body" }); }
  const { listings, events, mode } = payload; // listings/events arrays; mode: "admin" | "live"
  if ((!Array.isArray(listings) || listings.length === 0) && (!Array.isArray(events) || events.length === 0)) {
    return json(400, { error: "listings or events array required" });
  }

  // Verify the caller.
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "missing auth token" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !userData?.user) return json(401, { error: "invalid or expired session" });
  const caller = userData.user;

  // Admin-mode (bulk publishing a release batch) requires an admin account.
  // Live-mode (a provider publishing their own single new listing) just
  // requires being signed in — the listing's own ownership is enforced
  // elsewhere when it's created.
  if (mode === "admin" && !ADMIN_EMAILS.includes((caller.email || "").toLowerCase())) {
    return json(403, { error: "admin only" });
  }

  const sb = adminClient();
  const now = new Date().toISOString();
  let published = 0, skipped = 0, eventsPublished = 0, eventsSkipped = 0;

  for (const l of (listings || [])) {
    if (!l || !l.id) continue;
    const key = `new-listing:${l.id}`;
    // Idempotent: don't re-add (would reset the timestamp and risk re-notifying).
    const { data: existing } = await sb.from("kv").select("key").eq("key", key).maybeSingle();
    if (existing) { skipped++; continue; }
    const { error } = await sb.from("kv").insert({
      key,
      value: {
        id: l.id, name: l.name, location: l.location || "", type: l.type || "",
        category: l.category || "activity",
        lat: l.lat ?? null, lng: l.lng ?? null,
        description: l.description || "", cost: l.cost || "",
        ageMin: l.ageMin ?? null, ageMax: l.ageMax ?? null,
        needs: Array.isArray(l.needs) ? l.needs : [],
        addedAt: now,
      },
    });
    if (!error) published++;
  }

  for (const e of (events || [])) {
    if (!e || !e.id) continue;
    const key = `new-event:${e.id}`;
    const { data: existing } = await sb.from("kv").select("key").eq("key", key).maybeSingle();
    if (existing) { eventsSkipped++; continue; }
    const { error } = await sb.from("kv").insert({
      key,
      value: {
        id: e.id, listingId: e.listingId || "", listingName: e.listingName || "",
        name: e.name || "", start: e.start || "", end: e.end || "",
        location: e.location || "", lat: e.lat ?? null, lng: e.lng ?? null,
        addedAt: now,
      },
    });
    if (!error) eventsPublished++;
  }

  return json(200, { published, skipped, eventsPublished, eventsSkipped });
}
