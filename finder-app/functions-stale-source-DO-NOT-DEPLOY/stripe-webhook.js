// Stripe calls this endpoint directly (not the browser) whenever something
// happens on a subscription — payment succeeded, renewed, failed, or was
// cancelled. This is the ONLY place that should activate a tier after a real
// payment, because it's the only signal that can't be faked by someone just
// closing their browser at the right moment on the success page.
//
// REQUIRED environment variables:
//   STRIPE_SECRET_KEY      — see create-checkout-session.js
//   STRIPE_WEBHOOK_SECRET  — Stripe Dashboard → Developers → Webhooks → your
//                            endpoint → "Signing secret" (starts whsec_).
//                            You only get this AFTER creating the webhook
//                            endpoint in Stripe pointing at this function's
//                            URL — see the README for the exact steps.
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY — see _shared.js
//
// SECURITY NOTE: this function verifies the request really came from Stripe
// using the signature header + STRIPE_WEBHOOK_SECRET. Without that check,
// anyone could POST a fake "payment succeeded" event and get Featured for
// free — so this verification step is not optional.

import Stripe from "stripe";
import { adminClient, activateListingTier, deactivateListingTier, kvSet } from "./_shared.js";

// This function is automatically available at the default Netlify path
// based on its filename: /.netlify/functions/stripe-webhook
// (point your Stripe webhook endpoint at exactly that URL — see README)

export async function handler(event) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2026-05-27.dahlia" });
  const sig = event.headers["stripe-signature"];
  let stripeEvent;

  try {
    const rawBody = event.isBase64Encoded ? Buffer.from(event.body, "base64") : event.body;
    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (e) {
    console.error("Stripe webhook signature verification failed", e.message);
    return { statusCode: 400, body: `Webhook signature verification failed: ${e.message}` };
  }

  const sb = adminClient();

  try {
    switch (stripeEvent.type) {
      case "checkout.session.completed": {
        const session = stripeEvent.data.object;
        const { actId, tier, userId } = session.metadata || {};
        if (!actId || !tier) { console.warn("checkout.session.completed missing metadata", session.id); break; }
        await activateListingTier(sb, actId, tier, {
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        });
        await kvSet(sb, `subscription:${session.subscription}`, { actId, tier, userId, status: "active", createdAt: new Date().toISOString() });
        console.log(`Activated ${tier} for ${actId} via Stripe (subscription ${session.subscription})`);
        break;
      }

      // Subscription renewed successfully each month — nothing to activate
      // (it's already active), but useful to log/track if you want billing
      // history later. Not acting on this is safe.
      case "invoice.paid":
        break;

      // Card declined on renewal. Stripe will retry automatically a few
      // times (per your Stripe billing settings) before giving up — we only
      // downgrade once Stripe gives up, via customer.subscription.deleted
      // below, not on the first failed attempt.
      case "invoice.payment_failed":
        console.warn("Invoice payment failed", stripeEvent.data.object.id);
        break;

      // Subscription cancelled (by the customer, by you, or after Stripe
      // exhausted payment retries) — downgrade the listing.
      case "customer.subscription.deleted": {
        const sub = stripeEvent.data.object;
        const record = await sb.from("kv").select("value").eq("key", `subscription:${sub.id}`).maybeSingle();
        const meta = record.data?.value || sub.metadata || {};
        if (meta.actId && meta.tier) {
          await deactivateListingTier(sb, meta.actId, meta.tier);
          await kvSet(sb, `subscription:${sub.id}`, { ...meta, status: "cancelled", cancelledAt: new Date().toISOString() });
          console.log(`Deactivated ${meta.tier} for ${meta.actId} — subscription ${sub.id} ended`);
        }
        break;
      }

      default:
        // Unhandled event types are fine to ignore — Stripe sends many more
        // event types than this app needs to act on.
        break;
    }
  } catch (e) {
    console.error("Error processing Stripe webhook", stripeEvent.type, e);
    // Return 500 so Stripe retries this event automatically rather than
    // silently losing a payment confirmation.
    return { statusCode: 500, body: "Internal error processing webhook" };
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
}
