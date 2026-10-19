-- Phase 2 scoring: course scorecards (from the UK Golf Course API, cached on
-- first use) and live hole-by-hole scores for each round.

-- Course scorecards ---------------------------------------------------------

alter table public.courses
  add column golfapi_club_id text,
  add column card_checked_at timestamptz;

comment on column public.courses.golfapi_club_id is 'Matching club in the UK Golf Course API, once found.';
comment on column public.courses.card_checked_at is 'When we last tried to fetch the scorecard. Limits calls to the paid API.';

-- One row per tee set (White, Yellow, Red ...). Ratings feed the WHS course handicap.
create table public.course_tees (
  id text primary key,
  course_id text not null references public.courses (id) on delete cascade,
  name text not null,
  colour text,
  gender text,
  par smallint not null,
  yards integer,
  course_rating numeric(4, 1),
  slope smallint,
  is_default boolean not null default false,
  sort smallint not null default 0
);

create index course_tees_course_id_idx on public.course_tees (course_id);

-- Par and stroke index per hole. Yards are for the default tee.
create table public.course_holes (
  course_id text not null references public.courses (id) on delete cascade,
  hole smallint not null check (hole between 1 and 18),
  par smallint not null check (par between 3 and 6),
  stroke_index smallint not null check (stroke_index between 1 and 18),
  yards smallint,
  primary key (course_id, hole)
);

alter table public.course_tees enable row level security;
alter table public.course_holes enable row level security;

-- Readable by anyone signed in. Only the course-card function (service role) writes.
create policy "Signed-in users read tees" on public.course_tees for select to authenticated using (true);
create policy "Signed-in users read holes" on public.course_holes for select to authenticated using (true);

-- The tees a round is played off. Null means the course's default tee.
alter table public.rounds add column tee_id text references public.course_tees (id) on delete set null;
create index rounds_tee_id_idx on public.rounds (tee_id);

-- Live scores ---------------------------------------------------------------

-- True when p_user_id is the host or an accepted player in the round.
create function public.is_round_player(p_round_id uuid, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.rounds r where r.id = p_round_id and r.host_id = p_user_id
  ) or exists (
    select 1 from public.round_requests q
    where q.round_id = p_round_id and q.user_id = p_user_id and q.status = 'accepted'
  );
$$;

revoke execute on function public.is_round_player(uuid, uuid) from public, anon;
grant execute on function public.is_round_player(uuid, uuid) to authenticated;

-- is_round_host(uuid) already exists (20261017010000).

create table public.scores (
  round_id uuid not null references public.rounds (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  hole smallint not null check (hole between 1 and 18),
  strokes smallint not null check (strokes between 1 and 20),
  updated_by uuid default auth.uid() references public.profiles (id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (round_id, user_id, hole)
);

create index scores_user_id_idx on public.scores (user_id);
create index scores_updated_by_idx on public.scores (updated_by);

alter table public.scores enable row level security;

create policy "Players in the round read its scores"
  on public.scores for select to authenticated
  using (public.is_round_member(round_id));

-- A player enters their own score; the host can enter anyone's in the round.
create policy "Players and the host add scores"
  on public.scores for insert to authenticated
  with check (
    public.is_round_player(round_id, user_id)
    and ((select auth.uid()) = user_id or public.is_round_host(round_id))
  );

create policy "Players and the host change scores"
  on public.scores for update to authenticated
  using ((select auth.uid()) = user_id or public.is_round_host(round_id))
  with check (
    public.is_round_player(round_id, user_id)
    and ((select auth.uid()) = user_id or public.is_round_host(round_id))
  );

create policy "Players and the host clear scores"
  on public.scores for delete to authenticated
  using ((select auth.uid()) = user_id or public.is_round_host(round_id));

alter publication supabase_realtime add table public.scores;
