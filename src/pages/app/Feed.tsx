import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { FeedRecipeCard, type FeedRecipeData } from '../../components/FeedRecipeCard'
import { MomentCard, type MomentCardData } from '../../components/MomentCard'
import { VideoCard, type VideoCardData } from '../../components/VideoCard'
import { FollowButton } from '../../components/FollowButton'
import { RankBadge } from '../../components/RankBadge'
import { StreakBadge } from '../../components/StreakBadge'
import { isDiscoverableChef } from '../../lib/admin'
import type { Tables } from '../../types/database'

type Profile = Tables<'profiles'>

type Stats = {
  recipes: number
  moments: number
  videos: number
  receivedLikes: number
  saves: number
  followers: number
  following: number
  averageRating: number | null
  points: number
  streak: number
}

type FeedItem =
  | { kind: 'recipe'; created_at: string; recipe: FeedRecipeData; isOwner: boolean }
  | { kind: 'moment'; created_at: string; moment: MomentCardData; isOwner: boolean }
  | { kind: 'video'; created_at: string; video: VideoCardData; isOwner: boolean }

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
            <Link
              to={`/app/chefs/${chef.username}`}
              className="flex items-center gap-3 flex-1 min-w-0 group"
              aria-label={`Bekijk het profiel van ${chef.display_name || chef.username}`}
            >
              <div className="w-10 h-10 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40 ring-flame group-hover:ring-2 transition-shadow">
                {chef.avatar_url ? (
                  <img src={chef.avatar_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  chef.username.slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate group-hover:text-flame transition-colors">
                  {chef.display_name || chef.username}
                </p>
                <p className="text-xs text-cream/50 truncate">@{chef.username}</p>
              </div>
            </Link>
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

function StatsCard({ stats }: { stats: Stats | null }) {
  const [mobileExpanded, setMobileExpanded] = useState(false)
  if (!stats) return null
  return (
    <div className="bg-surface border border-line p-4 sm:p-5 flex flex-col gap-3">
      <h2 className="text-xs font-semibold tracking-widest text-cream/50 uppercase">
        Jouw stats
      </h2>
      <RankBadge points={stats.points} showProgress />
      <div className="border-t border-line" />
      <div className="flex items-center justify-between gap-3">
        <StreakBadge weeks={stats.streak} />
        <button
          type="button"
          onClick={() => setMobileExpanded((expanded) => !expanded)}
          className="lg:hidden shrink-0 text-xs font-semibold text-flame hover:text-orange transition-colors"
          aria-expanded={mobileExpanded}
        >
          {mobileExpanded ? 'Verberg' : 'Bekijk stats'}
        </button>
      </div>
      <div className={`${mobileExpanded ? 'flex' : 'hidden'} lg:flex flex-col gap-3`}>
        <div className="border-t border-line" />
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          {[
            ['Recepten', stats.recipes],
            ['Momenten', stats.moments],
            ['Video’s', stats.videos],
            ['Likes', stats.receivedLikes],
            ['Opgeslagen', stats.saves],
            ['Volgers', stats.followers],
            ['Volgend', stats.following],
            ['Gem. score', stats.averageRating == null ? '—' : stats.averageRating.toFixed(1)],
          ].map(([label, value]) => (
            <div key={label} className="border-l border-line pl-2">
              <p className="text-[11px] text-cream/45">{label}</p>
              <p className="font-display text-xl leading-tight mt-0.5">{value}</p>
            </div>
          ))}
        </div>
      </div>
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
      let videoRows: Array<{
        id: string
        youtube_url: string
        caption: string | null
        is_recipe: boolean
        created_at: string
        owner_id: string
        profiles: { username: string; display_name: string | null; avatar_url: string | null } | null
      }> = []

      // Recipes: your own (any privacy) + public recipes from chefs you follow.
      const recipeSelect =
        'id, title, description, cover_photo_url, cook_time_minutes, servings, rating, created_at, owner_id, profiles!recipes_owner_id_fkey(username, display_name, avatar_url)'
      const recipeQueries = [
        supabase
          .from('recipes')
          .select(recipeSelect)
          .eq('owner_id', user!.id)
          .is('forked_from_recipe_id', null)
          .order('created_at', { ascending: false }),
      ]
      if (followingIds.length > 0) {
        recipeQueries.push(
          supabase
            .from('recipes')
            .select(recipeSelect)
            .eq('is_public', true)
            .in('owner_id', followingIds)
            .order('created_at', { ascending: false }),
        )
      }
      const recipeResults = await Promise.all(recipeQueries)
      recipeRows = recipeResults.flatMap((r) => r.data ?? [])

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

      // Videos: your own + chefs you follow — same reach as moments, feed-only.
      const { data: videoData } = await supabase
        .from('videos')
        .select(
          'id, youtube_url, caption, is_recipe, created_at, owner_id, profiles!videos_owner_id_fkey(username, display_name, avatar_url)',
        )
        .in('owner_id', momentOwnerIds)
        .order('created_at', { ascending: false })
      videoRows = videoData ?? []

      const recipeIds = recipeRows.map((r) => r.id)
      const videoIds = videoRows.map((v) => v.id)
      const momentIds = momentRows.map((m) => m.id)
      const ownerIds = [...new Set([...recipeRows, ...momentRows, ...videoRows].map((r) => r.owner_id))]
      const [
        { data: likeData },
        { data: savedData },
        { data: ownerPointsData },
        { data: videoLikeData },
        { data: momentLikeData },
      ] = await Promise.all([
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
        ownerIds.length
          ? supabase.rpc('get_chef_points_bulk', { user_ids: ownerIds })
          : Promise.resolve({ data: [] as { user_id: string; points: number }[] }),
        videoIds.length
          ? supabase.from('video_likes').select('video_id, user_id').in('video_id', videoIds)
          : Promise.resolve({ data: [] as { video_id: string; user_id: string }[] }),
        momentIds.length
          ? supabase.from('moment_likes').select('moment_id, user_id').in('moment_id', momentIds)
          : Promise.resolve({ data: [] as { moment_id: string; user_id: string }[] }),
      ])
      const likeRows = likeData ?? []
      const savedMap = new Map((savedData ?? []).map((s) => [s.forked_from_recipe_id, s.id]))
      const ownerPointsMap = new Map((ownerPointsData ?? []).map((p) => [p.user_id, p.points]))
      const videoLikeRows = videoLikeData ?? []
      const momentLikeRows = momentLikeData ?? []

      if (cancelled) return

      const recipeItems: FeedItem[] = recipeRows.map((r) => {
        const likesForRecipe = likeRows.filter((l) => l.recipe_id === r.id)
        return {
          kind: 'recipe',
          created_at: r.created_at,
          isOwner: r.owner_id === user!.id,
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
            ownerPoints: ownerPointsMap.get(r.owner_id) ?? 0,
            likeCount: likesForRecipe.length,
            likedByMe: likesForRecipe.some((l) => l.user_id === user!.id),
            savedAsId: savedMap.get(r.id) ?? null,
          },
        }
      })

      const momentItems: FeedItem[] = momentRows.map((m) => {
        const likesForMoment = momentLikeRows.filter((l) => l.moment_id === m.id)
        return {
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
            ownerPoints: ownerPointsMap.get(m.owner_id) ?? 0,
            likeCount: likesForMoment.length,
            likedByMe: likesForMoment.some((l) => l.user_id === user!.id),
          },
        }
      })

      const videoItems: FeedItem[] = videoRows.map((v) => {
        const likesForVideo = videoLikeRows.filter((l) => l.video_id === v.id)
        return {
          kind: 'video',
          created_at: v.created_at,
          isOwner: v.owner_id === user!.id,
          video: {
            id: v.id,
            youtube_url: v.youtube_url,
            caption: v.caption,
            is_recipe: v.is_recipe,
            created_at: v.created_at,
            ownerUsername: v.profiles?.username ?? '?',
            ownerDisplayName: v.profiles?.display_name ?? null,
            ownerAvatarUrl: v.profiles?.avatar_url ?? null,
            ownerPoints: ownerPointsMap.get(v.owner_id) ?? 0,
            likeCount: likesForVideo.length,
            likedByMe: likesForVideo.some((l) => l.user_id === user!.id),
          },
        }
      })

      setItems(
        [...recipeItems, ...momentItems, ...videoItems].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        ),
      )

      const excludeIds = [user!.id, ...followingIds]
      const suggestedQuery = supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${excludeIds.join(',')})`)
        .neq('username', 'admin')
      const { data: suggestedRows } = await suggestedQuery.order('created_at', { ascending: false }).limit(3)
      if (!cancelled) setSuggested((suggestedRows ?? []).filter(isDiscoverableChef))

      const [
        { data: chefStatsData },
        { data: pointsData },
        { data: streakData },
      ] = await Promise.all([
        supabase.rpc('get_chef_stats', { target_user_id: user!.id }),
        supabase.rpc('get_chef_points', { target_user_id: user!.id }),
        supabase.rpc('get_chef_streak', { target_user_id: user!.id }),
      ])
      if (!cancelled) {
        const chefStats = chefStatsData?.[0]
        setStats({
          recipes: chefStats?.recipes ?? 0,
          moments: chefStats?.moments ?? 0,
          videos: chefStats?.videos ?? 0,
          receivedLikes: chefStats?.recipe_likes ?? 0,
          saves: chefStats?.saves ?? 0,
          followers: chefStats?.followers ?? 0,
          following: chefStats?.following ?? 0,
          averageRating: chefStats?.average_rating ?? null,
          points: pointsData ?? 0,
          streak: streakData ?? 0,
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

  async function handleDeleteVideo(id: string) {
    setItems((prev) => prev && prev.filter((item) => !(item.kind === 'video' && item.video.id === id)))
    await supabase.from('videos').delete().eq('id', id)
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
            Volg collega chefs om hun openbare recepten, momenten en video's hier te zien
            verschijnen, of log zelf iets.
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
          De chefs die je volgt hebben nog niks gedeeld — geen recepten, momenten of video's.
        </p>
      )
    ) : (
      <div className="flex flex-col gap-6">
        {items.map((item) => {
          if (item.kind === 'recipe') {
            return (
              <FeedRecipeCard
                key={`recipe-${item.recipe.id}`}
                recipe={item.recipe}
                isOwner={item.isOwner}
              />
            )
          }
          if (item.kind === 'moment') {
            return (
              <MomentCard
                key={`moment-${item.moment.id}`}
                moment={item.moment}
                isOwner={item.isOwner}
                onDelete={handleDeleteMoment}
              />
            )
          }
          return (
            <VideoCard
              key={`video-${item.video.id}`}
              video={item.video}
              isOwner={item.isOwner}
              onDelete={handleDeleteVideo}
            />
          )
        })}
      </div>
    )

  return (
    <div>
      <div className="lg:hidden mb-6">
        <StatsCard stats={stats} />
      </div>
      <div className="grid lg:grid-cols-[1fr_280px] gap-6 items-start">
        <div>{feedColumn}</div>
        <div className="hidden lg:flex flex-col gap-6">
          <StatsCard stats={stats} />
          <SuggestedChefs chefs={suggested} />
        </div>
      </div>
    </div>
  )
}
