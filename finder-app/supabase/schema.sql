-- ─────────────────────────────────────────────────────────────────────────────
-- IncludeMe — Supabase schema (v2 — owner & admin-restricted)
-- Run this in your Supabase project: Dashboard → SQL Editor → paste → Run.
-- Safe to re-run (drops + recreates policies each time).
--
-- WHY THIS CHANGED FROM v1:
-- The original policy let ANY signed-in user read every row in the table —
-- including other families' private enquiries (names, emails, phone numbers,
-- messages about their child) and other users' profiles — and let any
-- signed-in user write/delete ANY row, including other businesses' listings,
-- and even approve their own claim or grant themselves "Verified"/"Featured"
-- status for free. This version restricts each row to whoever actually owns
-- it, plus a real admin check (the old admin check in the app was a URL
-- query-param and an email *contains* "admin" check — both easily bypassed).
--
-- ⚠️ ACTION REQUIRED BEFORE RUNNING:
-- Replace 'YOUR-REAL-EMAIL@example.com' below with the email you sign in
-- with. This must exactly match the ADMIN_EMAILS array in src/App.jsx.
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.kv (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);

alter table public.kv enable row level security;

-- Drop any previous policies (old or new names) so this is safe to re-run.
drop policy if exists "kv read" on public.kv;
drop policy if exists "kv write" on public.kv;
drop policy if exists "kv update" on public.kv;
drop policy if exists "kv delete" on public.kv;
drop policy if exists "kv select public" on public.kv;
drop policy if exists "kv select private" on public.kv;
drop policy if exists "kv insert" on public.kv;
drop policy if exists "kv update activity" on public.kv;
drop policy if exists "kv update requests" on public.kv;
drop policy if exists "kv update reviews" on public.kv;
drop policy if exists "kv update own" on public.kv;
drop policy if exists "kv update shared" on public.kv;
drop policy if exists "kv update suggestion" on public.kv;
drop policy if exists "kv delete own" on public.kv;

-- ── Admin check ────────────────────────────────────────────────────────────
-- security definer + stable so it can be used cheaply inside RLS policies.
create or replace function public.is_admin() returns boolean
language sql stable security definer
as $$
  select coalesce(lower(auth.jwt()->>'email'), '') in (
    'paul_whitehouse1@yahoo.co.uk'
    -- add more admin emails here, comma-separated, if you ever need a second admin
  );
$$;

-- ── READ ──────────────────────────────────────────────────────────────────
-- Public catalogue data: listings, reviews, cached venue photos, and
-- non-personal view/save counters. Readable by anyone, including
-- signed-out visitors just browsing the directory.
create policy "kv select public" on public.kv
  for select using (
    key like 'activity:%' or key like 'placephoto:%' or key like 'reviews\_%'
    or key like 'views:%' or key like 'views\_history:%'
    or key like 'saves:%' or key like 'saves\_history:%'
  );

-- Everything else (profiles, claims, enquiries with families' contact
-- details, notification prefs, suggestions, reports) is private: only the
-- owning user, or an admin, may read it.
create policy "kv select private" on public.kv
  for select to authenticated using (
    is_admin()
    or (key like 'user:%' and key = 'user:' || lower(auth.jwt()->>'email'))
    or (key like 'claim:%' and (value->>'userId') = auth.uid()::text)
    or (key like 'verify-request:%' and (value->>'userId') = auth.uid()::text)
    or (key like 'featured-request:%' and (value->>'userId') = auth.uid()::text)
    or (key like 'enquiries:%' and key = 'enquiries:' || auth.uid()::text)
    or (key like 'notif\_sub:%' and key = 'notif_sub:' || auth.uid()::text)
    or (key like 'email\_sub:%' and key = 'email_sub:' || auth.uid()::text)
    or (key like 'report:%' and (value->>'reporterId') = auth.uid()::text)
  );

-- ── INSERT ────────────────────────────────────────────────────────────────
create policy "kv insert" on public.kv
  for insert to authenticated with check (
    is_admin()
    or (key like 'activity:%' and (value->>'ownerId') = auth.uid()::text)
    or (key like 'user:%' and key = 'user:' || lower(auth.jwt()->>'email'))
    or (key like 'claim:%' and (value->>'userId') = auth.uid()::text)
    or (key like 'verify-request:%' and (value->>'userId') = auth.uid()::text)
    or (key like 'featured-request:%' and (value->>'userId') = auth.uid()::text)
    or (key like 'enquiries:%' and key = 'enquiries:' || auth.uid()::text)
    or (key like 'notif\_sub:%' and key = 'notif_sub:' || auth.uid()::text)
    or (key like 'email\_sub:%' and key = 'email_sub:' || auth.uid()::text)
    or (key like 'report:%' and (value->>'reporterId') = auth.uid()::text)
    or key like 'placephoto:%'
    or key like 'reviews\_%'
    or key like 'views:%' or key like 'views\_history:%'
    or key like 'saves:%' or key like 'saves\_history:%'
    or key like 'suggestion:%'
  );

