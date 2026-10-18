-- Sign-up name, first-run profile setup, and the golfer's private club
-- preferences. Clubs only ever see golfers who opt in (build spec, rule 5).

-- Use the name given at sign-up, falling back to the email's local part.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''), split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

alter table public.profiles
  -- Set when the golfer finishes (or skips) first-run setup.
  add column onboarded_at timestamptz,
  -- Shown on the profile as "Member, <club>" rather than "Plays at <club>".
  add column home_club_member boolean not null default false;

-- Existing golfers have already been using the app, so don't send them
-- through setup.
update public.profiles set onboarded_at = now() where onboarded_at is null;

-- Private to the golfer. Kept out of profiles because every signed-in user
-- can read profiles.
create table public.golfer_preferences (
  user_id uuid primary key default auth.uid() references public.profiles (id) on delete cascade,
  looking_for_membership boolean not null default false,
  play_frequency text check (play_frequency in ('weekly', 'fortnightly', 'monthly', 'occasionally')),
  -- Opt-in only. Clubs never see a golfer unless this is true.
  clubs_can_contact boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.golfer_preferences enable row level security;

create policy "Golfers read their own preferences"
  on public.golfer_preferences for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Golfers create their own preferences"
  on public.golfer_preferences for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Golfers update their own preferences"
  on public.golfer_preferences for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
