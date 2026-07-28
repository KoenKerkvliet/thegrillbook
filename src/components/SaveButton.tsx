import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth/useAuth'

type Props = {
  recipeId: string
  initiallySavedAsId?: string | null
}

export function SaveButton({ recipeId, initiallySavedAsId }: Props) {
  const { user } = useAuth()
  const [savedAsId, setSavedAsId] = useState<string | null>(initiallySavedAsId ?? null)
  const [busy, setBusy] = useState(false)

  async function handleSave() {
    if (!user || busy || savedAsId) return
    setBusy(true)

    const { data: original } = await supabase
      .from('recipes')
      .select('*, profiles!recipes_owner_id_fkey(username, display_name)')
      .eq('id', recipeId)
      .single()

    if (!original) {
      setBusy(false)
      return
    }

    const { data: inserted, error } = await supabase
      .from('recipes')
      .insert({
        owner_id: user.id,
        title: original.title,
        description: original.description,
        cook_time_minutes: original.cook_time_minutes,
        servings: original.servings,
        rating: original.rating,
        cover_photo_url: original.cover_photo_url,
        youtube_url: original.youtube_url,
        main_ingredient: original.main_ingredient,
        technique: original.technique,
        bbq_type: original.bbq_type,
        difficulty: original.difficulty,
        is_public: false,
        forked_from_recipe_id: original.id,
        original_owner_username: original.profiles?.username ?? null,
        original_owner_display_name: original.profiles?.display_name ?? null,
      })
      .select('id')
      .single()

    if (error || !inserted) {
      setBusy(false)
      return
    }

    const [{ data: ingredients }, { data: steps }] = await Promise.all([
      supabase.from('recipe_ingredients').select('position, text').eq('recipe_id', recipeId).order('position'),
      supabase.from('recipe_steps').select('position, text, section').eq('recipe_id', recipeId).order('position'),
    ])

    if (ingredients?.length) {
      await supabase
        .from('recipe_ingredients')
        .insert(ingredients.map((i) => ({ recipe_id: inserted.id, position: i.position, text: i.text })))
    }
    if (steps?.length) {
      await supabase
        .from('recipe_steps')
        .insert(steps.map((s) => ({
          recipe_id: inserted.id,
          position: s.position,
          text: s.text,
          section: s.section,
        })))
    }

    setSavedAsId(inserted.id)
    setBusy(false)
  }

  if (savedAsId) {
    return (
      <Link
        to={`/app/recept/${savedAsId}`}
        aria-label="In je kookboek"
        title="In je kookboek"
        className="flex items-center justify-center w-9 h-9 rounded-md border border-flame/40 text-flame"
      >
        <span aria-hidden="true">✓</span>
      </Link>
    )
  }

  return (
    <button
      type="button"
      onClick={handleSave}
      disabled={busy}
      aria-label="Opslaan in je eigen kookboek"
      title="Opslaan in je eigen kookboek"
      className="flex items-center justify-center w-9 h-9 rounded-md border border-line text-cream/70 hover:border-cream/40 transition-colors disabled:opacity-50"
    >
      <span aria-hidden="true">{busy ? '…' : '🔖'}</span>
    </button>
  )
}
