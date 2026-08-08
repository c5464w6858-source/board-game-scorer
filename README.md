# Board Game Scorer

Multi-device, realtime score tracker for board games. Start a session, share
a join code, and everyone's scores stay in sync across phones with no
accounts required — same trust model as Kahoot/Jackbox game rooms.

Built-in games: Ticket to Ride, Catan, Wingspan, Splendor, and a generic
round-based scorer. Each game is just a set of scoring categories + a theme,
stored in the `games` table, so more can be added without a code change.

## Stack

- Vite + React + TypeScript
- Tailwind CSS v4
- Supabase (Postgres + Realtime), no auth — RLS trusts the unguessable join code
- React Router

## Local development

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + publishable key
npm run dev
```

## Data model

- `games` — built-in and custom game definitions (`theme`, `categories`, `scoring_rules` as jsonb)
- `sessions` — one played/in-progress game, identified by a short `join_code`
- `session_players` — players in a session, identified by a client-generated `device_id`
- `scores` — one row per (player, category[, round]) score entry

Totals are computed client-side as `Σ category.weight * Σ scores.value` for
that category — see `src/lib/scoring.ts`. Table-type categories (like Ticket
to Ride route lengths) store the final point value directly, so weight is
always 1 for those.

`supabase/migrations/` mirrors what's applied to the live project, for
reference — there's no local Supabase stack wired up in this repo.

## Deploy

Deployed to the existing Netlify site `board-game-scorer.netlify.app`
(`netlify.toml` sets the build command/publish dir and SPA redirect). Env
vars (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) are set on the
Netlify site itself.

## Not yet built

Custom game builder and the free/premium (Gumroad) split mentioned in the
original product scope — this repo currently ships the five built-in games,
fully playable, with no paywall.
