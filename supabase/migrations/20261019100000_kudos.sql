-- Kudos after a round: players tag each other (great company, kept the pace,
-- clutch putter, would play again). A golfer only sees kudos given to them
-- once every player has given theirs, or 24 hours after tee time, so nobody
-- gives kudos just to get some back.

create type public.kudos_tag as enum ('great_company', 'kept_the_pace', 'clutch_putter', 'would_play_again');

create table public.kudos (
  round_id uuid not null references public.rounds (id) on delete cascade,
  from_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  to_id uuid not null references public.profiles (id) on delete cascade,
  tag public.kudos_tag not null,
  created_at timestamptz not null default now(),
  primary key (round_id, from_id, to_id, tag),
  check (from_id <> to_id)
);

create index kudos_to_id_idx on public.kudos (to_id);
create index kudos_from_id_idx on public.kudos (from_id);

-- True once every player in the round has given kudos, or a day after tee time.
create function public.kudos_revealed(p_round_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.rounds r
    where r.id = p_round_id
      and (
        r.tee_time + interval '24 hours' < now()
        or (select count(distinct k.from_id) from public.kudos k where k.round_id = r.id)
           >= 1 + (select count(*) from public.round_requests q where q.round_id = r.id and q.status = 'accepted')
      )
  );
$$;

revoke execute on function public.kudos_revealed(uuid) from public, anon;
grant execute on function public.kudos_revealed(uuid) to authenticated;

alter table public.kudos enable row level security;

create policy "Givers see their kudos; recipients once revealed"
  on public.kudos for select to authenticated
  using (
    (select auth.uid()) = from_id
    or ((select auth.uid()) = to_id and public.kudos_revealed(round_id))
  );

-- Only players in the round, about each other, from two hours before tee time.
create policy "Players give kudos to each other"
  on public.kudos for insert to authenticated
  with check (
    (select auth.uid()) = from_id
    and public.is_round_player(round_id, from_id)
    and public.is_round_player(round_id, to_id)
    and exists (
      select 1 from public.rounds r
      where r.id = round_id and r.tee_time - interval '2 hours' < now()
    )
  );

create policy "Givers take back their kudos"
  on public.kudos for delete to authenticated
  using ((select auth.uid()) = from_id);
