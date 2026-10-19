-- "I'm free": golfers mark mornings and afternoons they can play over the
-- next week, and how far they'll travel. Hosts see who's free when they
-- have spots to fill, and Discover ranks rounds in your free slots higher.

create type public.day_slot as enum ('am', 'pm');

create table public.availability (
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  day date not null,
  slot public.day_slot not null,
  created_at timestamptz not null default now(),
  primary key (user_id, day, slot)
);

create index availability_day_slot_idx on public.availability (day, slot);

alter table public.availability enable row level security;

-- Sharing when you're free is the point, so any signed-in golfer can read it.
create policy "Signed-in users see who's free"
  on public.availability for select to authenticated using (true);

create policy "Golfers add their own free slots"
  on public.availability for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Golfers remove their own free slots"
  on public.availability for delete to authenticated
  using ((select auth.uid()) = user_id);

alter table public.profiles
  add column search_radius_miles smallint not null default 15 check (search_radius_miles between 1 and 100);
