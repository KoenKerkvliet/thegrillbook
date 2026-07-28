with official as (
  select id from public.profiles where username = 'bbqheros' and is_official
)
insert into public.editorial_posts (
  author_id,
  title,
  body,
  image_url,
  cta_label,
  cta_path,
  completion_rule,
  created_at,
  updated_at
)
select
  id,
  'Jouw kookboek, jouw keuze',
  'Recepten in je kookboek zijn van jou. Bewaar ze privé voor jezelf of zet ze openbaar wanneer je ze met collega-chefs wilt delen. Je persoonlijke notities blijven altijd alleen voor jou zichtbaar.',
  'https://bbqheros.nl/images/editorial/personal-cookbook.webp',
  'Bekijk mijn kookboek',
  '/app/kookboek',
  'none',
  now() - interval '1 minute',
  now()
from official
union all
select
  id,
  'Meer dan alleen recepten',
  'Goede BBQ draait niet alleen om wat er op het rooster ligt. Bewaar handige video’s over onderhoud, technieken en materiaal bij je tutorials, zodat je ze later snel terugvindt.',
  'https://bbqheros.nl/images/editorial/tutorials-maintenance.webp',
  'Bekijk tutorials',
  '/app/kookboek?tab=tutorials',
  'none',
  now() - interval '2 minutes',
  now()
from official;

update public.editorial_posts
set created_at = now(), updated_at = now()
where title = 'Welkom bij BBQHeros'
  and author_id = (
    select id from public.profiles where username = 'bbqheros' and is_official
  );
