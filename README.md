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
- `courses`: every named UK golf course from OpenStreetMap (name, location, town, postcode, website, phone). `rounds.course_id` links a round to one.
- `round_messages`: round chat, readable and writable only by the host and accepted players (Supabase Realtime).
- `golfer_preferences`: private to each golfer (membership interest, how often they play, and `clubs_can_contact`). Clubs only ever see golfers who opt in; the data is never sold.
- `connections`: golfer-to-golfer requests (one per pair). Only the two golfers involved can see them.
- `course_tees` and `course_holes`: a course's scorecard (tee sets with par, yards, course rating and slope; par, stroke index and yards per hole). Readable by signed-in users and written only by the `course-card` function. `rounds.tee_id` records the tees a round is played off.
- `kudos`: tags players give each other after a round (great company, kept the pace, clutch putter, would play again). Givers see their own; a recipient sees theirs once every player has given kudos or 24 hours after tee time (`kudos_revealed`).
- `availability`: the AM/PM slots a golfer is free over the next week ("I'm free"), readable by signed-in users so hosts can see who's free. `profiles.search_radius_miles` is how far they'll travel. Both feed the match score.
- `blocks`: who a golfer has blocked. Blocked golfers never see each other's rounds or join them (`is_blocked_between`, used in the rounds select policies and the join trigger).
- `reports`: insert-only for golfers (no select policy), read by admins with the service role. Reasons: no show, abusive, unsafe, fake profile or handicap, asked for money.
- Safety on profiles: optional self-declared `gender` (only used for women-only games), and `women_only` / `beginner_friendly` "games I'm shown" filters. Rounds carry `women_only` (seen and joined only by women) and `beginner_friendly`.
- `scores`: strokes per player per hole, readable by the round's host and accepted players. Each player writes their own, and the host can write anyone's. Live via Supabase Realtime.

Rounds also carry `urgent` ("Need a player": the first golfer to ask is accepted automatically, by the same trigger that auto-accepts buddies), `format`, `walking`, `pace_note`, `green_fee_pence` (information only, never charged), `visibility` (public or buddies) and `auto_accept_buddies`. Profiles carry `home_club_id`, `home_club_member`, `play_style`, `bag`, `handicap_source` and `onboarded_at` (set once first-run setup at `/welcome` is finished or skipped) (self-declared until an official link exists). An `avatars` storage bucket holds profile photos, one folder per user.

Your upcoming games are rounds you host plus rounds where your request was accepted, with `tee_time` in the future.

Row-level security enforces all of the above. `src/lib/database.types.ts` is generated from the live schema.

## Golf courses and tee times

`supabase/functions/import-courses` pulls UK courses from OpenStreetMap's Overpass API and upserts them into `courses`. It refuses to run more than once a day, since the public anon key can call it. To refresh the data, call it from the Supabase SQL editor:

```sql
select net.http_post(
  url := 'https://<project-ref>.supabase.co/functions/v1/import-courses',
  headers := jsonb_build_object('Authorization', 'Bearer <anon key>'),
  timeout_milliseconds := 200000
);
```

There's no public tee-time API (most UK clubs use BRS/GolfNow, which don't offer one), so **Check live tee times** opens the club's own booking page: `booking_url` if set, else the club website. Courses with neither get a web search for "<course> tee times". OpenStreetMap's licence requires the "© OpenStreetMap contributors" credit shown in the app.

## Societies & trips

A separate navy-and-gold section (`/groups`). A group is a society, golf trip or one-off event (`groups`), joined with a 6-letter invite code or link (`join_group(code)`). Organisers add the rounds they've booked (`group_rounds`), and any member can keep the card for their playing group (`group_scores`, live via Realtime). The group page totals Stableford points across rounds as an order of merit.

**Ryder Cup mode** (`groups.ryder_cup`, `team_a_name`, `team_b_name`, `group_members.team`): organisers pick sides and set matches per round (`group_matches`: fourballs, foursomes or singles). Results are match play worked out from the hole scores, with shots off the lowest handicap in each match (half the pair's combined handicap in foursomes, whose one ball is scored under the pair's first player). Each match is worth a point, a half each if halved.

## Scorecards

`supabase/functions/course-card` fetches a course's scorecard from the [UK Golf Course API](https://rapidapi.com/raznut303/api/uk-golf-course-data-api) on RapidAPI the first time the app needs it, then saves it to `course_tees` and `course_holes` so later visits never call the API. It matches the OpenStreetMap course to the API's club by name and distance (within 3 km), tries each course at most once a week, and needs the `GOLF_API_KEY` secret (the RapidAPI key) set under Edge Functions → Secrets. The free plan allows only a few requests a minute, so the function returns `busy` when rate limited and the app retries next time.

The live scorecard (`/rounds/:id/score`) works out each player's shots from their handicap index using the WHS course handicap (index × slope ÷ 113 + course rating − par), takes 95% for Stableford, and halves it for nine holes. Courses without a card score as par 4s.

## Demo data

`npm run seed` creates two golfers, Paul (the signed-in user) and Steve, with a few rounds, a buddy connection and some chat. It needs the service-role key, which bypasses row-level security, so keep it out of the repo and out of `.env`:

```bash
SUPABASE_SERVICE_ROLE_KEY=... SEED_PASSWORD=... npm run seed
```

Sign in as `paul@buddygolf.test` with `SEED_PASSWORD`. Re-running rebuilds their rounds.
