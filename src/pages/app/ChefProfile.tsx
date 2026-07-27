import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { FollowButton } from '../../components/FollowButton'
import { RankBadge } from '../../components/RankBadge'
import { RankIcon } from '../../components/RankIcon'
import { StreakBadge } from '../../components/StreakBadge'
import { RecipeCard, type RecipeCardData } from '../../components/RecipeCard'
import type { Tables } from '../../types/database'

type Profile = Tables<'profiles'>

export default function ChefProfile() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null)
  const [following, setFollowing] = useState(false)
  const [points, setPoints] = useState<number | null>(null)
  const [streak, setStreak] = useState<number | null>(null)

  useEffect(() => {
    if (!username || !user) return
    let cancelled = false

    async function load(usernameParam: string) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', usernameParam)
        .maybeSingle()

      if (cancelled) return
      if (!profileData) {
        setProfile(null)
        return
      }

      const [{ data: recipeData }, { data: followRow }, { data: pointsData }, { data: streakData }] =
        await Promise.all([
          supabase
            .from('recipes')
            .select(
              'id, title, cover_photo_url, cook_time_minutes, servings, rating, is_public, original_owner_username',
            )
            .eq('owner_id', profileData.id)
            .order('created_at', { ascending: false }),
          supabase
            .from('follows')
            .select('follower_id')
            .eq('follower_id', user!.id)
            .eq('following_id', profileData.id)
            .maybeSingle(),
          supabase.rpc('get_chef_points', { target_user_id: profileData.id }),
          supabase.rpc('get_chef_streak', { target_user_id: profileData.id }),
        ])

      if (cancelled) return
      // Set together so FollowButton mounts with the correct initiallyFollowing
      // right away, instead of mounting on the profile-only render (following=false)
      // and then having its stale internal state outlive a later prop update.
      setFollowing(Boolean(followRow))
      setRecipes(recipeData ?? [])
      setPoints(pointsData ?? 0)
      setStreak(streakData ?? 0)
      setProfile(profileData)
    }

    load(username)
    return () => {
      cancelled = true
    }
  }, [username, user])

  if (profile === undefined) {
    return <p className="text-cream/50">Laden...</p>
  }

  if (profile === null) {
    return (
      <div>
        <h1 className="font-display text-3xl mb-4">Niet gevonden</h1>
        <p className="text-cream/60 mb-6">Deze chef bestaat niet (meer).</p>
        <Link to="/app/chefs" className="text-flame hover:underline text-sm">
          Terug naar collega chefs
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-3xl flex flex-col gap-8">
      <div className="flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-surface-2 border border-line overflow-hidden flex items-center justify-center text-lg text-cream/40 shrink-0">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.username.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl truncate flex items-center gap-2">
            {profile.display_name || profile.username}
            {points !== null && <RankIcon points={points} className="text-xl" />}
          </h1>
          <p className="text-sm text-cream/50">@{profile.username}</p>
          {profile.bbq_brand && (
            <p className="text-sm text-flame mt-1">🔥 {profile.bbq_brand}</p>
          )}
        </div>
        <FollowButton
          targetUserId={profile.id}
          initiallyFollowing={following}
          onToggled={setFollowing}
        />
      </div>

      {points !== null && (
        <div className="bg-surface border border-line rounded-md p-4 max-w-sm flex flex-col gap-3">
          <RankBadge points={points} showProgress />
          {streak !== null && (
            <>
              <div className="border-t border-line" />
              <StreakBadge weeks={streak} />
            </>
          )}
        </div>
      )}

      {profile.bio && <p className="text-cream/70 max-w-xl">{profile.bio}</p>}

      <div>
        <h2 className="font-display text-lg mb-3">Recepten</h2>
        {recipes === null && <p className="text-cream/50 text-sm">Laden...</p>}
        {recipes?.length === 0 && (
          <p className="text-cream/50 text-sm">Nog geen zichtbare recepten.</p>
        )}
        {recipes && recipes.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {recipes.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
