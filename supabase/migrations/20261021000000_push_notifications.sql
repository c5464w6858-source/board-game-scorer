-- Web Push notifications.
-- Each device a golfer turns notifications on for is a push subscription.
-- Triggers on requests, chat, buddies and "need a player" queue a push through
-- the send-push edge function (pg_net). The function's URL, the shared secret and
-- the VAPID keys live in the vault (push_function_url, push_secret,
-- vapid_public_key, vapid_private_key), not in this file.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

-- Devices ---------------------------------------------------------------------

create table public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  user_agent text,
  created_at timestamptz not null default now()
);

create index push_subscriptions_user_id_idx on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

create policy "Golfers see their own devices"
  on public.push_subscriptions for select to authenticated
  using (user_id = (select auth.uid()));

create policy "Golfers remove their own devices"
  on public.push_subscriptions for delete to authenticated
  using (user_id = (select auth.uid()));

-- Saving goes through this function so a browser that was signed in as someone
-- else moves over to the golfer signed in now. Holding the endpoint proves the device.
create function public.save_push_subscription(p_endpoint text, p_p256dh text, p_auth text, p_user_agent text default null)
returns void
language sql
security definer
set search_path = ''
as $$
  insert into public.push_subscriptions (user_id, endpoint, p256dh, auth, user_agent)
  values ((select auth.uid()), p_endpoint, p_p256dh, p_auth, left(p_user_agent, 300))
  on conflict (endpoint) do update
    set user_id = excluded.user_id, p256dh = excluded.p256dh, auth = excluded.auth,
        user_agent = excluded.user_agent, created_at = now();
$$;

revoke execute on function public.save_push_subscription(text, text, text, text) from public, anon;
grant execute on function public.save_push_subscription(text, text, text, text) to authenticated;

-- Kinds of notification a golfer has turned off: requests, chat, buddies, need_player.
alter table public.profiles add column push_off text[] not null default '{}';

-- Sending ---------------------------------------------------------------------

create function private.push(p_user_ids uuid[], p_kind text, p_title text, p_body text, p_url text, p_tag text default null)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_users uuid[];
  v_url text;
  v_secret text;
begin
  select array_agg(distinct p.id) into v_users
  from public.profiles p
  where p.id = any (p_user_ids)
    and not (p_kind = any (p.push_off))
    and exists (select 1 from public.push_subscriptions s where s.user_id = p.id);
  if v_users is null then
    return;
  end if;

  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'push_function_url';
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'push_secret';
  if v_url is null or v_secret is null then
    return;
  end if;

  perform net.http_post(
    url := v_url,
    body := jsonb_build_object('user_ids', v_users, 'title', p_title, 'body', p_body, 'url', p_url, 'tag', p_tag),
    headers := jsonb_build_object('Content-Type', 'application/json', 'x-push-secret', v_secret),
    timeout_milliseconds := 15000
  );
exception when others then
  -- A notification must never stop the request, message or round from saving.
  raise warning 'push failed: %', sqlerrm;
end;
$$;

create function private.first_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(nullif(split_part(p.display_name, ' ', 1), ''), 'A golfer') from public.profiles p where p.id = p_user_id;
$$;

-- "Sunday Stableford · Sun 26 Oct 07:30", in UK time.
create function private.round_label(p_round_id uuid)
returns text
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(nullif(r.title, ''), 'Your round') || ' · ' || to_char(r.tee_time at time zone 'Europe/London', 'Dy DD Mon HH24:MI')
  from public.rounds r where r.id = p_round_id;
$$;

-- Round requests --------------------------------------------------------------

create function private.push_round_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_round public.rounds;
  v_label text;
begin
  select * into v_round from public.rounds where id = new.round_id;
  v_label := private.round_label(new.round_id);

  if tg_op = 'INSERT' then
    if new.status = 'pending' then
      perform private.push(array[v_round.host_id], 'requests', private.first_name(new.user_id) || ' wants to join', v_label,
        '/rounds/' || new.round_id || '/requests', 'requests-' || new.round_id);
    elsif new.status = 'accepted' then
      perform private.push(array[v_round.host_id], 'requests', private.first_name(new.user_id) || ' is in', v_label,
        '/rounds/' || new.round_id, 'requests-' || new.round_id);
    end if;
    return new;
  end if;

  if new.status is not distinct from old.status then
    return new;
  end if;

  if new.status = 'accepted' then
    perform private.push(array[new.user_id], 'requests', 'You’re in', v_label, '/rounds/' || new.round_id);
  elsif new.status = 'declined' then
    perform private.push(array[new.user_id], 'requests', 'Not this time',
      private.first_name(v_round.host_id) || ' couldn’t fit you in. ' || v_label, '/discover');
  elsif new.status = 'withdrawn' and old.status = 'accepted' then
    perform private.push(array[v_round.host_id], 'requests', private.first_name(new.user_id) || ' can’t make it',
      'A spot has opened up. ' || v_label, '/rounds/' || new.round_id);
  end if;
  return new;
