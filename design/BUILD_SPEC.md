# BuddyGolf: build spec

This is the brief for turning the redesign into the real app. Read it in full before building any screen.

- **Mockup:** `design/mockup/index.html`. Open it in a browser. All 25 screens, with the exact markup and inline styles to copy.
- **Screen images:** `design/screens/NN-Name.png`, one per screen, numbered in the order below.
- **Existing app:** Vite + React 19 + TypeScript + Tailwind v4 + Supabase, hosted on Netlify. See `README.md` for the current data model.

The mockup is the visual source of truth. This file is the source of truth for behaviour, data and scope. Where they disagree, this file wins.

---

## 1. What BuddyGolf is

"Tinder for golf." Golfers host rounds with open spots, other golfers find and request to join them, and then they play together. The core loop is **find a game → join → play → rate → rebook**.

## 2. Product rules (non-negotiable)

1. **No payments between golfers in the app.** Green fees, event fees, society fees and kit sales are all paid in person (at the pro shop on the day, or face to face). The app shows prices as information only, with wording like "£38 · pay at the club" or "Nothing to pay in the app". This avoids anyone being out of pocket when someone doesn't show up. The **only** thing the app charges for is the BuddyGolf Plus subscription (section 8).
2. **Hosting is always free and unlimited.** Hosts create the supply. Never put hosting behind a paywall.
3. **Sample data uses only two people: Paul (the signed-in user, "You") and Steve.** The mockup is drawn from Paul's point of view. In seed and demo data, never add other named people. Show unfilled places as dashed "open spot" circles.
4. **No sponsor takeovers or pop-up ads.** Partner offers appear only on the opt-in Perks screen. Don't name brands: use `[PARTNER OFFER]` placeholders until real partners sign.
5. **Never sell user data.** Clubs only see golfers who opted in to hearing from clubs.

## 3. Design system

Copy these into `src/index.css` with Tailwind v4 `@theme` so they become utilities (`bg-fairway`, `text-muted`, etc.).

### Colours
| Token | Hex | Use |
|---|---|---|
| `fairway` | `#0E1F16` | Dark surfaces, primary text, dark buttons |
| `fairway-2` | `#17301F` | Cards on dark surfaces |
| `fairway-line` | `#2A4033` / `#2F4A3A` | Borders and tracks on dark surfaces |
| `green` (brand) | `#137A3A` | Primary buttons, links, selected states |
| `green-dark` | `#0E5C2B` | Link hover, text on `green-tint` |
| `green-tint` | `#E4F3E8` | Match badges, success panels, highlighted rows |
| `flag` (accent) | `#C8F169` | Accent on dark surfaces only: CTAs, live dot, key numbers |
| `clubhouse` (page bg) | `#F5F4EF` | App background |
| `card` | `#FFFFFF` | Cards |
| `line` | `#E3E1D8` | Card borders |
| `line-soft` | `#ECEAE2` | Row dividers inside cards |
| `chip` | `#F0EEE7` | Neutral tags |
| `segment` | `#E9E7DF` | Segmented-control track |
| `muted` | `#5B6660` | Secondary text (passes 4.5:1 on white and clubhouse) |
| `muted-dark` | `#B9C7BE` | Secondary text on dark surfaces |
| `alert` | `#E5532D` | Notification dot |
| `danger` | `#B83A1C` | Destructive buttons (Send report) |
| `amber` | `#E5A23B` | Club dashboard "under-filled" bars only |

### Type (Google Fonts)
- **Bricolage Grotesque** 500/700/800: headlines. Use tight tracking (`-0.02em` to `-0.04em`). H1 on screens is 28–30px/800.
- **Geist** 400/500/600: body, 15px base.
- **Geist Mono** 500/600: every number (scores, handicaps, prices, times, match %).
- Section labels: 12px, 600, uppercase, `letter-spacing: 0.08em`, `muted`.

