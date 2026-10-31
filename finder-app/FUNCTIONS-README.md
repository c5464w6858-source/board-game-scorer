# About the server functions

The 15 Netlify functions (Stripe checkout and webhook, claims, alerts, digests and so on) are kept in
`deployed-functions/` as the built zips from the last good deploy. `scripts/prepare-functions.sh` unpacks them
into `netlify/functions` at the start of every build.

`functions-stale-source-DO-NOT-DEPLOY/` is an older copy of the source recovered from a cache. It is behind
the live code (no CORS preflight, and no create-portal-session). Keep it for reference only.

To change a function, rebuild readable source from the live bundle first, then replace its zip.