-- ── UPDATE ────────────────────────────────────────────────────────────────
-- Listings: the owner can edit their own listing's details, but cannot
-- grant themselves verified/featured/verifiedPaid status that way — only an
-- admin (after a real payment or manual check) can flip those three flags.
create policy "kv update activity" on public.kv
  for update to authenticated
  using (key like 'activity:%' and ((value->>'ownerId') = auth.uid()::text or is_admin()))
  with check (
    is_admin()
    or (
      (value->>'ownerId') = auth.uid()::text
      and coalesce((value->>'verified')::boolean,false) = coalesce((select (k2.value->>'verified')::boolean from public.kv k2 where k2.key = kv.key),false)
      and coalesce((value->>'featured')::boolean,false) = coalesce((select (k2.value->>'featured')::boolean from public.kv k2 where k2.key = kv.key),false)
      and coalesce((value->>'verifiedPaid')::boolean,false) = coalesce((select (k2.value->>'verifiedPaid')::boolean from public.kv k2 where k2.key = kv.key),false)
    )
  );

-- Claim / verify / feature requests: admin can approve or reject.
-- The claimant themselves can also update their own PENDING claim
-- (e.g. to correct a typo before it's reviewed) but cannot change
-- the status or reassign the userId.
create policy "kv update requests" on public.kv
  for update to authenticated
  using (
    (key like 'claim:%' or key like 'verify-request:%' or key like 'featured-request:%')
    and (
      is_admin()
      or (key like 'claim:%' and (value->>'userId') = auth.uid()::text and (value->>'status') = 'pending')
    )
  )
  with check (
    is_admin()
    or (
      (value->>'userId') = auth.uid()::text
      and (value->>'status') = 'pending'
    )
  );

-- Reviews: any authenticated user may write to a listing's review thread.
-- NOTE / KNOWN LIMITATION: all of a listing's reviews live in one JSON array
-- under a single key, so true per-review-author enforcement (stopping user A
-- from editing user B's review text) isn't possible at this row granularity —
-- that would need reviews moved into their own table, one row per review.
-- This is flagged rather than silently left unaddressed; for now, reporting
-- (see "report:" below) is the safety net for this gap.
create policy "kv update reviews" on public.kv
  for update to authenticated using (key like 'reviews\_%') with check (key like 'reviews\_%');

-- User profile / private prefs / reports: only the owning user (or admin).
create policy "kv update own" on public.kv
  for update to authenticated
  using (
    is_admin()
    or (key like 'user:%' and key = 'user:' || lower(auth.jwt()->>'email'))
    or (key like 'enquiries:%' and key = 'enquiries:' || auth.uid()::text)
    or (key like 'notif\_sub:%' and key = 'notif_sub:' || auth.uid()::text)
    or (key like 'email\_sub:%' and key = 'email_sub:' || auth.uid()::text)
  )
  with check (
    is_admin()
    or (key like 'user:%' and key = 'user:' || lower(auth.jwt()->>'email'))
    or (key like 'enquiries:%' and key = 'enquiries:' || auth.uid()::text)
    or (key like 'notif\_sub:%' and key = 'notif_sub:' || auth.uid()::text)
    or (key like 'email\_sub:%' and key = 'email_sub:' || auth.uid()::text)
  );

-- Shared/non-sensitive: cached photos, view/save counters.
create policy "kv update shared" on public.kv
  for update to authenticated
  using (key like 'placephoto:%' or key like 'views:%' or key like 'views\_history:%' or key like 'saves:%' or key like 'saves\_history:%')
  with check (key like 'placephoto:%' or key like 'views:%' or key like 'views\_history:%' or key like 'saves:%' or key like 'saves\_history:%');

-- Suggestions & reports: only admin can update status (mark actioned/resolved).
create policy "kv update suggestion" on public.kv
  for update to authenticated using ((key like 'suggestion:%' or key like 'report:%') and is_admin()) with check (is_admin());

-- ── DELETE ────────────────────────────────────────────────────────────────
create policy "kv delete" on public.kv
  for delete to authenticated using (
    is_admin()
    or (key like 'activity:%' and (value->>'ownerId') = auth.uid()::text)
    or (key like 'user:%' and key = 'user:' || lower(auth.jwt()->>'email'))
  );

-- NOTE: Supabase projects created after 2026-05-30 require explicit grants for
-- the auto-generated REST API. If reads/writes 401, run:
--   grant usage on schema public to anon, authenticated;
--   grant select on public.kv to anon, authenticated;
--   grant insert, update, delete on public.kv to authenticated;

-- ─────────────────────────────────────────────────────────────────────────────
-- IMPORTANT SETUP STEPS
-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Disable email confirmation for a smooth signup flow during development:
--    Supabase Dashboard → Authentication → Providers → Email
--    → turn OFF "Confirm email". Turn it back ON before public launch.
--
-- 2. User profiles are stored as kv rows: key = "user:email@example.com"
--    Authentication itself (passwords) is handled by Supabase Auth, not kv.
--
-- 3. After running this file, sign in as your admin account and confirm the
--    ⚙️ admin icon appears, and that a second test account does NOT see it.
-- ─────────────────────────────────────────────────────────────────────────────
