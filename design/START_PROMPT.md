# Prompts to paste into Claude Code

Paste these one at a time, in order. Start each in a fresh session on this repository, and only move on once the previous phase is merged.

---

## Prompt 1: Phase 1 (core loop)

```
We're rebuilding BuddyGolf to match a new design. Before writing any code, read:
- design/BUILD_SPEC.md (the full spec — product rules, design tokens, screens, data model, phases)
- design/mockup/index.html (the mockup; copy its markup and styles closely)
- the screen images in design/screens/ for 01-Main, 02-Discover, 03-Round, 04-Host, 11-Book, 07-Profile and 08-Brand
- README.md and supabase/migrations/ for the current schema

Then build Phase 1 from section 7 of the spec:
1. Add the design tokens and fonts to src/index.css (Tailwind v4 @theme) and build the src/components/ui components.
2. Replace the bottom nav with the new 5-tab bar.
3. Write a migration for the Phase 1 data model changes, with RLS, and regenerate src/lib/database.types.ts.
4. Build Home, Discover, Round detail, Host a round (2 steps), Host requests, Profile (view and edit) and round chat. Restyle Login and Courses to match.
5. Add a seed script with only two golfers: Paul (the signed-in user) and Steve.

Rules: no payments between golfers anywhere (prices are information only, "pay at the club"); hosting is always free; follow section 9 of the spec for tee times and handicaps.

Show me your plan before you start coding. Work in small commits, and run npm run build and npm run lint before each one.
```

---

## Prompt 2: Phase 2 (play and trust)

```
Read design/BUILD_SPEC.md again. Phase 1 is done. Build Phase 2 from section 7: live scorecard (screen 05), recap + kudos + rebook (06), reliability score, I'm free availability (10), Need a player alerts with Web Push (09), verification and safety settings (12), and block and report (13). Use the data model and logic in sections 5 and 6. Show me your plan first.
```

---

## Prompt 3: Phase 3 (groups)

```
Read design/BUILD_SPEC.md. Build Phase 3: Societies (screen 14), Leagues + ladders (15), Events (16), Range + practice (17) and Stats (19). No payments: entry fees are paid to the club on the day. Show me your plan first.
```

---

## Prompt 4: Phase 4 (Plus and extras)

```
Read design/BUILD_SPEC.md. Build Phase 4: the BuddyGolf Plus subscription (screen 23, section 8) with Stripe Checkout and a webhook in a Supabase Edge Function. This is the only payment in the app. Then add the free-tier limits as a database trigger behind a feature flag (off by default), Perks (24), Kit swap (22), Travel mode (21) and the Club dashboard (25). Show me your plan first.
```
