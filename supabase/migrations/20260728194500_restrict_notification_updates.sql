revoke all on table public.notifications from anon, authenticated;

grant select, delete on table public.notifications to authenticated;
grant update (read_at) on table public.notifications to authenticated;
