-- Game templates (built-in and custom)
create table games (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  is_builtin boolean not null default false,
  theme jsonb not null default '{}'::jsonb, -- colors, accent icon, font notes
  categories jsonb not null default '[]'::jsonb, -- category definitions (type, label, lookup tables etc)
  scoring_rules jsonb not null default '{}'::jsonb, -- how categories combine into a total
  created_at timestamptz not null default now()
);

-- A played (or in-progress) game instance
create table sessions (
  id uuid primary key default gen_random_uuid(),
  join_code text unique not null,
  game_id uuid not null references games(id),
  status text not null default 'active', -- active | finished
  created_at timestamptz not null default now(),
  finished_at timestamptz
);

-- Players within a session (device-scoped identity, no auth)
create table session_players (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  name text not null,
  device_id text, -- client-generated id to identify "my" player on a device
  joined_at timestamptz not null default now()
);

-- Individual score entries per player per category
create table scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references sessions(id) on delete cascade,
  player_id uuid not null references session_players(id) on delete cascade,
  category_key text not null,
  value numeric not null default 0,
  round integer, -- nullable, used for round-based generic scoring
  updated_at timestamptz not null default now()
);

create index on sessions (join_code);
create index on session_players (session_id);
create index on scores (session_id);
create index on scores (player_id);

-- RLS: open read/write, trust model is the unguessable join code
-- (same trust model as Kahoot/Jackbox game rooms — no auth needed)
alter table games enable row level security;
alter table sessions enable row level security;
alter table session_players enable row level security;
alter table scores enable row level security;

create policy "public read games" on games for select using (true);
create policy "public write games" on games for insert with check (true);

create policy "public read sessions" on sessions for select using (true);
create policy "public write sessions" on sessions for insert with check (true);
create policy "public update sessions" on sessions for update using (true);

create policy "public read session_players" on session_players for select using (true);
create policy "public write session_players" on session_players for insert with check (true);

create policy "public read scores" on scores for select using (true);
create policy "public write scores" on scores for insert with check (true);
create policy "public update scores" on scores for update using (true);

-- Realtime enabled on these so all joined devices get live updates
alter publication supabase_realtime add table scores;
alter publication supabase_realtime add table session_players;
alter publication supabase_realtime add table sessions;
