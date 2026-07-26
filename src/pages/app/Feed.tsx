import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { RecipeCard, type RecipeCardData } from '../../components/RecipeCard'

export default function Feed() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null)
  const [followingCount, setFollowingCount] = useState<number | null>(null)

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

      if (followingIds.length === 0) {
        setRecipes([])
        return
      }

      const { data: recipeRows } = await supabase
        .from('recipes')
        .select(
          'id, title, cover_photo_url, cook_time_minutes, servings, rating, is_public, owner_id, profiles!recipes_owner_id_fkey(username)',
        )
        .eq('is_public', true)
        .in('owner_id', followingIds)
        .order('created_at', { ascending: false })

      if (cancelled) return

      setRecipes(
        (recipeRows ?? []).map((r) => ({
          id: r.id,
          title: r.title,
          cover_photo_url: r.cover_photo_url,
          cook_time_minutes: r.cook_time_minutes,
          servings: r.servings,
          rating: r.rating,
          is_public: r.is_public,
          ownerUsername: (r.profiles as { username: string } | null)?.username,
        })),
      )
    }

    load()
    return () => {
      cancelled = true
    }
  }, [user])

  if (recipes === null) {
    return <p className="text-cream/50">Feed laden...</p>
  }

  if (followingCount === 0) {
    return (
      <div className="text-center py-20">
        <p className="font-display text-2xl mb-3">Je feed is nog leeg</p>
        <p className="text-cream/60 mb-6">
          Volg collega chefs om hun openbare recepten hier te zien verschijnen.
        </p>
        <Link
          to="/app/chefs"
          className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-5 py-2.5 rounded-md inline-block"
        >
          Zoek collega chefs
        </Link>
      </div>
    )
  }

  if (recipes.length === 0) {
    return (
      <p className="text-cream/60">
        De chefs die je volgt hebben nog geen openbare recepten gedeeld.
      </p>
    )
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {recipes.map((recipe) => (
        <RecipeCard key={recipe.id} recipe={recipe} />
      ))}
    </div>
  )
}
