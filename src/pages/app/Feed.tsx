import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { FeedRecipeCard, type FeedRecipeData } from '../../components/FeedRecipeCard'
import { MomentCard, type MomentCardData } from '../../components/MomentCard'
import { FollowButton } from '../../components/FollowButton'
import type { Tables } from '../../types/database'

type Profile = Tables<'profiles'>

type Stats = { recipes: number; privateRecipes: number; followers: number }

type FeedItem =
  | { kind: 'recipe'; created_at: string; recipe: FeedRecipeData }
  | { kind: 'moment'; created_at: string; moment: MomentCardData; isOwner: boolean }

function SuggestedChefs({ chefs }: { chefs: Profile[] }) {
  if (chefs.length === 0) return null
  return (
    <div className="bg-surface border border-line p-5 flex flex-col gap-4">
      <h2 className="text-xs font-semibold tracking-widest text-cream/50 uppercase">
        Koks die je nog niet volgt
      </h2>
      <div className="flex flex-col gap-4">
        {chefs.map((chef) => (
          <div key={chef.id} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40">
              {chef.avatar_url ? (
                <img src={chef.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                chef.username.slice(0, 2).toUpperCase()
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{chef.display_name || chef.username}</p>
              <p className="text-xs text-cream/50 truncate">@{chef.username}</p>
            </div>
            <FollowButton targetUserId={chef.id} initiallyFollowing={false} />
          </div>
        ))}
      </div>
      <Link to="/app/chefs" className="text-sm text-flame hover:underline">
        Meer chefs zoeken
      </Link>
    </div>
  )
}

function KookboekStats({ stats }: { stats: Stats | null }) {
  if (!stats) return null
  return (
    <div className="bg-surface border border-line p-5 flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-widest text-cream/50 uppercase">
        Jouw kookboek
      </h2>
      {[
        ['Recepten', stats.recipes],
        ['Privé', stats.privateRecipes],
        ['Volgers', stats.followers],
      ].map(([label, value]) => (
        <div key={label} className="flex items-baseline justify-between">
          <span className="text-sm text-cream/70">{label}</span>
          <span className="font-display text-2xl">{value}</span>
        </div>
      ))}
    </div>
  )
}

export default function Feed() {
  const { user } = useAuth()
  const [items, setItems] = useState<FeedItem[] | null>(null)
  const [followingCount, setFollowingCount] = useState<number | null>(null)
  const [suggested, setSuggested] = useState<Profile[]>([])
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    async function load() {
      const { data: followRows } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user!.id)

      const followingIds = (followRows ?? []).map((f) => f.following_id)
      if (cancelled) return
      setFollowingCount(followingIds.length)

      let recipeRows: Array<{
        id: string
        title: string
        description: string | null
        cover_photo_url: string | null
        cook_time_minutes: number | null
        servings: number | null
        rating: number | null
        created_at: string
        owner_id: string
        profiles: { username: string; display_name: string | null; avatar_url: string | null } | null
      }> = []
      let momentRows: Array<{
        id: string
        photo_url: string | null
        caption: string | null
        created_at: string
        owner_id: string
        profiles: { username: string; display_name: string | null; avatar_url: string | null } | null
      }> = []

      // Recipes: only from chefs you follow — your own recipes live in Mijn kookboek.
      if (followingIds.length > 0) {
        const { data } = await supabase
          .from('recipes')
          .select(
            'id, title, description, cover_photo_url, cook_time_minutes, servings, rating, created_at, owner_id, profiles!recipes_owner_id_fkey(username, display_name, avatar_url)',
          )
          .eq('is_public', true)
          .in('owner_id', followingIds)
          .order('created_at', { ascending: false })
        recipeRows = data ?? []
      }

      // Moments: your own + chefs you follow — moments only live in the feed, nowhere else.
      const momentOwnerIds = [user!.id, ...followingIds]
      const { data: momentData } = await supabase
        .from('moments')
        .select(
          'id, photo_url, caption, created_at, owner_id, profiles!moments_owner_id_fkey(username, display_name, avatar_url)',
        )
        .in('owner_id', momentOwnerIds)
        .order('created_at', { ascending: false })
      momentRows = momentData ?? []

      const recipeIds = recipeRows.map((r) => r.id)
      const [{ data: likeData }, { data: savedData }] = await Promise.all([
        recipeIds.length
          ? supabase.from('recipe_likes').select('recipe_id, user_id').in('recipe_id', recipeIds)
          : Promise.resolve({ data: [] as { recipe_id: string; user_id: string }[] }),
        recipeIds.length
          ? supabase
              .from('recipes')
              .select('id, forked_from_recipe_id')
              .eq('owner_id', user!.id)
              .in('forked_from_recipe_id', recipeIds)
          : Promise.resolve({ data: [] as { id: string; forked_from_recipe_id: string | null }[] }),
      ])
      const likeRows = likeData ?? []
      const savedMap = new Map((savedData ?? []).map((s) => [s.forked_from_recipe_id, s.id]))

      if (cancelled) return

      const recipeItems: FeedItem[] = recipeRows.map((r) => {
        const likesForRecipe = likeRows.filter((l) => l.recipe_id === r.id)
        return {
          kind: 'recipe',
          created_at: r.created_at,
          recipe: {
            id: r.id,
            title: r.title,
            description: r.description,
            cover_photo_url: r.cover_photo_url,
            cook_time_minutes: r.cook_time_minutes,
            servings: r.servings,
            rating: r.rating,
            created_at: r.created_at,
            ownerUsername: r.profiles?.username ?? '?',
            ownerDisplayName: r.profiles?.display_name ?? null,
            ownerAvatarUrl: r.profiles?.avatar_url ?? null,
            likeCount: likesForRecipe.length,
            likedByMe: likesForRecipe.some((l) => l.user_id === user!.id),
            savedAsId: savedMap.get(r.id) ?? null,
          },
        }
      })

      const momentItems: FeedItem[] = momentRows.map((m) => ({
        kind: 'moment',
        created_at: m.created_at,
        isOwner: m.owner_id === user!.id,
        moment: {
          id: m.id,
          photo_url: m.photo_url,
          caption: m.caption,
          created_at: m.created_at,
          ownerUsername: m.profiles?.username ?? '?',
          ownerDisplayName: m.profiles?.display_name ?? null,
          ownerAvatarUrl: m.profiles?.avatar_url ?? null,
        },
      }))

      setItems(
        [...recipeItems, ...momentItems].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      )

      const excludeIds = [user!.id, ...followingIds]
      let suggestedQuery = supabase.from('profiles').select('*').not('id', 'in', `(${excludeIds.join(',')})`)
      const { data: suggestedRows } = await suggestedQuery.order('created_at', { ascending: false }).limit(3)
      if (!cancelled) setSuggested(suggestedRows ?? [])

      const [{ count: recipeCount }, { count: privateCount }, { count: followerCount }] = await Promise.all([
        supabase.from('recipes').select('id', { count: 'exact', head: true }).eq('owner_id', user!.id),
        supabase
          .from('recipes')
          .select('id', { count: 'exact', head: true })
          .eq('owner_id', user!.id)
          .eq('is_public', false),
        supabase.from('follows').select('follower_id', { count: 'exact', head: true }).eq('following_id', user!.id),
      ])
      if (!cancelled) {
        setStats({
          recipes: recipeCount ?? 0,
          privateRecipes: privateCount ?? 0,
          followers: followerCount ?? 0,
        })
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  async function handleDeleteMoment(id: string) {
    setItems((prev) => prev && prev.filter((item) => !(item.kind === 'moment' && item.moment.id === id)))
    await supabase.from('moments').delete().eq('id', id)
  }

  if (items === null) {
    return <p className="text-cream/50">Feed laden...</p>
  }

  const feedColumn =
    items.length === 0 ? (
      followingCount === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl mb-3">Je feed is nog leeg</p>
          <p className="text-cream/60 mb-6">
            Volg collega chefs om hun openbare recepten en momenten hier te zien verschijnen, of log
            zelf een BBQ-moment.
          </p>
          <Link
            to="/app/chefs"
            className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-5 py-2.5 rounded-md inline-block"
          >
            Zoek collega chefs
          </Link>
        </div>
      ) : (
        <p className="text-cream/60">
          De chefs die je volgt hebben nog niks gedeeld — geen recepten, geen momenten.
        </p>
      )
    ) : (
      <div className="flex flex-col gap-6">
        {items.map((item) =>
          item.kind === 'recipe' ? (
            <FeedRecipeCard key={`recipe-${item.recipe.id}`} recipe={item.recipe} />
          ) : (
            <MomentCard
              key={`moment-${item.moment.id}`}
              moment={item.moment}
              isOwner={item.isOwner}
              onDelete={handleDeleteMoment}
            />
          ),
        )}
      </div>
    )

  return (
    <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
      <div>{feedColumn}</div>
      <div className="flex flex-col gap-6">
        <SuggestedChefs chefs={suggested} />
        <KookboekStats stats={stats} />
      </div>
    </div>
  )
}
