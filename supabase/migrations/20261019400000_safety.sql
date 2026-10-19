-- Safety: women-only and beginner-friendly rounds, blocking and reporting.
--   * Women-only rounds are seen and joined only by women (plus anyone
--     already in them). Gender is self-declared and optional.
--   * Blocked golfers never see each other's rounds or join them.
--   * Reports are insert-only for golfers; only admins (service role) read them.

alter table public.profiles
  add column gender text check (gender in ('woman', 'man', 'non_binary', 'prefer_not')),
  add column women_only boolean not null default false,
  add column beginner_friendly boolean not null default false;

comment on column public.profiles.gender is 'Self-declared and optional. Only used to let women see and join women-only rounds.';
comment on column public.profiles.women_only is 'Show me only women-only games.';
comment on column public.profiles.beginner_friendly is 'Show me only beginner-friendly games.';

alter table public.rounds
  add column women_only boolean not null default false,
  add column beginner_friendly boolean not null default false;

-- Blocks ----------------------------------------------------------------------

create table public.blocks (
  blocker_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create index blocks_blocked_id_idx on public.blocks (blocked_id);

alter table public.blocks enable row level security;

create policy "Golfers see who they've blocked"
  on public.blocks for select to authenticated using ((select auth.uid()) = blocker_id);
create policy "Golfers block others"
  on public.blocks for insert to authenticated with check ((select auth.uid()) = blocker_id);
create policy "Golfers unblock"
  on public.blocks for delete to authenticated using ((select auth.uid()) = blocker_id);

-- True when either golfer has blocked the other.
create function public.is_blocked_between(p_a uuid, p_b uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.blocks b
    where (b.blocker_id = p_a and b.blocked_id = p_b) or (b.blocker_id = p_b and b.blocked_id = p_a)
  );
$$;

revoke execute on function public.is_blocked_between(uuid, uuid) from public, anon;
grant execute on function public.is_blocked_between(uuid, uuid) to authenticated;

create function public.is_woman(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.profiles p where p.id = p_user_id and p.gender = 'woman');
$$;

revoke execute on function public.is_woman(uuid) from public, anon;
grant execute on function public.is_woman(uuid) to authenticated;

-- Reports ---------------------------------------------------------------------

create type public.report_reason as enum ('no_show', 'abusive', 'unsafe', 'fake_profile', 'payment');

create table public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  reported_id uuid not null references public.profiles (id) on delete cascade,
  round_id uuid references public.rounds (id) on delete set null,
  reason public.report_reason not null,
  details text check (char_length(details) <= 1000),
  created_at timestamptz not null default now(),
  check (reporter_id <> reported_id)
);

create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_reported_id_idx on public.reports (reported_id);
create index reports_round_id_idx on public.reports (round_id);

alter table public.reports enable row level security;

-- Insert only: there is deliberately no select policy for golfers.
create policy "Golfers file reports"
  on public.reports for insert to authenticated with check ((select auth.uid()) = reporter_id);

-- Round visibility ------------------------------------------------------------

-- Both existing select policies on rounds (one is a leftover duplicate) get
-- the same rule: you always see your own rounds and ones you're in;
-- otherwise not if either of you blocked the other, buddies-only rounds only
-- if you're a buddy, and women-only rounds only if you're a woman.
alter policy "Public rounds, or buddies-only rounds for the host and buddies" on public.rounds
  using (
    host_id = (select auth.uid())
    or public.is_round_member(id)
    or (
      not public.is_blocked_between((select auth.uid()), host_id)
      and (visibility = 'public' or public.is_buddy(host_id))
      and (not women_only or public.is_woman((select auth.uid())))
    )
  );

alter policy "Rounds are visible to signed-in users" on public.rounds
  using (
    host_id = (select auth.uid())
    or public.is_round_member(id)
    or (
      not public.is_blocked_between((select auth.uid()), host_id)
      and (visibility = 'public' or public.is_buddy(host_id))
      and (not women_only or public.is_woman((select auth.uid())))
    )
  );

-- Joining: also refuse blocked golfers and men joining women-only rounds.
create or replace function public.check_round_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.rounds;
  accepted_count int;
begin
  if tg_op = 'UPDATE' then
    if new.round_id <> old.round_id or new.user_id <> old.user_id then
      raise exception 'round_id and user_id cannot be changed';
    end if;
    if new.status <> old.status then
      new.responded_at := now();
    end if;
  end if;

  select * into r from public.rounds where id = new.round_id;

  if tg_op = 'INSERT' and (r.cancelled or r.tee_time < now()) then
    raise exception 'This round is no longer open';
  end if;

  if tg_op = 'INSERT' and public.is_blocked_between(new.user_id, r.host_id) then
    raise exception 'You can''t join this round';
  end if;

  if tg_op = 'INSERT' and r.women_only and not public.is_woman(new.user_id) then
    raise exception 'This round is for women only';
  end if;

  if new.status = 'accepted' and (tg_op = 'INSERT' or old.status <> 'accepted') then
    select count(*) into accepted_count
    from public.round_requests
    where round_id = new.round_id and status = 'accepted';
    if accepted_count + 1 >= r.max_players then
      raise exception 'This round is full';
    end if;
  end if;

  return new;
end;
$$;
