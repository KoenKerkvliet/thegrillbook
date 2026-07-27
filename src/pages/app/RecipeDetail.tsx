import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { StarRating } from '../../components/StarRating'
import { LikeButton } from '../../components/LikeButton'
import { MailRecipeButton } from '../../components/MailRecipeButton'
import { extractYoutubeId } from '../../lib/youtube'
import type { Tables } from '../../types/database'

type Recipe = Tables<'recipes'> & { profiles: { username: string; display_name: string | null } | null }

export default function RecipeDetail() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()

  const [recipe, setRecipe] = useState<Recipe | null>(null)
  const [ingredients, setIngredients] = useState<Tables<'recipe_ingredients'>[]>([])
  const [steps, setSteps] = useState<Tables<'recipe_steps'>[]>([])
  const [notes, setNotes] = useState<Tables<'recipe_notes'>[]>([])
  const [newNote, setNewNote] = useState('')
  const [likeCount, setLikeCount] = useState(0)
  const [likedByMe, setLikedByMe] = useState(false)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  async function loadAll() {
    if (!id) return
    const [{ data: recipeRow }, { data: ingredientRows }, { data: stepRows }, { data: likeRows }] =
      await Promise.all([
        supabase
          .from('recipes')
          .select('*, profiles!recipes_owner_id_fkey(username, display_name)')
          .eq('id', id)
          .single(),
        supabase.from('recipe_ingredients').select('*').eq('recipe_id', id).order('position'),
        supabase.from('recipe_steps').select('*').eq('recipe_id', id).order('position'),
        supabase.from('recipe_likes').select('user_id').eq('recipe_id', id),
      ])

    if (!recipeRow) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setRecipe(recipeRow as Recipe)
    setIngredients(ingredientRows ?? [])
    setSteps(stepRows ?? [])
    setLikeCount(likeRows?.length ?? 0)
    setLikedByMe(Boolean(user && likeRows?.some((l) => l.user_id === user.id)))

    if (user && recipeRow.owner_id === user.id) {
      const { data: noteRows } = await supabase
        .from('recipe_notes')
        .select('*')
        .eq('recipe_id', id)
        .order('created_at', { ascending: false })
      setNotes(noteRows ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    loadAll()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user])

  async function handleAddNote(e: FormEvent) {
    e.preventDefault()
    if (!user || !recipe || !newNote.trim()) return
    const { data, error } = await supabase
      .from('recipe_notes')
      .insert({ recipe_id: recipe.id, owner_id: user.id, text: newNote.trim() })
      .select('*')
      .single()
    if (!error && data) {
      setNotes((prev) => [data, ...prev])
      setNewNote('')
    }
  }

  async function handleDeleteNote(noteId: string) {
    await supabase.from('recipe_notes').delete().eq('id', noteId)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  async function handleDeleteRecipe() {
    if (!recipe) return
    if (!confirm(`Weet je zeker dat je "${recipe.title}" wilt verwijderen?`)) return
    await supabase.from('recipes').delete().eq('id', recipe.id)
    navigate('/app/kookboek')
  }

  if (loading) return <p className="text-cream/50">Laden...</p>
  if (notFound || !recipe) {
    return <p className="text-cream/60">Dit recept bestaat niet (meer), of je hebt er geen toegang toe.</p>
  }

  const isOwner = user?.id === recipe.owner_id

  return (
    <div className="max-w-3xl print-content">
      <Link
        to={isOwner ? '/app/kookboek' : '/app'}
        className="print:hidden text-sm text-cream/50 hover:text-cream"
      >
        ← Terug
      </Link>

      <div className="flex items-start justify-between gap-4 mt-3 mb-1">
        <h1 className="font-display text-4xl">{recipe.title}</h1>
        {isOwner && (
          <div className="print:hidden flex gap-3 shrink-0 pt-2">
            <Link to={`/app/kookboek/${recipe.id}/bewerken`} className="text-sm text-cream/60 hover:text-cream">
              Bewerken
            </Link>
            <button type="button" onClick={handleDeleteRecipe} className="text-sm text-cream/60 hover:text-flame">
              Verwijderen
            </button>
          </div>
        )}
      </div>

      {recipe.profiles && !isOwner && (
        <p className="text-sm text-cream/50 mb-1">@{recipe.profiles.username}</p>
      )}

      {recipe.original_owner_username && (
        <p className="text-sm text-cream/40 mb-4">
          Origineel van @{recipe.original_owner_username}
        </p>
      )}

      {recipe.cover_photo_url && (
        <img
          src={recipe.cover_photo_url}
          alt={recipe.title}
          className="w-full max-h-96 object-cover rounded-lg border border-line mb-5"
        />
      )}

      {recipe.description && <p className="text-cream/70 mb-5">{recipe.description}</p>}

      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-cream/70">
        {recipe.rating != null && <StarRating value={recipe.rating} size="md" />}
        {recipe.cook_time_minutes != null && <span>{recipe.cook_time_minutes} min</span>}
        {recipe.servings != null && <span>{recipe.servings} personen</span>}
        {!isOwner && (
          <div className="print:hidden">
            <LikeButton
              kind="recipe"
              targetId={recipe.id}
              initiallyLiked={likedByMe}
              initialCount={likeCount}
            />
          </div>
        )}
        {isOwner && (
          <span className="print:hidden text-cream/50">
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </span>
        )}
        {!recipe.is_public && (
          <span className="print:hidden text-[10px] tracking-wide text-cream/40 border border-line rounded px-1.5 py-0.5">
            PRIVÉ
          </span>
        )}
        <div className="print:hidden">
          <MailRecipeButton recipeId={recipe.id} />
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          aria-label="Print dit recept"
          title="Print dit recept"
          className="print:hidden flex items-center justify-center w-9 h-9 rounded-md border border-line text-cream/70 hover:border-cream/40 transition-colors"
        >
          <span aria-hidden="true">🖨️</span>
        </button>
      </div>

      {ingredients.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-xl mb-2">Ingrediënten</h2>
          <ul className="list-disc list-inside text-cream/80 space-y-1">
            {ingredients.map((ing) => (
              <li key={ing.id}>{ing.text}</li>
            ))}
          </ul>
        </section>
      )}

      {steps.length > 0 && (
        <section className="mb-6">
          <h2 className="font-display text-xl mb-2">Stappen</h2>
          <ol className="list-decimal list-inside text-cream/80 space-y-2">
            {steps.map((step) => (
              <li key={step.id}>{step.text}</li>
            ))}
          </ol>
        </section>
      )}

      {recipe.youtube_url && (
        <section className="print:hidden mb-6">
          <h2 className="font-display text-xl mb-2">Video</h2>
          {(() => {
            const videoId = extractYoutubeId(recipe.youtube_url!)
            return videoId ? (
              <div className="aspect-video">
                <iframe
                  className="w-full h-full rounded-lg border border-line"
                  src={`https://www.youtube.com/embed/${videoId}`}
                  title={recipe.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : (
              <a
                href={recipe.youtube_url!}
                target="_blank"
                rel="noreferrer"
                className="text-flame hover:underline text-sm"
              >
                Bekijk video op YouTube
              </a>
            )
          })()}
        </section>
      )}

      {isOwner && (
        <section className="print:hidden mt-8 border-t border-line pt-6">
          <h2 className="font-display text-xl mb-3">Mijn notities</h2>
          <p className="text-xs text-cream/40 mb-3">Alleen jij ziet dit, ook als het recept openbaar is.</p>
          <form onSubmit={handleAddNote} className="flex gap-2 mb-4">
            <input
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Volgende keer minder zout..."
              className="flex-1 rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
            />
            <button
              type="submit"
              className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-4 py-2 rounded-md text-sm"
            >
              Toevoegen
            </button>
          </form>
          <ul className="space-y-2">
            {notes.map((note) => (
              <li
                key={note.id}
                className="flex items-start justify-between gap-3 bg-surface border border-line rounded-md px-3 py-2 text-sm"
              >
                <span className="text-cream/80">{note.text}</span>
                <button
                  type="button"
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-cream/30 hover:text-flame shrink-0"
                  aria-label="Notitie verwijderen"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
