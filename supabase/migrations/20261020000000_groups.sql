-- Societies, trips and events: a group of golfers with a schedule of rounds,
-- scores for each round and an overall leaderboard. Golfers join with the
-- group's invite code. Nothing is paid in the app.

create type public.group_kind as enum ('society', 'trip', 'event');
create type public.group_role as enum ('organiser', 'member');

create table public.groups (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  kind public.group_kind not null default 'society',
  description text check (char_length(description) <= 500),
  location text check (char_length(location) <= 80),
  starts_on date,
  ends_on date check (ends_on is null or starts_on is null or ends_on >= starts_on),
  -- Short code golfers type or open as a link to join.
  invite_code text not null unique default upper(substr(md5(gen_random_uuid()::text), 1, 6)),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

create index groups_owner_id_idx on public.groups (owner_id);

create table public.group_members (
  group_id uuid not null references public.groups (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  role public.group_role not null default 'member',
  joined_at timestamptz not null default now(),
  primary key (group_id, user_id)
);

create index group_members_user_id_idx on public.group_members (user_id);

-- One round of the group's schedule, e.g. day 2 of a trip.
create table public.group_rounds (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references public.groups (id) on delete cascade,
  title text check (char_length(title) <= 60),
  course_id text references public.courses (id) on delete set null,
  course_name text not null,
  tee_id text references public.course_tees (id) on delete set null,
  tee_time timestamptz not null,
  holes smallint not null default 18 check (holes in (9, 18)),
  created_at timestamptz not null default now()
);

create index group_rounds_group_id_idx on public.group_rounds (group_id, tee_time);
create index group_rounds_course_id_idx on public.group_rounds (course_id);
create index group_rounds_tee_id_idx on public.group_rounds (tee_id);

create table public.group_scores (
  group_round_id uuid not null references public.group_rounds (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  hole smallint not null check (hole between 1 and 18),
  strokes smallint not null check (strokes between 1 and 20),
  updated_by uuid default auth.uid() references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (group_round_id, user_id, hole)
);

create index group_scores_user_id_idx on public.group_scores (user_id);
create index group_scores_updated_by_idx on public.group_scores (updated_by);

-- Helpers (security definer so policies can use them without recursion) ----

create function public.is_group_member(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members m where m.group_id = p_group_id and m.user_id = (select auth.uid())
  );
$$;

create function public.is_group_organiser(p_group_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.group_members m
    where m.group_id = p_group_id and m.user_id = (select auth.uid()) and m.role = 'organiser'
  );
$$;

-- The group a group round belongs to, for score policies.
create function public.group_of_round(p_group_round_id uuid)
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select r.group_id from public.group_rounds r where r.id = p_group_round_id;
$$;

create function public.is_member_of_group(p_group_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.group_members m where m.group_id = p_group_id and m.user_id = p_user_id);
$$;

revoke execute on function public.is_group_member(uuid) from public, anon;
revoke execute on function public.is_group_organiser(uuid) from public, anon;
revoke execute on function public.group_of_round(uuid) from public, anon;
revoke execute on function public.is_member_of_group(uuid, uuid) from public, anon;
grant execute on function public.is_group_member(uuid) to authenticated;
grant execute on function public.is_group_organiser(uuid) to authenticated;
grant execute on function public.group_of_round(uuid) to authenticated;
grant execute on function public.is_member_of_group(uuid, uuid) to authenticated;

-- Whoever creates a group is its first organiser.
create function public.add_group_owner()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.group_members (group_id, user_id, role) values (new.id, new.owner_id, 'organiser');
  return null;
end;
$$;

revoke execute on function public.add_group_owner() from public, anon, authenticated;

create trigger groups_add_owner
  after insert on public.groups
  for each row execute function public.add_group_owner();

-- Join with an invite code. Returns the group's id.
create function public.join_group(p_code text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  g uuid;
begin
  select id into g from public.groups where invite_code = upper(trim(p_code));
  if g is null then
    raise exception 'No group with that code';
  end if;
  insert into public.group_members (group_id, user_id) values (g, (select auth.uid()))
  on conflict do nothing;
  return g;
end;
$$;

revoke execute on function public.join_group(text) from public, anon;
grant execute on function public.join_group(text) to authenticated;

-- Row-level security -------------------------------------------------------

alter table public.groups enable row level security;
alter table public.group_members enable row level security;
alter table public.group_rounds enable row level security;
alter table public.group_scores enable row level security;

create policy "Members see their groups" on public.groups
  for select to authenticated using (public.is_group_member(id) or owner_id = (select auth.uid()));
create policy "Golfers create groups" on public.groups
  for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy "Organisers edit groups" on public.groups
  for update to authenticated using (public.is_group_organiser(id)) with check (public.is_group_organiser(id));
create policy "Owners delete groups" on public.groups
  for delete to authenticated using ((select auth.uid()) = owner_id);

create policy "Members see each other" on public.group_members
  for select to authenticated using (public.is_group_member(group_id));
create policy "Organisers change members" on public.group_members
  for update to authenticated using (public.is_group_organiser(group_id)) with check (public.is_group_organiser(group_id));
create policy "Members leave, organisers remove" on public.group_members
  for delete to authenticated using ((select auth.uid()) = user_id or public.is_group_organiser(group_id));

create policy "Members see the schedule" on public.group_rounds
  for select to authenticated using (public.is_group_member(group_id));
create policy "Organisers add rounds" on public.group_rounds
  for insert to authenticated with check (public.is_group_organiser(group_id));
create policy "Organisers change rounds" on public.group_rounds
  for update to authenticated using (public.is_group_organiser(group_id)) with check (public.is_group_organiser(group_id));
create policy "Organisers remove rounds" on public.group_rounds
  for delete to authenticated using (public.is_group_organiser(group_id));

create policy "Members see scores" on public.group_scores
  for select to authenticated using (public.is_group_member(public.group_of_round(group_round_id)));
-- Any member can mark a card for anyone in the group: on trips one golfer
-- usually keeps score for the fourball.
create policy "Members add scores" on public.group_scores
  for insert to authenticated with check (
    public.is_group_member(public.group_of_round(group_round_id))
    and public.is_member_of_group(public.group_of_round(group_round_id), user_id)
  );
create policy "Members change scores" on public.group_scores
  for update to authenticated using (public.is_group_member(public.group_of_round(group_round_id)))
  with check (public.is_member_of_group(public.group_of_round(group_round_id), user_id));
create policy "Members clear scores" on public.group_scores
  for delete to authenticated using (public.is_group_member(public.group_of_round(group_round_id)));

alter publication supabase_realtime add table public.group_scores;
