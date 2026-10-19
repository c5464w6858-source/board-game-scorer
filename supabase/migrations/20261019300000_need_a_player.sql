-- "Need a player": a host short of a golfer close to tee time marks the
-- round urgent. The first golfer to say "I'm in" gets the spot straight
-- away, with no wait for the host to accept.

alter table public.rounds add column urgent boolean not null default false;

-- Replaces the buddy-only auto-accept from 20261018000000: accept a request
-- straight away when the round is urgent, or when it auto-accepts buddies and
-- the requester is one. Locking the round makes "first to say yes" hold when
-- two golfers tap at once.
create or replace function public.auto_accept_buddy_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  r public.rounds;
  accepted_count int;
begin
  select * into r from public.rounds where id = new.round_id for update;
  if r.cancelled or r.tee_time < now() then
    return null;
  end if;
  if not r.urgent and not (
    r.auto_accept_buddies and exists (
      select 1 from public.connections c
      where c.status = 'accepted'
        and c.requester_id in (r.host_id, new.user_id)
        and c.addressee_id in (r.host_id, new.user_id)
    )
  ) then
    return null;
  end if;
  select count(*) into accepted_count
  from public.round_requests
  where round_id = new.round_id and status = 'accepted';
  if accepted_count + 1 < r.max_players then
    update public.round_requests set status = 'accepted' where id = new.id;
  end if;
  return null;
end;
$$;

revoke execute on function public.auto_accept_buddy_request() from public, anon, authenticated;