end;
$$;

create trigger round_requests_push
  after insert or update of status on public.round_requests
  for each row execute function private.push_round_request();

-- Round chat ------------------------------------------------------------------

create function private.push_round_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_round public.rounds;
  v_to uuid[];
begin
  select * into v_round from public.rounds where id = new.round_id;
  select array_agg(u) into v_to
  from (
    select v_round.host_id as u
    union
    select q.user_id from public.round_requests q where q.round_id = new.round_id and q.status = 'accepted'
  ) players
  where u <> new.user_id;

  if v_to is not null then
    perform private.push(v_to, 'chat',
      private.first_name(new.user_id) || ' · ' || coalesce(nullif(v_round.title, ''), 'Round chat'),
      left(new.body, 140), '/rounds/' || new.round_id || '/chat', 'chat-' || new.round_id);
  end if;
  return new;
end;
$$;

create trigger round_messages_push
  after insert on public.round_messages
  for each row execute function private.push_round_message();

-- Buddies ---------------------------------------------------------------------

create function private.push_connection()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.status = 'pending' then
    perform private.push(array[new.addressee_id], 'buddies', private.first_name(new.requester_id) || ' wants to be buddies',
      'Buddies can see and join your buddies-only rounds.', '/buddies');
  elsif tg_op = 'UPDATE' and new.status = 'accepted' and old.status = 'pending' then
    perform private.push(array[new.requester_id], 'buddies', private.first_name(new.addressee_id) || ' accepted',
      'You’re buddies now.', '/golfers/' || new.addressee_id);
  end if;
  return new;
end;
$$;

create trigger connections_push
  after insert or update of status on public.connections
  for each row execute function private.push_connection();

-- Need a player ---------------------------------------------------------------

-- When a round is flagged as needing a player: the host's buddies, plus golfers
-- who said they're free that morning or afternoon and whose home club is within
-- their search radius of the course. Public rounds only reach free golfers.
create function private.push_need_a_player()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_course public.courses;
  v_local timestamp := new.tee_time at time zone 'Europe/London';
  v_slot public.day_slot := case when extract(hour from v_local) < 12 then 'am' else 'pm' end;
  v_to uuid[];
begin
  if not new.urgent or new.tee_time < now() or (tg_op = 'UPDATE' and old.urgent) then
    return new;
  end if;
  select * into v_course from public.courses where id = new.course_id;

  select array_agg(distinct u) into v_to
  from (
    select case when c.requester_id = new.host_id then c.addressee_id else c.requester_id end as u
    from public.connections c
    where c.status = 'accepted' and new.host_id in (c.requester_id, c.addressee_id)
    union
    select a.user_id
    from public.availability a
    join public.profiles p on p.id = a.user_id
    join public.courses home on home.id = p.home_club_id
    where new.visibility = 'public'
      and a.day = v_local::date and a.slot = v_slot
      and v_course.lat is not null
      -- Haversine distance in miles from their home club to the course.
      and 3958.8 * 2 * asin(sqrt(
            power(sin(radians(v_course.lat - home.lat) / 2), 2)
            + cos(radians(home.lat)) * cos(radians(v_course.lat)) * power(sin(radians(v_course.lon - home.lon) / 2), 2)
          )) <= coalesce(p.search_radius_miles, 15)
  ) candidates
  where u <> new.host_id
    and not public.is_blocked_between(u, new.host_id)
    and (not new.women_only or public.is_woman(u))
    and not exists (select 1 from public.round_requests q where q.round_id = new.id and q.user_id = u);

  if v_to is not null then
    perform private.push(v_to, 'need_player',
      'Need a player: ' || private.first_name(new.host_id) || ' at ' || coalesce(v_course.name, new.course_name, 'the club'),
      'Tee off ' || to_char(v_local, 'Dy HH24:MI') || '. First to say yes gets the spot.',
      '/rounds/' || new.id, 'need-' || new.id);
  end if;
  return new;
end;
$$;

create trigger rounds_need_a_player_push
  after insert or update of urgent on public.rounds
  for each row execute function private.push_need_a_player();

-- The send-push function reads the shared secret and VAPID keys from here.
create function public.push_config()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_object_agg(name, decrypted_secret)
  from vault.decrypted_secrets
  where name in ('push_secret', 'vapid_public_key', 'vapid_private_key');
$$;

revoke execute on function public.push_config() from public, anon, authenticated;
grant execute on function public.push_config() to service_role;

-- Test ------------------------------------------------------------------------

create function public.send_test_push()
returns void
language sql
security definer
set search_path = ''
as $$
  select private.push(array[(select auth.uid())], 'test', 'BuddyGolf', 'Notifications are on. See you on the first tee.', '/me/notifications');
$$;

revoke execute on function public.send_test_push() from public, anon;
grant execute on function public.send_test_push() to authenticated;
