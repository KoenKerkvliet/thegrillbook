alter table public.recipes
  add column visibility text not null default 'private'
  check (visibility in ('private', 'followers', 'public'));

comment on column public.recipes.visibility is
  'Who can read the recipe: only the owner, followers of the owner, or every authenticated BBQHeros user.';

-- Preserve the reach users explicitly chose before this three-level setting existed.
update public.recipes
set visibility = case when is_public then 'followers' else 'private' end;

drop policy if exists "recipes visible to owner or followers when public" on public.recipes;

create policy "recipes visible according to visibility"
  on public.recipes
  for select
  to authenticated
  using (
    owner_id = auth.uid()
    or visibility = 'public'
    or (
      visibility = 'followers'
      and exists (
        select 1
        from public.follows f
        where f.follower_id = auth.uid()
          and f.following_id = recipes.owner_id
      )
    )
  );
