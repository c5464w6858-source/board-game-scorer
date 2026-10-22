-- The pre-launch page's launch list. Anyone can add their email from the
-- public page (the anon key); nobody can read, change or delete rows through
-- the API. The list is read with the service role, from the Supabase dashboard.

create table public.launch_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  source text not null default 'launch-page',
  created_at timestamptz not null default now(),
  -- The page lowercases before sending, so the unique key catches repeats.
  constraint launch_signups_email_valid check (
    email = lower(email)
    and length(email) <= 254
    and email ~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$'
  ),
  constraint launch_signups_source_short check (length(source) <= 40)
);

alter table public.launch_signups enable row level security;

revoke all on public.launch_signups from public, anon, authenticated;
grant insert on public.launch_signups to anon, authenticated;

create policy "Anyone can join the launch list"
  on public.launch_signups for insert to anon, authenticated
  with check (true);
