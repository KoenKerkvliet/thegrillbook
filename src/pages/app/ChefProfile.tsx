import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { FollowButton } from '../../components/FollowButton'
import { RankBadge } from '../../components/RankBadge'
import { RankIcon } from '../../components/RankIcon'
import { StreakBadge } from '../../components/StreakBadge'
import { RecipeCard, type RecipeCardData } from '../../components/RecipeCard'
import { OfficialBadge } from '../../components/OfficialBadge'
import type { Tables } from '../../types/database'

type Profile = Tables<'profiles'>
type HardwareItem = Tables<'hardware_items'>
type PublicChefStats = {
  recipes: number
  moments: number
  recipe_likes: number
  followers: number
}

export default function ChefProfile() {
  const { username } = useParams<{ username: string }>()
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined)
  const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null)
  const [following, setFollowing] = useState(false)
  const [points, setPoints] = useState<number | null>(null)
  const [streak, setStreak] = useState<number | null>(null)
  const [hardware, setHardware] = useState<HardwareItem[]>([])
  const [stats, setStats] = useState<PublicChefStats | null>(null)

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

      const [
        { data: recipeData },
        { data: followRow },
        { data: pointsData },
        { data: streakData },
        { data: hardwareData },
        { data: statsData },
      ] = await Promise.all([
        supabase
          .from('recipes')
          .select(
            'id, title, cover_photo_url, cook_time_minutes, servings, rating, is_public, original_owner_username, main_ingredient, technique, bbq_type, difficulty',
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
        supabase.from('hardware_items').select('*').eq('owner_id', profileData.id).order('position'),
        supabase.rpc('get_chef_stats', { target_user_id: profileData.id }),
      ])

      if (cancelled) return
      // Set together so FollowButton mounts with the correct initiallyFollowing
      // right away, instead of mounting on the profile-only render (following=false)
      // and then having its stale internal state outlive a later prop update.
      setFollowing(Boolean(followRow))
      setRecipes(recipeData ?? [])
      setPoints(pointsData ?? 0)
      setStreak(streakData ?? 0)
      setHardware(hardwareData ?? [])
      setStats(statsData?.[0] ?? null)
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
            {profile.is_official ? (
              <OfficialBadge />
            ) : (
              points !== null && <RankIcon points={points} className="text-xl" />
            )}
          </h1>
          <p className="text-sm text-cream/50">@{profile.username}</p>
        </div>
        <FollowButton
          targetUserId={profile.id}
          initiallyFollowing={following}
          onToggled={setFollowing}
        />
      </div>

      {!profile.is_official && points !== null && (
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

      {!profile.is_official && stats && (
        <div className="grid grid-cols-4 gap-2 max-w-xl">
          {[
            ['Recepten', stats.recipes],
            ['Momenten', stats.moments],
            ['Receptlikes', stats.recipe_likes],
            ['Volgers', stats.followers],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface border border-line rounded-md px-3 py-3 text-center">
              <p className="font-display text-xl">{value}</p>
              <p className="text-[10px] text-cream/45 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      )}

      {(profile.specialties.length > 0 || profile.favorite_techniques.length > 0) && (
        <div className="grid sm:grid-cols-2 gap-6">
          {profile.specialties.length > 0 && (
            <div>
              <h2 className="font-display text-lg mb-3">Specialiteiten</h2>
              <ul className="flex flex-wrap gap-2">
                {profile.specialties.map((specialty) => (
                  <li
                    key={specialty}
                    className="text-sm bg-flame/10 border border-flame/25 rounded-full px-3 py-1.5 text-orange"
                  >
                    {specialty}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {profile.favorite_techniques.length > 0 && (
            <div>
              <h2 className="font-display text-lg mb-3">Favoriete technieken</h2>
              <ul className="flex flex-wrap gap-2">
                {profile.favorite_techniques.map((technique) => (
                  <li
                    key={technique}
                    className="text-sm bg-surface border border-line rounded-full px-3 py-1.5 text-cream/80"
                  >
                    {technique}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {hardware.length > 0 && (
        <div>
          <h2 className="font-display text-lg mb-3">Hardware</h2>
          <ul className="flex flex-wrap gap-2">
            {hardware.map((item) => (
              <li
                key={item.id}
                className="text-sm bg-surface border border-line rounded-md px-3 py-1.5 text-cream/80"
              >
                🔥 {item.text}
              </li>
            ))}
          </ul>
        </div>
      )}

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
