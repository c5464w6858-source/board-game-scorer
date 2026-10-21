-- BuddyGolf Plus, the only thing the app charges for.
-- Starting a society or trip needs Plus; members still join free with the code.
-- For now a golfer can start a 14-day free trial. Stripe Checkout will later
-- write paid subscriptions here from a webhook (service role), so golfers can
-- read their own row but never write it directly.

create type public.plus_status as enum ('trialing', 'active', 'past_due', 'canceled');

create table public.subscriptions (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  plan text not null default 'plus' check (plan = 'plus'),
  status public.plus_status not null,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  provider text,
  provider_customer_id text,
  provider_subscription_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

create policy "Golfers see their own subscription"
  on public.subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

-- True while a golfer's trial or paid period is running.
create function public.has_plus(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.subscriptions s
    where s.user_id = p_user_id
      and (
        (s.status = 'trialing' and s.trial_ends_at > now())
        or (s.status in ('active', 'past_due') and coalesce(s.current_period_end, now() + interval '1 day') > now())
      )
  );
$$;

revoke execute on function public.has_plus(uuid) from public, anon;
grant execute on function public.has_plus(uuid) to authenticated;

-- One free 14-day trial per golfer.
create function public.start_plus_trial()
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_ends timestamptz := now() + interval '14 days';
begin
  if exists (select 1 from public.subscriptions where user_id = (select auth.uid())) then
    raise exception 'You''ve already had your free trial of Plus.' using errcode = 'P0001';
  end if;
  insert into public.subscriptions (user_id, status, trial_ends_at)
  values ((select auth.uid()), 'trialing', v_ends);
  return v_ends;
end;
$$;

revoke execute on function public.start_plus_trial() from public, anon;
grant execute on function public.start_plus_trial() to authenticated;

-- Starting a society or trip needs Plus. Existing groups carry on as they are.
drop policy "Golfers create groups" on public.groups;
create policy "Plus golfers create groups" on public.groups
  for insert to authenticated
  with check ((select auth.uid()) = owner_id and public.has_plus((select auth.uid())));
