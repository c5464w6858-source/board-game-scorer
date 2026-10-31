// Instantly activates Verified or Featured on a listing the caller owns.
//
// WHY THIS EXISTS RATHER THAN A DIRECT CLIENT WRITE: supabase/schema.sql
// only allows an admin account to set verified/featured/verifiedPaid — an
// owner flipping these on their own listing is blocked at the database
// level by design (it's exactly the self-upgrade-for-free hole that policy
// closes). This function uses the service role key to bypass that, but only
// after confirming the caller is actually signed in AND actually owns the
// listing they're trying to upgrade — so the *result* for the business is
// still "click a button, it's instantly active," just via a checked path
// instead of an open one.
//
// 🔌 STRIPE PLUGS IN HERE: right now this activates for free the moment it's
// called — there's no payment step. When you're ready, create a Stripe
// Checkout Session before the activation block below, and only run the
// activation after Stripe confirms payment (either by redirecting back with
// a verified session ID, or — better — from a Stripe webhook function that
// calls this same activation logic). Search this file for "ACTIVATE" to find
// the exact line to wrap.
//
// REQUIRED environment variables: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// (see netlify/functions/_shared.js for what these are and where to find them)

import { createClient } from "@supabase/supabase-js";
import { adminClient } from "./_shared.js";

export async function handler(event) {
  const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });

  let actId, tier;
  try { ({ actId, tier } = JSON.parse(event.body || "{}")); } catch { return json(400, { error: "invalid body" }); }
  if (!actId || !["verified", "featured"].includes(tier)) return json(400, { error: "actId and a valid tier ('verified' or 'featured') are required" });

  // Identify the caller from their Supabase session token — never trust a
  // client-supplied userId, or anyone could activate someone else's listing.
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "missing auth token" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !userData?.user) return json(401, { error: "invalid or expired session" });
  const callerId = userData.user.id;

  const sb = adminClient();
  const { data: row, error: getErr } = await sb.from("kv").select("value").eq("key", `activity:${actId}`).maybeSingle();
  if (getErr) return json(500, { error: getErr.message });
  if (!row || !row.value) return json(404, { error: "listing not found — has it been claimed/created via the app yet?" });

  const act = row.value;
  if (act.ownerId !== callerId) return json(403, { error: "you don't own this listing" });

  // ── ACTIVATE ── (this is the line a future Stripe payment confirmation gates)
  const updated = tier === "featured"
    ? { ...act, featured: true, verifiedPaid: true, verified: true }
    : { ...act, verifiedPaid: true, verified: true };

  const { error: setErr } = await sb.from("kv").upsert({ key: `activity:${actId}`, value: updated, updated_at: new Date().toISOString() });
  if (setErr) return json(500, { error: setErr.message });

  return json(200, { ok: true, activity: updated });
}
