import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { RecipeCard, type RecipeCardData } from '../../components/RecipeCard'
import type { Tables } from '../../types/database'

type Moment = Tables<'moments'>

function MyMoments({ moments, onDelete }: { moments: Moment[]; onDelete: (id: string) => void }) {
  if (moments.length === 0) return null
  return (
    <div className="mb-8">
      <h2 className="text-xs font-semibold tracking-widest text-cream/50 uppercase mb-3">
        Mijn momenten
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {moments.map((moment) => (
          <div key={moment.id} className="relative shrink-0 w-32">
            <img
              src={moment.photo_url}
              alt=""
              className="w-32 h-32 object-cover rounded-md border border-line"
            />
            <button
              type="button"
              onClick={() => onDelete(moment.id)}
              aria-label="Moment verwijderen"
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-ink/80 text-cream/70 hover:text-flame flex items-center justify-center text-xs"
            >
              ✕
            </button>
            {moment.caption && (
              <p className="text-xs text-cream/60 mt-1 line-clamp-2">{moment.caption}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function Kookboek() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null)
  const [moments, setMoments] = useState<Moment[]>([])

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

    supabase
      .from('moments')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setMoments(data ?? [])
      })

    return () => {
      cancelled = true
    }
  }, [user])

  async function handleDeleteMoment(id: string) {
    setMoments((prev) => prev.filter((m) => m.id !== id))
    await supabase.from('moments').delete().eq('id', id)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl">Mijn kookboek</h1>
        <div className="flex gap-3">
          <Link
            to="/app/moment/nieuw"
            className="border border-line hover:border-cream/40 transition-colors text-cream font-semibold px-4 py-2 rounded-md text-sm"
          >
            🔥 Vuur aan
          </Link>
          <Link
            to="/app/kookboek/nieuw"
            className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-4 py-2 rounded-md text-sm"
          >
            + Nieuw recept
          </Link>
        </div>
      </div>

      <MyMoments moments={moments} onDelete={handleDeleteMoment} />

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
