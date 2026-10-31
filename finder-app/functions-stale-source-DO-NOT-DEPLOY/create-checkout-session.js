// Starts a real Stripe Checkout session for a Verified (£15/mo) or Featured
// (£49/mo) subscription on a listing the caller owns. The browser is
// redirected to Stripe's hosted checkout page to actually take payment —
// activation itself happens in stripe-webhook.js once Stripe confirms the
// payment succeeded, not here (never trust the browser alone to say
// "payment succeeded").
//
// REQUIRED environment variables (Netlify → Site settings → Environment):
//   STRIPE_SECRET_KEY    — Stripe Dashboard → Developers → API keys →
//                           "Secret key". Use a TEST key (starts sk_test_)
//                           until you're ready to take real payments, then
//                           switch to the LIVE key (starts sk_live_).
//   SUPABASE_URL, VITE_SUPABASE_ANON_KEY — same as elsewhere, used to verify
//                           the caller's session token.
//   SITE_URL              — your real site URL, e.g. https://includeme.uk
//                           (used to build the success/cancel redirect URLs)
//
// No Stripe Product/Price needs to be pre-created in the Stripe dashboard —
// the price is defined inline below (price_data) so the £ amount lives in
// one place in this codebase rather than split between code and dashboard.

import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";
import { adminClient } from "./_shared.js";

const PRICES = {
  verified: { amountPence: 1500, label: "IncludeMe Verified" },
  featured: { amountPence: 4900, label: "IncludeMe Featured" },
};

export async function handler(event) {
  const json = (code, body) => ({ statusCode: code, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  if (event.httpMethod !== "POST") return json(405, { error: "POST only" });
  if (!process.env.STRIPE_SECRET_KEY) return json(500, { error: "STRIPE_SECRET_KEY not configured" });

  let actId, tier;
  try { ({ actId, tier } = JSON.parse(event.body || "{}")); } catch { return json(400, { error: "invalid body" }); }
  const price = PRICES[tier];
  if (!actId || !price) return json(400, { error: "actId and a valid tier ('verified' or 'featured') are required" });

  const authHeader = event.headers.authorization || event.headers.Authorization || "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return json(401, { error: "missing auth token" });

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
  const anonClient = createClient(supabaseUrl, anonKey);
  const { data: userData, error: userErr } = await anonClient.auth.getUser(token);
  if (userErr || !userData?.user) return json(401, { error: "invalid or expired session" });
  const caller = userData.user;

  // Confirm ownership before letting them pay for someone else's listing.
  const adminSb = adminClient();
  const { data: row, error: getErr } = await adminSb.from("kv").select("value").eq("key", `activity:${actId}`).maybeSingle();
  if (getErr) return json(500, { error: getErr.message });
  if (!row || !row.value) return json(404, { error: "listing not found" });
  if (row.value.ownerId !== caller.id) return json(403, { error: "you don't own this listing" });

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });
  const siteUrl = process.env.SITE_URL || "https://includeme.uk";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      customer_email: caller.email,
      line_items: [{
        price_data: {
          currency: "gbp",
          product_data: { name: `${price.label} — ${row.value.name || actId}` },
          unit_amount: price.amountPence,
          recurring: { interval: "month" },
        },
        quantity: 1,
      }],
      // Read back in stripe-webhook.js once payment succeeds.
      metadata: { actId, tier, userId: caller.id },
      subscription_data: { metadata: { actId, tier, userId: caller.id } },
      success_url: `${siteUrl}/?upgraded=${tier}&actId=${encodeURIComponent(actId)}`,
      cancel_url: `${siteUrl}/?upgradeCancelled=1`,
    });
    return json(200, { url: session.url });
  } catch (e) {
    console.error("Stripe checkout session creation failed", e);
    return json(500, { error: e.message || "Stripe error" });
  }
}
