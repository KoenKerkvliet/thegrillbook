import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { RecipeCard, type RecipeCardData } from '../../components/RecipeCard'

export default function Kookboek() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    supabase
      .from('recipes')
      .select('id, title, cover_photo_url, cook_time_minutes, servings, rating, is_public')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setRecipes(data ?? [])
      })

    return () => {
      cancelled = true
    }
  }, [user])

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Mijn kookboek</h1>
        <Link
          to="/app/kookboek/nieuw"
          className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-4 py-2 rounded-md text-sm"
        >
          + Nieuw recept
        </Link>
      </div>

      {recipes === null && <p className="text-cream/50">Laden...</p>}

      {recipes?.length === 0 && (
        <p className="text-cream/60">Nog niks gelogd. Tijd om iets op het vuur te gooien.</p>
      )}

      {recipes && recipes.length > 0 && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {recipes.map((recipe) => (
            <RecipeCard key={recipe.id} recipe={recipe} />
          ))}
        </div>
      )}
    </div>
  )
}
