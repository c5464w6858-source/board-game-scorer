# BuddyGolf

Vite + React + TypeScript + Tailwind v4, with Supabase (Postgres + Auth) and Netlify hosting.

## Local development

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + publishable key
npm run dev
```

`supabase/migrations/` mirrors what's applied to the live project.

## Data model

"Tinder for golf": host rounds, find golfers, request to join.

- `profiles`: one per user, created automatically on signup (display name, handicap, home area, bio, avatar)
- `rounds`: a hosted tee time (course, date/time, 2–4 players including the host, 9 or 18 holes, optional handicap range)
- `round_requests`: a golfer asking to join a round. The host accepts or declines, and the requester can withdraw. Accepted requests are visible to everyone, so a round shows who's playing. Pending ones are visible only to the requester and the host. A trigger blocks overfilling a round and joining one that's cancelled or already teed off.
- `connections`: golfer-to-golfer requests (one per pair). Only the two golfers involved can see them.

Your upcoming games are rounds you host plus rounds where your request was accepted, with `tee_time` in the future.

Row-level security enforces all of the above. `src/lib/database.types.ts` is generated from the live schema.
