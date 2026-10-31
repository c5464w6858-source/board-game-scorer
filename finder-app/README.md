# IncludeMe — SEND Activity Finder

A directory of inclusive, accessible activities, therapies and charities for
children with special educational needs and disabilities across the UK.

This is a deployable web app: **React + Vite** front-end, **Supabase** for the
database + authentication (including **Sign in with Apple / Google**), and a tiny
serverless proxy for Google listing photos.

---

## What changed vs. the prototype

| Area | Prototype | This project |
|---|---|---|
| Data | Browser key-value (single device) | **Supabase Postgres** (shared, persistent) |
| Accounts | Local record, weak hash | **Supabase Auth** (secure, hashed, cross-device) |
| Email | None | **Verification + password-reset emails** built in |
| Social login | None | **Apple + Google** via Supabase OAuth |
| Profile/favourites | In a shared record | Private to each user (Auth metadata) |
| Photos | Blocked in sandbox | Load fine on a real host; Google photos via proxy |

---

## 1. Prerequisites

- Node.js 18+
- A free [Supabase](https://supabase.com) account
- A host that allows commercial use on free tier — **Cloudflare Pages** or
  **Netlify**. (Vercel's free *Hobby* tier is personal/non-commercial only.)
- *(Optional)* Google Cloud account for listing photos
- *(Optional)* [Resend](https://resend.com) account for extra emails beyond auth

## 2. Run locally

```bash
npm install
cp .env.example .env        # fill in the two VITE_ values from Supabase
npm run dev
```

## 3. Set up Supabase (database + auth)

1. Create a new project at supabase.com.
2. **Database:** open *SQL Editor*, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and Run.
3. **Keys:** *Project Settings → API*. Copy the **Project URL** and **anon
   public** key into `.env`:
   ```
   VITE_SUPABASE_URL=...
   VITE_SUPABASE_ANON_KEY=...
   ```
4. **Email auth:** *Authentication → Providers → Email* is on by default. During
   development you can turn **"Confirm email" OFF** so signups log in instantly.
   Turn it **ON** before launch so addresses are verified.
   - Built-in emails (verification, reset) work out of the box but are
     **rate-limited**. For production, set a custom SMTP under
     *Authentication → Emails → SMTP* (Resend, Postmark, SendGrid, etc.).
5. **Redirect URLs:** *Authentication → URL Configuration* → add your local and
   live origins (e.g. `http://localhost:5173` and `https://yourapp.com`).

## 4. Sign in with Apple / Google

The buttons are already in the app. Enable each provider in Supabase
(*Authentication → Providers*):

- **Google** (free): create an OAuth client in Google Cloud Console, add the
  Supabase callback URL it shows you, paste Client ID + Secret into Supabase.
- **Apple**: requires the **Apple Developer Program (£79/$99 per year)**. Create
  a Services ID + key, then paste the values into Supabase. Without the paid
  membership the Apple button cannot be enabled — Google is the free option.

## 5. Photos (optional)

- Once deployed to a real host, the **website-preview** images load with no
  setup (the in-app preview sandbox was what blocked them).
- For real **Google listing photos**, enable *Places API (New)* + billing in
  Google Cloud, then set `GOOGLE_PLACES_API_KEY` in your host's environment
  variables. The included proxy ([`netlify/functions/place-photo.js`](netlify/functions/place-photo.js))
  keeps that key off the client. Set `PHOTOS_ENABLED = false` in `src/App.jsx`
  to skip Google entirely.

## 6. Deploy (Netlify example)

1. Push this folder to a GitHub repo.
2. In Netlify: *Add new site → Import from GitHub*. Build command `npm run build`,
   publish dir `dist` (already set in `netlify.toml`).
3. *Site settings → Environment variables*: add `GOOGLE_PLACES_API_KEY` (if using
   photos). The `VITE_` keys can go here too, or stay in your repo's build env.
4. Deploy. Add the live URL to Supabase's redirect URLs (step 3.5).

*(Cloudflare Pages is equivalent: framework preset "Vite", build `npm run build`,
output `dist`. Move the proxy to a Pages Function if you use photos.)*

## 7. Before you go live

- [ ] Turn **Confirm email ON** in Supabase.
- [ ] Add **custom SMTP** so auth emails don't hit the shared rate limit.
- [x] `kv` write policy is now owner/admin-restricted — see `supabase/schema.sql`.
      **You still need to re-run this file in your live project's SQL editor** —
      it's safe to re-run, but it only takes effect once you actually run it.
- [ ] Set your real admin email in `ADMIN_EMAILS` (`src/App.jsx`) **and** the
      matching `is_admin()` function in `supabase/schema.sql` — they must match
      exactly, lowercase.
- [ ] Confirm your real domain and update `SHARE_URL` (`src/App.jsx`) and the
      `<a>` links in `public/privacy.html` / `public/terms.html` if it's not
      `includeme.uk`.
- [ ] Set up Stripe — `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `SITE_URL`
      — see section 8. Without these, the upgrade buttons show a real error
      rather than activating (they don't silently give away free upgrades).
- [ ] Set up notifications — see section 9 below (optional, but the feature is
      built and just needs your API keys).
- [ ] Run through [`DEPLOY-CHECKLIST.md`](DEPLOY-CHECKLIST.md).

## 8. Featured / Verified upgrades (real Stripe payments)

Clicking "Get Featured" or "Get Verified" redirects to a real Stripe Checkout
page. Once Stripe confirms the card was charged, **Stripe itself** calls
[`netlify/functions/stripe-webhook.js`](netlify/functions/stripe-webhook.js),
which is the only thing that actually activates the listing — never the
browser, since the browser can't be trusted to honestly report "yes, I paid."

### One-time Stripe setup

1. **Get your API keys.** Stripe Dashboard → Developers → API keys. Start
   with the **test mode** secret key (`sk_test_...`) while you're setting
   this up — switch the toggle to test mode if it isn't already. Add it to
   Netlify as `STRIPE_SECRET_KEY`.
2. **Create a webhook endpoint.** Stripe Dashboard → Developers → Webhooks →
   **Add endpoint**. URL: `https://includeme.uk/.netlify/functions/stripe-webhook`
   (swap in your real domain if different). Select these events:
   `checkout.session.completed`, `invoice.paid`, `invoice.payment_failed`,
   `customer.subscription.deleted`. After creating it, Stripe shows a
   **Signing secret** (`whsec_...`) — add that to Netlify as
   `STRIPE_WEBHOOK_SECRET`.
3. **Set your site URL.** Add `SITE_URL` to Netlify, e.g. `https://includeme.uk`
   — used to build the redirect back to your site after payment.
4. **Test it end to end** in Stripe's test mode: claim/own a listing, click
   "Get Featured," use [Stripe's test card](https://docs.stripe.com/testing)
   `4242 4242 4242 4242` (any future expiry, any CVC) to "pay." You should
   land back on My Listings with a confirmation banner and the Featured
   badge active. Check Stripe Dashboard → Developers → Webhooks → your
   endpoint to confirm it shows a successful delivery.
5. **Go live:** switch Stripe to live mode, replace `STRIPE_SECRET_KEY` with
   the `sk_live_...` key, and repeat step 2 for a **live mode** webhook
   endpoint (test and live mode have separate webhooks and separate signing
   secrets — don't reuse the test one).

### What's not pre-built in the dashboard

No Stripe Product or Price needs to be created manually — the £15/£49
amounts are defined directly in
[`create-checkout-session.js`](netlify/functions/create-checkout-session.js)
(`PRICES` constant near the top). If you ever change the pricing, update it
there — that's the single source of truth.

### Cancellations & downgrades

If a business cancels their subscription (or a card fails permanently after
Stripe's retry schedule), Stripe sends `customer.subscription.deleted`, and
the webhook automatically removes the Verified/Featured flags. You don't
need to do anything manually for normal cancellations.

### Manual/free activation still exists

[`activate-tier.js`](netlify/functions/activate-tier.js) (the original
instant-activate-for-free path) is still in the codebase but is **no longer
called by the upgrade buttons** — it's left in place as a manual override an
admin could use (e.g. comping a charity partner, as the Verified modal's
copy already promises: *"Registered charities are verified free of charge —
contact us"*). There's currently no admin UI button wired to it; it would
need to be called directly (e.g. via a quick script or future admin-panel
button) if you want to use it that way.

### If Stripe isn't configured yet

The buttons still work for **demo purposes only** when running the offline
preview artifact (no Netlify functions exist there at all, so the app falls
back to local instant activation). Once deployed to Netlify for real, if
`STRIPE_SECRET_KEY` is missing the checkout button will show a real error
rather than silently activating for free — so don't worry about accidentally
giving away free upgrades if you deploy before finishing Stripe setup.

## 9. Push & email notifications (optional)

The notification *features* (push opt-in, weekly family digest, admin daily
digest) are fully built in the app — what was missing was a backend to
actually send anything. That backend now exists as three scheduled functions
in `netlify/functions/`, but each needs its own API key before it'll send
real notifications:

| Function | Sends | Schedule | Needs |
|---|---|---|---|
| `send-push-alerts.js` | Push notification when a new listing appears near a subscriber | every 6 hours | `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` |
| `send-weekly-digest.js` | Weekly "what's new" email to families | daily (filters by each family's chosen day) | `RESEND_API_KEY` |
| `send-admin-digest.js` | Your own daily digest (sign-ups, claims, suggestions) | daily, 08:00 UTC | `RESEND_API_KEY` |

All three also need `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` (Project
Settings → API → **service_role** key — not the anon key; this one bypasses
RLS, which is correct for a trusted backend job, but never put it in client
code or `.env`/`VITE_` variables).

**Set these in Netlify → Site settings → Environment variables:**

```
SUPABASE_URL=...                    (same as VITE_SUPABASE_URL)
SUPABASE_SERVICE_ROLE_KEY=...       (Project Settings → API — keep secret!)
VAPID_PUBLIC_KEY=BFydIC3bHwB_F5l5rIJZXDlGdImlYoLJsVOrxpAFfpoKRYC2u1yTZ6q__jVO4_oP6xhrMiiTZ1it5YkO_OGsBZc
VAPID_PRIVATE_KEY=YkP89zzXot-7PGODDBsoKWI2FEn2_yLn_4SaEnMyffc
VAPID_SUBJECT=mailto:hello@includeme.uk
RESEND_API_KEY=...                  (resend.com → API Keys)
NOTIFICATIONS_FROM_EMAIL=IncludeMe <notifications@yourdomain.com>   (optional — must be a domain verified in Resend)
```

The VAPID key pair above was generated for this project and is already wired
into `VAPID_PUBLIC_KEY` in `src/App.jsx` — you only need to add the private
key (and subject) as Netlify env vars. If you'd rather generate your own pair,
run `npx web-push generate-vapid-keys` and update both the env var and the
constant in `src/App.jsx`.

Netlify picks up the `schedule` exported from each function automatically —
no extra `netlify.toml` config needed for these three. You can confirm they're
registered under *Site → Functions* after your next deploy, and trigger one
manually with `netlify functions:invoke send-push-alerts` to test it.

**What this does *not* do yet:** push notifications for holiday-club/event/
availability changes specifically (only "new listing added" is wired up —
those other toggles are saved but not yet acted on, since they'd need their
own definition of "new"). The admin digest's "send time" preference is saved
but the actual cron is fixed at 08:00 UTC (Netlify schedules are static config,
not driven by data) — change the cron expression in the function file and
redeploy if you want a different time.

---

### A note on testing emails
I could not test live email delivery for you — that only works once your own
Supabase project + (optionally) SMTP are connected, because the emails are sent
by Supabase, not by the app code. `DEPLOY-CHECKLIST.md` walks you through
verifying it end-to-end in a few minutes.
