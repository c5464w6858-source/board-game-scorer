-- BuddyGolf core model: golfer profiles, hosted rounds, join requests, and
-- golfer-to-golfer connections.

-- Profiles ---------------------------------------------------------------

alter table public.profiles
  add column handicap numeric(3, 1) check (handicap between -10 and 54),
  add column home_area text,
  add column bio text,
  add column avatar_url text;

-- Rounds -----------------------------------------------------------------

create table public.rounds (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  course_name text not null,
  location text,
  tee_time timestamptz not null,
  -- Total players including the host, so 4 means the host plus 3 others.
  max_players smallint not null default 4 check (max_players between 2 and 4),
  holes smallint not null default 18 check (holes in (9, 18)),
  min_handicap numeric(3, 1),
  max_handicap numeric(3, 1),
  notes text,
  cancelled boolean not null default false,
  created_at timestamptz not null default now()
);

create index rounds_host_id_idx on public.rounds (host_id);
create index rounds_tee_time_idx on public.rounds (tee_time);

alter table public.rounds enable row level security;

create policy "Rounds are visible to signed-in users"
  on public.rounds for select to authenticated using (true);

create policy "Users can host rounds"
  on public.rounds for insert to authenticated
  with check ((select auth.uid()) = host_id);

create policy "Hosts can update their rounds"
  on public.rounds for update to authenticated
  using ((select auth.uid()) = host_id) with check ((select auth.uid()) = host_id);

create policy "Hosts can delete their rounds"
  on public.rounds for delete to authenticated
  using ((select auth.uid()) = host_id);

-- Round requests ---------------------------------------------------------

create type public.request_status as enum ('pending', 'accepted', 'declined', 'withdrawn');

create table public.round_requests (
  id uuid primary key default gen_random_uuid(),
  round_id uuid not null references public.rounds (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  status public.request_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  unique (round_id, user_id)
);

create index round_requests_user_id_idx on public.round_requests (user_id);

alter table public.round_requests enable row level security;

create function public.is_round_host(p_round_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.rounds r
    where r.id = p_round_id and r.host_id = (select auth.uid())
  );
$$;

-- Accepted players are public so anyone browsing a round can see who's in;
-- pending/declined requests are only visible to the requester and the host.
create policy "Requests visible to requester, host, or when accepted"
  on public.round_requests for select to authenticated
  using (
    status = 'accepted'
    or (select auth.uid()) = user_id
    or public.is_round_host(round_id)
  );

create policy "Users can request to join rounds they don't host"
  on public.round_requests for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and status = 'pending'
    and not public.is_round_host(round_id)
  );

create policy "Requesters can withdraw"
  on public.round_requests for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id and status = 'withdrawn');

create policy "Hosts can accept or decline"
  on public.round_requests for update to authenticated
  using (public.is_round_host(round_id))
  with check (public.is_round_host(round_id) and status in ('accepted', 'declined'));

-- Keeps round_id/user_id fixed, stamps responses, and stops a round being
-- overfilled or joined after it's cancelled or teed off.
create function public.check_round_request()
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

create trigger round_requests_check
  before insert or update on public.round_requests
  for each row execute function public.check_round_request();

-- Connections ------------------------------------------------------------

create table public.connections (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  addressee_id uuid not null references public.profiles (id) on delete cascade,
  status public.request_status not null default 'pending',
  created_at timestamptz not null default now(),
  responded_at timestamptz,
  check (requester_id <> addressee_id)
);

-- One connection per pair of golfers, whichever of them asked first.
create unique index connections_pair_idx on public.connections (
  least(requester_id, addressee_id), greatest(requester_id, addressee_id)
);
create index connections_addressee_id_idx on public.connections (addressee_id);

alter table public.connections enable row level security;

create policy "Connections visible to both golfers"
  on public.connections for select to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

create policy "Users can send connection requests"
  on public.connections for insert to authenticated
  with check ((select auth.uid()) = requester_id and status = 'pending');

create policy "Addressees can accept or decline"
  on public.connections for update to authenticated
  using ((select auth.uid()) = addressee_id)
  with check ((select auth.uid()) = addressee_id and status in ('accepted', 'declined'));

create policy "Either golfer can remove a connection"
  on public.connections for delete to authenticated
  using ((select auth.uid()) in (requester_id, addressee_id));

create function public.check_connection_update()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.requester_id <> old.requester_id or new.addressee_id <> old.addressee_id then
    raise exception 'requester_id and addressee_id cannot be changed';
  end if;
  if new.status <> old.status then
    new.responded_at := now();
  end if;
  return new;
end;
$$;

create trigger connections_check
  before update on public.connections
  for each row execute function public.check_connection_update();
