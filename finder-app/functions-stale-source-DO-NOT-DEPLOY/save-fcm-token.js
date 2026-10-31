// Saves (or removes) a native app's FCM device token so the push-alerts job
// can send it notifications. Called by the installed Android/iOS app after it
// registers with Firebase Cloud Messaging and receives a device token.
//
// Stored as `fcm_token:<userId>` when signed in, or `fcm_token:<token-hash>`
// for anonymous installs, with the same loc/radius/types shape the web push
// subscriptions use so the sender can treat both uniformly.
//
// REQUIRED env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, VITE_SUPABASE_ANON_KEY

import { createClient } from "@supabase/supabase-js";
import { adminClient } from "./_shared.js";

export async function handler(event) {
  const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });

  let payload;
  try { payload = JSON.parse(event.body || "{}"); } catch { return json(400, { error: "invalid body" }); }
  const { token, loc, radius, types, locLabel, remove } = payload;
  if (!token) return json(400, { error: "token required" });

  const sb = adminClient();

  // Try to identify the user from their session token (optional — anonymous
  // installs can still register for location-based new-listing alerts).
  let userId = null;
  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const sessToken = authHeader.replace(/^Bearer\s+/i, "");
  if (sessToken) {
    try {
      const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
      const anonClient = createClient(supabaseUrl, anonKey);
      const { data } = await anonClient.auth.getUser(sessToken);
      if (data?.user) userId = data.user.id;
    } catch { /* anonymous is fine */ }
  }

  // Key by token so the same device updates one row rather than piling up.
  // (A device's FCM token is stable until the app is reinstalled/cleared.)
  const safeToken = token.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 120);
  const key = `fcm_token:${safeToken}`;

  if (remove) {
    await sb.from("kv").delete().eq("key", key);
    return json(200, { ok: true, removed: true });
  }

  const { error } = await sb.from("kv").upsert({
    key,
    value: {
      token, userId,
      loc: loc || null,
      locLabel: locLabel || "",
      radius: radius || 20,
      types: types || { newActivities: true },
      lastNotifiedAt: new Date().toISOString(), // start "now" so the back-catalogue never fires
      updatedAt: new Date().toISOString(),
    },
  }, { onConflict: "key" });

  if (error) return json(500, { error: error.message });
  return json(200, { ok: true });
}
