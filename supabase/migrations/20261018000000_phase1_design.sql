-- Phase 1 of the redesign: richer profiles and rounds, round chat, avatar
-- storage, auto-accept for buddies, and golfer stats.
-- Prices are information only ("pay at the club"); nothing here charges anyone.

-- Profiles ---------------------------------------------------------------

alter table public.profiles
  add column home_club_id text references public.courses (id) on delete set null,
  add column play_style text[] not null default '{}',
  add column bag jsonb not null default '{}',
  -- Self-declared until the official WHS link exists (build spec, section 9).
  add column handicap_source text not null default 'self' check (handicap_source in ('self', 'official'));

-- Rounds -----------------------------------------------------------------

create type public.round_format as enum ('stableford', 'stroke', 'match', 'scramble');
create type public.round_visibility as enum ('public', 'buddies');

alter table public.rounds
  add column title text,
  add column format public.round_format not null default 'stableford',
  add column walking boolean not null default false,
  add column pace_note text,
  add column green_fee_pence int check (green_fee_pence >= 0),
  add column visibility public.round_visibility not null default 'public',
  add column auto_accept_buddies boolean not null default false;

create function public.is_buddy(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.connections c
    where c.status = 'accepted'
      and (select auth.uid()) in (c.requester_id, c.addressee_id)
      and p_user_id in (c.requester_id, c.addressee_id)
      and c.requester_id <> c.addressee_id
  );
$$;

revoke execute on function public.is_buddy(uuid) from public, anon;
grant execute on function public.is_buddy(uuid) to authenticated;

drop policy "Rounds are visible to signed-in users" on public.rounds;

create policy "Public rounds, or buddies-only rounds for the host and buddies"
  on public.rounds for select to authenticated
  using (
    visibility = 'public'
    or host_id = (select auth.uid())
    or public.is_buddy(host_id)
  );

-- Auto-accept ------------------------------------------------------------

-- A buddy's request to an auto-accept round is accepted straight away, as
-- long as there is still a free place. Runs after the insert so the insert
-- policy (which only allows 'pending') still applies to what the client sent.
create function public.auto_accept_buddy_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.rounds;
  accepted_count int;
begin
  select * into r from public.rounds where id = new.round_id;
  if not r.auto_accept_buddies or r.cancelled or r.tee_time < now() then
    return null;
  end if;
  if not exists (
    select 1 from public.connections c
    where c.status = 'accepted'
      and c.requester_id in (r.host_id, new.user_id)
      and c.addressee_id in (r.host_id, new.user_id)
  ) then
    return null;
  end if;
  select count(*) into accepted_count
  from public.round_requests
  where round_id = new.round_id and status = 'accepted';
  if accepted_count + 1 < r.max_players then
    update public.round_requests set status = 'accepted' where id = new.id;
  end if;
  return null;
end;
$$;

create trigger round_requests_auto_accept
  after insert on public.round_requests
  for each row execute function public.auto_accept_buddy_request();

revoke execute on function public.auto_accept_buddy_request() from public, anon, authenticated;

-- Round chat -------------------------------------------------------------

create function public.is_round_member(p_round_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.rounds r
    where r.id = p_round_id and r.host_id = (select auth.uid())
  ) or exists (
    select 1 from public.round_requests q
    where q.round_id = p_round_id
      and q.user_id = (select auth.uid())
      and q.status = 'accepted'
  );
$$;

revoke execute on function public.is_round_member(uuid) from public, anon;
grant execute on function public.is_round_member(uuid) to authenticated;

create table public.round_messages (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  created_at timestamptz not null default now()
);

create index round_messages_round_id_idx on public.round_messages (round_id, created_at);
create index round_messages_user_id_idx on public.round_messages (user_id);

alter table public.round_messages enable row level security;

create policy "Chat is readable by the host and accepted players"
  on public.round_messages for select to authenticated
  using (public.is_round_member(round_id));

create policy "Host and accepted players can post as themselves"
  on public.round_messages for insert to authenticated
  with check ((select auth.uid()) = user_id and public.is_round_member(round_id));

alter publication supabase_realtime add table public.round_messages;

-- Avatars ----------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

-- Files live in a folder named after the user's id.
create policy "Users upload their own avatar"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users replace their own avatar"
  on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

create policy "Users delete their own avatar"
  on storage.objects for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- Golfer stats -----------------------------------------------------------

-- Rounds played = teed-off rounds the golfer hosted or was accepted into.
-- shows_up_pct stays null ("New") until Phase 2 adds attendance.
create function public.golfer_stats(p_user_id uuid)
returns table (rounds bigint, buddies bigint, shows_up_pct numeric)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.rounds r
      where r.cancelled = false and r.tee_time < now()
        and (r.host_id = p_user_id
          or exists (select 1 from public.round_requests q
                     where q.round_id = r.id and q.user_id = p_user_id and q.status = 'accepted'))),
    (select count(*) from public.connections c
      where c.status = 'accepted' and p_user_id in (c.requester_id, c.addressee_id)),
    null::numeric;
$$;

revoke execute on function public.golfer_stats(uuid) from public, anon;
grant execute on function public.golfer_stats(uuid) to authenticated;
