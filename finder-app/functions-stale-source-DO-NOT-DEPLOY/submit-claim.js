// Submits a listing claim. This goes through a server function rather than a
// direct client insert because of an RLS edge case: if a `claim:` row already
// exists for this listing — e.g. an old claim that was later removed (status
// "removed", userId null) — the client cannot overwrite it. A direct insert
// collides on the primary key, and an upsert fails the UPDATE policy (which
// requires the existing row's userId to already equal the caller's). Only an
// admin/service-role write can replace an abandoned row, which is what this
// does, after verifying the caller and checking the listing isn't actively
// claimed by someone else.
//
// REQUIRED env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY

import { createClient } from "@supabase/supabase-js";
import { adminClient } from "./_shared.js";

export async function handler(event) {
  const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });

  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "invalid body" }); }
  const { actId, actName, orgName, claimantName, role, email } = payload;
  if (!actId || !claimantName || !role || !email) return json(400, { error: "missing required fields" });

  // Verify the caller is really signed in, and get their real auth uid.
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "missing auth token" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !userData?.user) return json(401, { error: "invalid or expired session" });
  const userId = userData.user.id;

  const sb = adminClient();
  const key = `claim:${actId}`;

  // Block only if there's a genuinely active claim by someone else.
  const { data: existing } = await sb.from("kv").select("value").eq("key", key).maybeSingle();
  if (existing?.value) {
    const v = existing.value;
    if (v.status === "pending" && v.userId && v.userId !== userId) {
      return json(409, { error: "A claim for this listing is already pending review by another account." });
    }
    if (v.status === "approved" && v.userId && v.userId !== userId) {
      return json(409, { error: "This listing has already been claimed by another account. Contact hello@includeme.uk if you believe this is wrong." });
    }
    if (v.status === "pending" && v.userId === userId) {
      return json(200, { ok: true, alreadyPending: true });
    }
    // Otherwise (removed / null user / your own prior claim) — fall through
    // and overwrite it with the fresh pending claim.
  }

  const { error: upsertErr } = await sb.from("kv").upsert({
    key,
    value: { actId, actName, orgName, userId, claimantName, role, email, status: "pending", submittedAt: new Date().toISOString() },
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" });

  if (upsertErr) return json(500, { error: upsertErr.message });
  return json(200, { ok: true });
}
