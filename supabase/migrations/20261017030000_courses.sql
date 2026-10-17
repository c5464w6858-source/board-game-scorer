-- UK golf courses, imported from OpenStreetMap by the import-courses edge
-- function. Data © OpenStreetMap contributors, ODbL.

create extension if not exists pg_trgm with schema extensions;
create extension if not exists pg_net with schema extensions;

create table public.courses (
  -- OSM element, e.g. 'way/123456', so re-imports update in place.
  id text primary key,
  name text not null,
  lat double precision not null,
  lon double precision not null,
  town text,
  postcode text,
  website text,
  phone text,
  holes smallint,
  -- Direct link to the club's online tee sheet, when we know it.
  booking_url text,
  updated_at timestamptz not null default now()
);

create index courses_name_trgm_idx on public.courses using gin (name extensions.gin_trgm_ops);
create index courses_lat_lon_idx on public.courses (lat, lon);

alter table public.courses enable row level security;

create policy "Courses are visible to signed-in users"
  on public.courses for select to authenticated using (true);

-- Rate limit for the importer, which is reachable with the public anon key.
create table public.course_imports (
  id bigint generated always as identity primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  course_count int,
  error text
);

alter table public.course_imports enable row level security;

alter table public.rounds
  add column course_id text references public.courses (id) on delete set null;

create index rounds_course_id_idx on public.rounds (course_id);