### Shape and spacing
- Cards: 16–20px radius, 1px `line` border, white. Hero cards: 24–28px radius.
- Buttons and chips are pills (`border-radius: 999px`). Primary CTA is 54–58px tall. Minimum touch target is 44px.
- Screen padding is 20px. Gaps are 8 / 12 / 14 / 18 / 22px.
- The brand mark is the "bg" monogram: an inline SVG rounded square in `green` with white strokes. Copy it from the Home screen in the mockup.
- Icons are 1.8–2px stroke inline SVGs (Lucide-style). Never emoji.
- Open spots are **always** dashed circles.

### Components to build first (`src/components/ui/`)
`Button` (primary green, dark, outline, flag-on-dark, danger), `Chip`/`Tag`, `MatchBadge`, `Avatar` + `AvatarStack` (with dashed open spots), `Card`, `SectionLabel`, `Segmented`, `Toggle row`, `Stat tile`, `BottomTabBar` (Home, Discover, centre ＋ Host, Chats, You), `ScreenHeader` (back/close 44px circle), `Sheet` (bottom sheet).

## 4. Screens

Status key: **P1–P4** is the build phase (section 7). Route names are suggestions.

| # | Screen | Route | Phase | What it does |
|---|---|---|---|---|
| 01 | Home | `/` | P1 | Greeting, next-round hero card (tee time, weather, lineup, "Open round"), Find a game / Host a round tiles, "Picked for you" carousel, buddy activity line. |
| 02 | Discover | `/discover` | P1 | Swipeable match cards (Cards/Map toggle, filter chips). Each card shows match %, host, spots, vibe tags, "£38, pay at club" and "Why you match" reasons. Skip / Request to join / Save buttons, plus the "1 of 2 free rounds left · Go unlimited" line. |
| 03 | Round detail | `/rounds/:id` | P1 | Hero photo, title, course, 4 lineup slots (host outlined, pending you faded "Requested"), details grid (format, holes, pace, green fee "pay at the club"), round chat preview, sticky footer (Request to join → Request sent + Withdraw). |
| 04 | Host a round | `/host` | P1 | Course search (from `courses`), date chips, tee-time chips, format segmented control, who-can-join radios, auto-accept buddies toggle. |
| 11 | Pick tee time | `/host/time` | P1 | Step 2 of hosting: slot list, who's playing, the "Nothing to pay in the app" panel, "Hold tee time and post round". See section 9 for tee-sheet data. |
| — | Host requests (not in mockup) | `/rounds/:id/requests` | P1 | Host sees pending requesters (avatar, handicap, reliability, kudos) and accepts or declines. Build it in the same style; the data already exists in `round_requests`. |
| 07 | Profile | `/me`, `/golfers/:id` | P1 | Avatar, name, area, home club, handicap card with trend sparkline, stats tiles (rounds, buddies, shows-up %), "How I play" tags, kudos counts, In the bag. |
| 05 | Live scorecard | `/rounds/:id/score` | P2 | Dark screen. Hole number, par/yards/SI, progress bar, per-player −/＋ stroke steppers, auto Stableford points, live leaderboard. |
| 06 | Recap + kudos | `/rounds/:id/recap` | P2 | Result header, gross/fairways/putts, kudos chips per player, ＋Buddy, Share card, Rebook this four. |
| 09 | Need a player | push → `/rounds/:id` | P2 | Urgent alert: countdown to tee off, lineup, "At the club £29", weather, drive time, "I'm in" (first to say yes gets the spot). |
| 10 | I'm free | `/free` | P2 | AM/PM availability grid for 7 days, calendar sync (busy slots struck through), radius, hosts already matching. |
| 12 | Verification + safety | `/me/safety` | P2 | Phone, selfie check, official handicap. Toggles for verified-only, women-only and beginner-friendly games. |
| 13 | Block + report | sheet | P2 | Reasons, optional details, "Also block them". |
| 14 | Society | `/societies/:id` | P3 | Next fixture (pay the club on the day, confirmed 14/16), order of merit, Fixtures / Who's in / Results. |
| 15 | Leagues + ladders | `/compete` | P3 | Match-play ladder (rank, challenge players above you with shots given) and a free monthly Stableford league (best 3 cards, champion badge). |
| 16 | Events | `/events` | P3 | BuddyGolf-run events. Sign up free, pay the club on the day. |
| 17 | Range + practice | `/practice` | P3 | Practice sessions others are hosting, "I'm going to the range", lesson link to Perks. |
| 19 | Stats | `/me/stats` | P3 | Avg Stableford, fairways, GIR, putts, over par by hole type, one "biggest saving" insight. Last 5 rounds free, full history with Plus. |
| 23 | BuddyGolf Plus | `/plus` | P4 | Usage meter, Free vs Plus table (section 8), yearly/monthly plans, 14-day trial. |
| 24 | Perks | `/perks` | P4 | Opt-in partner offers (lessons, trips, kit, insurance) with placeholders. |
| 22 | Kit swap | `/kit` | P4 | Second-hand listings. Agree a price in chat and pay in person. |
| 21 | Travel mode | `/travel` | P4 | Show games near a holiday destination, plan a buddy trip. |
| 25 | Club dashboard | separate web app or `/club` | P4 | B2B: rounds via BuddyGolf, green-fee revenue, new visitors, membership leads, fill by day, quiet slots to promote. |
| 18 | GPS yardages | — | Later | Needs hole geometry data and probably native. |
| 20 | Apple Watch | — | Later | Needs a native app. |
| 08 | Brand system | — | — | Reference only. |

