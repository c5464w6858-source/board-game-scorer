-- The launch page joins the list through a function instead of inserting into
-- the table. It ignores repeats and tells the caller nothing about who is on
-- the list. Visitors get no direct access to the table: insert is revoked, so
-- the older insert policy no longer lets anything through.

create function public.join_launch_list(p_email text, p_source text default 'launch-page')
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text := lower(btrim(p_email));
begin
  if length(v_email) > 254 or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then
    raise exception 'Please enter a valid email address' using errcode = '22023';
  end if;
  insert into public.launch_signups (email, source)
  values (v_email, left(coalesce(nullif(btrim(p_source), ''), 'launch-page'), 40))
  on conflict (email) do nothing;
end;
$$;

revoke all on function public.join_launch_list(text, text) from public;
grant execute on function public.join_launch_list(text, text) to anon, authenticated;

revoke insert on public.launch_signups from anon, authenticated;
