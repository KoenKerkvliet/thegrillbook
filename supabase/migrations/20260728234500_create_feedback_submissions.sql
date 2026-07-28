create table public.feedback_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type text not null check (type in ('idea', 'bug', 'question')),
  subject text not null check (char_length(trim(subject)) between 2 and 120),
  details text check (details is null or char_length(details) <= 2000),
  page_url text check (page_url is null or char_length(page_url) <= 500),
  status text not null default 'new'
    check (status in ('new', 'reviewed', 'planned', 'completed', 'not_now')),
  email_notified_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.feedback_submissions is
  'Ideas, bugs and questions submitted by authenticated BBQHeros users.';

alter table public.feedback_submissions enable row level security;

create policy "Users can submit their own feedback"
  on public.feedback_submissions
  for insert
  to authenticated
  with check (
    user_id = auth.uid()
    and status = 'new'
    and email_notified_at is null
  );

create policy "Users can read their own feedback"
  on public.feedback_submissions
  for select
  to authenticated
  using (
    user_id = auth.uid()
    or lower(coalesce(auth.jwt() ->> 'email', '')) like '%@designpixels.nl'
  );

create policy "Admins can update feedback"
  on public.feedback_submissions
  for update
  to authenticated
  using (lower(coalesce(auth.jwt() ->> 'email', '')) like '%@designpixels.nl')
  with check (lower(coalesce(auth.jwt() ->> 'email', '')) like '%@designpixels.nl');

create index feedback_submissions_user_created_idx
  on public.feedback_submissions (user_id, created_at desc);

create index feedback_submissions_status_created_idx
  on public.feedback_submissions (status, created_at desc);
