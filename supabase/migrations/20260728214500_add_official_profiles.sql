alter table public.profiles
  add column is_official boolean not null default false;

comment on column public.profiles.is_official is
  'Controlled server-side. Marks trusted editorial or platform accounts.';

update public.profiles
set
  username = 'bbqheros',
  display_name = 'BBQHeros Redactie',
  bio = 'Officiële tips, inspiratie en updates van BBQHeros. Van de eerste vlam tot het betere grillwerk.',
  avatar_url = 'https://bbqheros.nl/images/bbqheros-icon-invert.png',
  is_official = true
where id = (
  select id
  from auth.users
  where lower(email) = lower('bbqherosredactie.affix255@passmail.net')
);

create or replace function public.protect_official_profile_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.is_official is distinct from old.is_official
     and coalesce(auth.role(), '') <> 'service_role' then
    raise exception 'Official profile status can only be changed server-side.';
  end if;

  return new;
end;
$$;

create trigger protect_official_profile_status
before update on public.profiles
for each row
execute function public.protect_official_profile_status();
