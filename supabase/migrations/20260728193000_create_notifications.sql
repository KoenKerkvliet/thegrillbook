create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  actor_id uuid not null references public.profiles(id) on delete cascade,
  kind text not null check (
    kind in (
      'follow',
      'recipe_like',
      'moment_like',
      'video_like',
      'recipe_shared',
      'moment_shared',
      'video_shared'
    )
  ),
  entity_id uuid,
  subject text,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create unique index notifications_unique_event
  on public.notifications (
    recipient_id,
    actor_id,
    kind,
    coalesce(entity_id, '00000000-0000-0000-0000-000000000000'::uuid)
  );

create index notifications_recipient_created_at_idx
  on public.notifications (recipient_id, created_at desc);

alter table public.notifications enable row level security;

create policy "recipients can read their notifications"
  on public.notifications for select
  using (recipient_id = auth.uid());

create policy "recipients can mark their notifications"
  on public.notifications for update
  using (recipient_id = auth.uid())
  with check (recipient_id = auth.uid());

create policy "recipients can remove their notifications"
  on public.notifications for delete
  using (recipient_id = auth.uid());

create or replace function public.create_activity_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_recipient uuid;
  target_actor uuid;
  target_kind text;
  target_entity uuid;
  target_subject text;
begin
  case tg_table_name
    when 'follows' then
      target_recipient := new.following_id;
      target_actor := new.follower_id;
      target_kind := 'follow';
      target_entity := null;
    when 'recipe_likes' then
      select owner_id, title
        into target_recipient, target_subject
        from public.recipes
        where id = new.recipe_id;
      target_actor := new.user_id;
      target_kind := 'recipe_like';
      target_entity := new.recipe_id;
    when 'moment_likes' then
      select owner_id, coalesce(nullif(caption, ''), 'BBQ-moment')
        into target_recipient, target_subject
        from public.moments
        where id = new.moment_id;
      target_actor := new.user_id;
      target_kind := 'moment_like';
      target_entity := new.moment_id;
    when 'video_likes' then
      select owner_id, coalesce(nullif(caption, ''), 'Video')
        into target_recipient, target_subject
        from public.videos
        where id = new.video_id;
      target_actor := new.user_id;
      target_kind := 'video_like';
      target_entity := new.video_id;
    when 'recipe_shares' then
      select title into target_subject
        from public.recipes
        where id = new.recipe_id;
      target_recipient := new.shared_with;
      target_actor := new.shared_by;
      target_kind := 'recipe_shared';
      target_entity := new.recipe_id;
    when 'moment_shares' then
      select coalesce(nullif(caption, ''), 'BBQ-moment')
        into target_subject
        from public.moments
        where id = new.moment_id;
      target_recipient := new.shared_with;
      target_actor := new.shared_by;
      target_kind := 'moment_shared';
      target_entity := new.moment_id;
    when 'video_shares' then
      select coalesce(nullif(caption, ''), 'Video')
        into target_subject
        from public.videos
        where id = new.video_id;
      target_recipient := new.shared_with;
      target_actor := new.shared_by;
      target_kind := 'video_shared';
      target_entity := new.video_id;
  end case;

  if target_recipient is null or target_actor is null or target_recipient = target_actor then
    return new;
  end if;

  insert into public.notifications (
    recipient_id,
    actor_id,
    kind,
    entity_id,
    subject
  )
  values (
    target_recipient,
    target_actor,
    target_kind,
    target_entity,
    target_subject
  )
  on conflict do nothing;

  return new;
end;
$$;

create or replace function public.remove_activity_notification()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target_recipient uuid;
  target_actor uuid;
  target_kind text;
  target_entity uuid;
begin
  case tg_table_name
    when 'follows' then
      target_recipient := old.following_id;
      target_actor := old.follower_id;
      target_kind := 'follow';
      target_entity := null;
    when 'recipe_likes' then
      select owner_id into target_recipient
        from public.recipes
        where id = old.recipe_id;
      target_actor := old.user_id;
      target_kind := 'recipe_like';
      target_entity := old.recipe_id;
    when 'moment_likes' then
      select owner_id into target_recipient
        from public.moments
        where id = old.moment_id;
      target_actor := old.user_id;
      target_kind := 'moment_like';
      target_entity := old.moment_id;
    when 'video_likes' then
      select owner_id into target_recipient
        from public.videos
        where id = old.video_id;
      target_actor := old.user_id;
      target_kind := 'video_like';
      target_entity := old.video_id;
    when 'recipe_shares' then
      target_recipient := old.shared_with;
      target_actor := old.shared_by;
      target_kind := 'recipe_shared';
      target_entity := old.recipe_id;
    when 'moment_shares' then
      target_recipient := old.shared_with;
      target_actor := old.shared_by;
      target_kind := 'moment_shared';
      target_entity := old.moment_id;
    when 'video_shares' then
      target_recipient := old.shared_with;
      target_actor := old.shared_by;
      target_kind := 'video_shared';
      target_entity := old.video_id;
  end case;

  delete from public.notifications
  where recipient_id = target_recipient
    and actor_id = target_actor
    and kind = target_kind
    and entity_id is not distinct from target_entity;

  return old;
end;
$$;

create trigger create_follow_notification
  after insert on public.follows
  for each row execute function public.create_activity_notification();
create trigger remove_follow_notification
  after delete on public.follows
  for each row execute function public.remove_activity_notification();

create trigger create_recipe_like_notification
  after insert on public.recipe_likes
  for each row execute function public.create_activity_notification();
create trigger remove_recipe_like_notification
  after delete on public.recipe_likes
  for each row execute function public.remove_activity_notification();

create trigger create_moment_like_notification
  after insert on public.moment_likes
  for each row execute function public.create_activity_notification();
create trigger remove_moment_like_notification
  after delete on public.moment_likes
  for each row execute function public.remove_activity_notification();

create trigger create_video_like_notification
  after insert on public.video_likes
  for each row execute function public.create_activity_notification();
create trigger remove_video_like_notification
  after delete on public.video_likes
  for each row execute function public.remove_activity_notification();

create trigger create_recipe_share_notification
  after insert on public.recipe_shares
  for each row execute function public.create_activity_notification();
create trigger remove_recipe_share_notification
  after delete on public.recipe_shares
  for each row execute function public.remove_activity_notification();

create trigger create_moment_share_notification
  after insert on public.moment_shares
  for each row execute function public.create_activity_notification();
create trigger remove_moment_share_notification
  after delete on public.moment_shares
  for each row execute function public.remove_activity_notification();

create trigger create_video_share_notification
  after insert on public.video_shares
  for each row execute function public.create_activity_notification();
create trigger remove_video_share_notification
  after delete on public.video_shares
  for each row execute function public.remove_activity_notification();

revoke all on function public.create_activity_notification() from public;
revoke all on function public.remove_activity_notification() from public;

alter publication supabase_realtime add table public.notifications;

comment on table public.notifications is
  'In-app activity generated server-side for follows, likes and direct shares.';
