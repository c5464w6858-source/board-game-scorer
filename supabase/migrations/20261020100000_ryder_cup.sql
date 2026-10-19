-- Ryder Cup mode for a group: two named teams, and match play matches
-- (fourballs, foursomes, singles) in each round worth a point each, a half
-- for a halved match. Results are worked out from the group's hole scores;
-- in foursomes each side's single ball is scored under its first player.

alter table public.groups
  add column ryder_cup boolean not null default false,
  add column team_a_name text not null default 'Europe' check (char_length(team_a_name) between 1 and 30),
  add column team_b_name text not null default 'USA' check (char_length(team_b_name) between 1 and 30);

alter table public.group_members
  add column team smallint check (team in (1, 2));

create type public.match_format as enum ('fourball', 'foursomes', 'singles');

create table public.group_matches (
  id uuid primary key default gen_random_uuid(),
  group_round_id uuid not null references public.group_rounds (id) on delete cascade,
  format public.match_format not null,
  side_a uuid[] not null check (cardinality(side_a) between 1 and 2),
  side_b uuid[] not null check (cardinality(side_b) between 1 and 2),
  sort smallint not null default 0,
  created_at timestamptz not null default now(),
  check (cardinality(side_a) = cardinality(side_b)),
  check ((format = 'singles') = (cardinality(side_a) = 1))
);

create index group_matches_round_idx on public.group_matches (group_round_id, sort);

alter table public.group_matches enable row level security;

create policy "Members see matches" on public.group_matches
  for select to authenticated using (public.is_group_member(public.group_of_round(group_round_id)));
create policy "Organisers add matches" on public.group_matches
  for insert to authenticated with check (public.is_group_organiser(public.group_of_round(group_round_id)));
create policy "Organisers change matches" on public.group_matches
  for update to authenticated using (public.is_group_organiser(public.group_of_round(group_round_id)))
  with check (public.is_group_organiser(public.group_of_round(group_round_id)));
create policy "Organisers remove matches" on public.group_matches
  for delete to authenticated using (public.is_group_organiser(public.group_of_round(group_round_id)));
