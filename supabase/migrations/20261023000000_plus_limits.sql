-- Free-tier limits on joining rounds (BUILD_SPEC section 6 and 8).
-- Free: 1 join request waiting at once, and 2 rounds joined per calendar
-- month (UK time, by the round's tee time). Plus: 5 waiting, unlimited joins.
-- Hosting is never limited. The limits sit behind the plus_limits setting so
-- they can be switched off until an area has enough games.

create table public.app_settings (
  key text primary key,
  value jsonb not null
);

alter table public.app_settings enable row level security;

create policy "Everyone reads app settings"
  on public.app_settings for select to authenticated using (true);

insert into public.app_settings (key, value) values ('plus_limits', 'true');

create function private.plus_limits_on()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce((select value = 'true'::jsonb from public.app_settings where key = 'plus_limits'), false);
$$;

-- Rounds a golfer has been accepted into in the UK calendar month of p_when.
create function private.joined_in_month(p_user_id uuid, p_when timestamptz, p_except uuid default null)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select count(*)::int
  from public.round_requests q
  join public.rounds r on r.id = q.round_id
  where q.user_id = p_user_id
    and q.status = 'accepted'
    and q.id is distinct from p_except
    and not r.cancelled
    and date_trunc('month', r.tee_time at time zone 'Europe/London') = date_trunc('month', p_when at time zone 'Europe/London');
$$;

create function private.enforce_plus_limits()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_round public.rounds;
  v_plus boolean;
  v_waiting int;
  v_month text;
begin
  if not private.plus_limits_on() then
    return new;
  end if;
  select * into v_round from public.rounds where id = new.round_id;
  v_plus := public.has_plus(new.user_id);
  v_month := to_char(v_round.tee_time at time zone 'Europe/London', 'FMMonth');

  -- Asking to join (a new request, or asking again after withdrawing).
  if new.status = 'pending' and (tg_op = 'INSERT' or old.status <> 'pending') then
    select count(*) into v_waiting
    from public.round_requests q
    join public.rounds r on r.id = q.round_id
    where q.user_id = new.user_id and q.status = 'pending' and q.id <> new.id
      and not r.cancelled and r.tee_time > now();
    if v_waiting >= (case when v_plus then 5 else 1 end) then
      raise exception '%', case when v_plus
        then 'You have 5 join requests waiting, the most at once. Withdraw one to ask again.'
        else 'You already have a join request waiting. Free golfers can have 1 at a time; Plus allows 5.' end
        using errcode = 'P0001', hint = 'plus';
    end if;
    if not v_plus and private.joined_in_month(new.user_id, v_round.tee_time) >= 2 then
      raise exception 'You''ve joined 2 rounds in %, the free limit. Go Plus to join as many as you like.', v_month
        using errcode = 'P0001', hint = 'plus';
    end if;
  end if;

  -- Being accepted (by the host, or straight in on a Need a player round).
  if new.status = 'accepted' and (tg_op = 'INSERT' or old.status <> 'accepted') and not v_plus
     and private.joined_in_month(new.user_id, v_round.tee_time, new.id) >= 2 then
    raise exception '% has already joined 2 rounds in %, the most on a free plan. They need Plus to join more.',
      private.first_name(new.user_id), v_month
      using errcode = 'P0001', hint = 'plus';
  end if;

  return new;
end;
$$;

-- Named to run after round_requests_check, which fills in responded_at.
create trigger round_requests_zz_plus_limits
  before insert or update of status on public.round_requests
  for each row execute function private.enforce_plus_limits();

-- Where a golfer stands against the free limits, for the Plus screen and Discover.
create function public.plus_usage()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'plus', public.has_plus((select auth.uid())),
    'limits_on', private.plus_limits_on(),
    'waiting', (
      select count(*) from public.round_requests q join public.rounds r on r.id = q.round_id
      where q.user_id = (select auth.uid()) and q.status = 'pending' and not r.cancelled and r.tee_time > now()
    ),
    'joined_this_month', private.joined_in_month((select auth.uid()), now())
  );
$$;

revoke execute on function public.plus_usage() from public, anon;
grant execute on function public.plus_usage() to authenticated;

-- Which of these golfers have Plus, so hosts see Plus requests first.
create function public.plus_golfers(p_ids uuid[])
returns setof uuid
language sql
stable
security definer
set search_path = ''
as $$
  select u from unnest(p_ids) u where public.has_plus(u);
$$;

revoke execute on function public.plus_golfers(uuid[]) from public, anon;
grant execute on function public.plus_golfers(uuid[]) to authenticated;