## 5. Data model changes

Existing tables: `profiles`, `rounds` (with `course_id`), `round_requests`, `connections` (buddies), `courses`. Add new migrations under `supabase/migrations/`. Every new table gets row-level security in the same style as the existing ones. Regenerate `src/lib/database.types.ts` after each migration.

**P1**
- `profiles`: add `home_area text`, `bio text`, `avatar_url text`, `home_club_id text references courses`, `play_style text[]` (e.g. early tee times, walking, small stakes, stays for one), `bag jsonb`.
- `rounds`: add `format` (enum: stableford, stroke, match, scramble), `walking boolean`, `pace_note text`, `green_fee_pence int` (information only, never charged), `visibility` (enum: public, buddies), `auto_accept_buddies boolean`, `title text`.
- `round_messages` (round_id, user_id, body, created_at). Readable and writable only by the host and accepted players.
- Storage bucket `avatars`.

**P2**
- `scores` (round_id, user_id, hole smallint, strokes smallint, unique per round/user/hole). Writable by the player and the host.
- `kudos` (round_id, from_id, to_id, tag enum: great_company, kept_the_pace, clutch_putter, would_play_again). Hidden from the recipient until every player in the round has submitted, or 24 hours after tee time.
- `attendance` (round_id, user_id, showed_up boolean): feeds the "shows up %" reliability score.
- `availability` (user_id, day date, slot enum am/pm) plus `profiles.search_radius_miles`.
- `rounds.urgent boolean` for "need a player": when true, the first accepted request wins.
- `profiles.phone_verified`, `photo_verified`, `women_only`, `beginner_friendly`, `verified_only` flags. Also add `rounds.women_only` and `rounds.beginner_friendly`.
- `blocks` (blocker_id, blocked_id). Blocked users never see each other's rounds.
- `reports` (reporter_id, reported_id, round_id, reason enum, details). Insert-only for users and readable only by admins.
- `push_subscriptions` for Web Push.

**P3:** `societies`, `society_members`, `fixtures`, `fixture_entries`, `ladders`, `ladder_entries`, `challenges`, `leagues`, `league_cards`, `events`, `event_entries`, `practice_sessions`.

**P4:** `subscriptions` (user_id, plan, status, current_period_end, provider ids), `listings` (kit), `clubs` + `club_staff` for the dashboard.

## 6. Logic to implement

