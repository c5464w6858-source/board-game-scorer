-- Trigger functions are only ever run by their triggers, so nobody needs to
-- call them over the API. is_round_host is used inside RLS policies, so
-- signed-in users still need it.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.check_round_request() from public, anon, authenticated;
revoke execute on function public.check_connection_update() from public, anon, authenticated;
revoke execute on function public.is_round_host(uuid) from public, anon;
grant execute on function public.is_round_host(uuid) to authenticated;
