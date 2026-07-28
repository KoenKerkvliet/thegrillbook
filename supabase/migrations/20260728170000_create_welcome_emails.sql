create table public.welcome_emails (
  user_id uuid primary key references auth.users(id) on delete cascade,
  sent_at timestamptz not null default now()
);

alter table public.welcome_emails enable row level security;

comment on table public.welcome_emails is
  'Server-only idempotency record for the one-time account welcome email.';

insert into public.welcome_emails (user_id)
select id
from auth.users;