**Match score (0–100) on Discover cards.** Keep it a simple, explainable formula and show the top two reasons:
- Handicap closeness: 35 points, scaled down to 0 at a 15-shot gap.
- Distance from home area: 25 points, falling to 0 at the user's search radius.
- Time slot in the user's availability: 15 points.
- Played together before or a buddy is in the round: 15 points.
- Shared play-style tags: 10 points.

**Stableford.** Points per hole = `max(0, par + shots_received − strokes + 2)`. Shots received come from the playing handicap against the hole stroke index. Use the WHS course-handicap formula when slope and rating are available; otherwise use the handicap index rounded.

**Reliability.** Shows-up % = attended ÷ (attended + no-shows) over the last 20 accepted rounds. New golfers show "New".

**Free-tier limits** (enforce in the database with a trigger on `round_requests`, not only in the UI):
- A free user can have **1 pending request** at a time. Plus can have 5.
- A free user can be **accepted into 2 rounds per calendar month** (UK time). Plus is unlimited. Rounds the user hosts never count.
- When a limit is hit, return a clear error and show the Plus screen.

## 7. Build phases

**Phase 1: core loop (start here).** Design tokens and `ui` components, new bottom tab bar, Home, Discover, Round detail, Host (2 steps), Host requests, Profile view and edit, round chat (Supabase Realtime). Restyle the existing Login and Courses pages to the new design. Seed script with Paul and Steve only.

**Phase 2: play and trust.** Scorecard, Recap + kudos + rebook, reliability, I'm free, Need a player with Web Push, verification (phone OTP through Supabase Auth), safety filters, block and report.

**Phase 3: groups.** Societies, leagues and ladders, events, practice sessions, stats.

**Phase 4: money.** Plus subscription with Stripe Checkout and the customer portal. A webhook in a Supabase Edge Function writes `subscriptions`. This is the only payment in the app. Then the free-tier limits, Perks, Kit swap, Travel mode and the Club dashboard.

**Later:** GPS yardages and Apple Watch (native).

## 8. BuddyGolf Plus

£3.99/month or £29.99/year, with a 14-day free trial.

| | Free | Plus |
|---|---|---|
| Rounds you join | 2 a month | Unlimited |
| Join requests waiting at once | 1 | 5 |
| Rounds you host | Unlimited | Unlimited |
| Shown first on the host's request list | – | Yes |
| "Need a player" alerts | Standard | 10 minutes early |
| Filters | Basic (date, distance, handicap) | All (pace, format, walking, women-only, etc.) |
| Stats | Last 5 rounds | Full history |
| See who viewed you | – | Yes |

Ship with limits **switched off** (a feature flag) until the launch area has enough games, then turn them on.

## 9. Known constraints (don't fake these)

- **Tee sheets:** there's no public UK tee-time API (BRS and GolfNow don't offer one; see README). Until a club partners with us, "Pick tee time" lets the host **type** the time they've booked with the club. Show a "Book with the club" button using `courses.booking_url` or the website. Show "Live from the club's tee sheet" only for partner clubs later.
- **Official handicap (WHS):** linking needs England Golf / DotGolf API approval. Until then the handicap is self-declared and marked "Self-declared". "Official" appears only once linked.
- **Weather:** use a free forecast API (e.g. Open-Meteo, no key needed) by course lat/lon. Show it only within 7 days of tee time.
- **Photos:** the images in `design/mockup/assets` are placeholders from the old pitch deck. Check the licence before using them in production.
- **OpenStreetMap:** keep the "© OpenStreetMap contributors" credit wherever course data or maps appear.

## 10. Quality bar

- Mobile-first, 390px wide. On desktop, centre the app at max-width ~480px.
- Every screen needs loading, empty and error states. Empty states invite action, e.g. "No games near you yet. Host one."
- Use real `<button>`, `<a>` and `<label>` elements. Icon-only buttons get `aria-label`. Text meets 4.5:1 contrast.
- `npm run build` and `npm run lint` must pass before each commit.
- Keep components small and typed. Data access goes through `src/lib/` helpers, never ad-hoc queries scattered in pages.
