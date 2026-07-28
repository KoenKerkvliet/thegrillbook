create table public.editorial_posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) between 1 and 80),
  body text not null check (char_length(body) between 1 and 1000),
  image_url text,
  cta_label text,
  cta_path text,
  completion_rule text not null default 'none'
    check (completion_rule in ('none', 'profile', 'recipe', 'follow', 'moment')),
  is_active boolean not null default true,
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((cta_label is null and cta_path is null) or (cta_label is not null and cta_path is not null)),
  check (cta_path is null or cta_path like '/app/%'),
  check (ends_at is null or ends_at > starts_at)
);

comment on table public.editorial_posts is
  'Official BBQHeros guidance cards and rare platform announcements.';

create table public.editorial_post_dismissals (
  post_id uuid not null references public.editorial_posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  dismissed_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.editorial_posts enable row level security;
alter table public.editorial_post_dismissals enable row level security;

create policy "Authenticated users can read active editorial posts"
on public.editorial_posts for select
to authenticated
using (
  (
    is_active
    and starts_at <= now()
    and (ends_at is null or ends_at > now())
  )
  or (
    author_id = auth.uid()
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and is_official
    )
  )
);

create policy "Official accounts can create editorial posts"
on public.editorial_posts for insert
to authenticated
with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and is_official
  )
);

create policy "Official accounts can update their editorial posts"
on public.editorial_posts for update
to authenticated
using (
  author_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and is_official
  )
)
with check (
  author_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and is_official
  )
);

create policy "Official accounts can delete their editorial posts"
on public.editorial_posts for delete
to authenticated
using (
  author_id = auth.uid()
  and exists (
    select 1 from public.profiles
    where id = auth.uid() and is_official
  )
);

create policy "Users can read their editorial dismissals"
on public.editorial_post_dismissals for select
to authenticated
using (user_id = auth.uid());

create policy "Users can dismiss editorial posts"
on public.editorial_post_dismissals for insert
to authenticated
with check (user_id = auth.uid());

create policy "Users can undo their editorial dismissals"
on public.editorial_post_dismissals for delete
to authenticated
using (user_id = auth.uid());

insert into public.editorial_posts (
  author_id,
  title,
  body,
  image_url,
  cta_label,
  cta_path,
  completion_rule
)
select
  id,
  'Welkom bij BBQHeros',
  'Jouw persoonlijke BBQ-kookboek én de plek om samen beter te leren barbecueën. Bewaar recepten, log je mooiste BBQ-momenten, verzamel handige tutorials en volg chefs die je inspireren. Begin op jouw tempo en bouw grill voor grill aan je eigen BBQ-verhaal.',
  'https://bbqheros.nl/images/editorial/welcome-bbqheros.webp',
  'Start met je profiel',
  '/app/profiel',
  'none'
from public.profiles
where username = 'bbqheros' and is_official;
