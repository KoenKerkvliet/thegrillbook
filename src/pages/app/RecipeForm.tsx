import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { StarRating } from '../../components/StarRating'
import { resizeAndConvertToWebp } from '../../lib/imageProcessing'

function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  return (
    <div>
      <label className="block text-sm text-cream/60 mb-2">{label}</label>
      <div className="flex flex-col gap-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input
              value={item}
              onChange={(e) => {
                const next = [...items]
                next[i] = e.target.value
                onChange(next)
              }}
              placeholder={placeholder}
              className="flex-1 rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
            />
            <button
              type="button"
              onClick={() => onChange(items.filter((_, idx) => idx !== i))}
              className="text-cream/40 hover:text-flame px-2"
              aria-label="Verwijderen"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, ''])}
        className="mt-2 text-sm text-flame hover:underline"
      >
        + Toevoegen
      </button>
    </div>
  )
}

export default function RecipeForm() {
  const { user } = useAuth()
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cookTimeMinutes, setCookTimeMinutes] = useState('')
  const [servings, setServings] = useState('')
  const [rating, setRating] = useState(0)
  const [isPublic, setIsPublic] = useState(false)
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [steps, setSteps] = useState<string[]>([''])

  useEffect(() => {
    if (!id) return
    let cancelled = false

    async function load() {
      const [{ data: recipe }, { data: ingredientRows }, { data: stepRows }] = await Promise.all([
        supabase.from('recipes').select('*').eq('id', id!).single(),
        supabase
          .from('recipe_ingredients')
          .select('*')
          .eq('recipe_id', id!)
          .order('position'),
        supabase.from('recipe_steps').select('*').eq('recipe_id', id!).order('position'),
      ])
      if (cancelled || !recipe) return

      setTitle(recipe.title)
      setDescription(recipe.description ?? '')
      setCookTimeMinutes(recipe.cook_time_minutes?.toString() ?? '')
      setServings(recipe.servings?.toString() ?? '')
      setRating(recipe.rating ?? 0)
      setIsPublic(recipe.is_public)
      setCoverPhotoUrl(recipe.cover_photo_url)
      setIngredients(ingredientRows?.length ? ingredientRows.map((r) => r.text) : [''])
      setSteps(stepRows?.length ? stepRows.map((r) => r.text) : [''])
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [id])

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    try {
      const webp = await resizeAndConvertToWebp(file)
      const path = `${user.id}/${crypto.randomUUID()}.webp`
      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(path, webp, { contentType: 'image/webp' })
      if (!uploadError) {
        const { data } = supabase.storage.from('recipe-photos').getPublicUrl(path)
        setCoverPhotoUrl(data.publicUrl)
      } else {
        setError('Foto uploaden mislukt.')
      }
    } catch {
      setError('Deze foto kon niet verwerkt worden. Probeer een andere afbeelding.')
    }
    setUploading(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!title.trim()) {
      setError('Geef je recept een titel.')
      return
    }
    setError(null)
    setSaving(true)

    const recipePayload = {
      owner_id: user.id,
      title: title.trim(),
      description: description.trim() || null,
      cook_time_minutes: cookTimeMinutes ? Number(cookTimeMinutes) : null,
      servings: servings ? Number(servings) : null,
      rating: rating || null,
      is_public: isPublic,
      cover_photo_url: coverPhotoUrl,
    }

    const cleanIngredients = ingredients.map((t) => t.trim()).filter(Boolean)
    const cleanSteps = steps.map((t) => t.trim()).filter(Boolean)

    let recipeId = id

    if (isEditing) {
      const { error: updateError } = await supabase
        .from('recipes')
        .update(recipePayload)
        .eq('id', id!)
      if (updateError) {
        setError(updateError.message)
        setSaving(false)
        return
      }
      await supabase.from('recipe_ingredients').delete().eq('recipe_id', id!)
      await supabase.from('recipe_steps').delete().eq('recipe_id', id!)
    } else {
      const { data: inserted, error: insertError } = await supabase
        .from('recipes')
        .insert(recipePayload)
        .select('id')
        .single()
      if (insertError || !inserted) {
        setError(insertError?.message ?? 'Opslaan mislukt.')
        setSaving(false)
        return
      }
      recipeId = inserted.id
    }

    if (cleanIngredients.length) {
      await supabase.from('recipe_ingredients').insert(
        cleanIngredients.map((text, position) => ({ recipe_id: recipeId!, text, position })),
      )
    }
    if (cleanSteps.length) {
      await supabase
        .from('recipe_steps')
        .insert(cleanSteps.map((text, position) => ({ recipe_id: recipeId!, text, position })))
    }

    setSaving(false)
    navigate(`/app/recept/${recipeId}`)
  }

  if (loading) return <p className="text-cream/50">Laden...</p>

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl flex flex-col gap-6">
      <h1 className="font-display text-3xl">
        {isEditing ? 'Recept bewerken' : 'Nieuw recept'}
      </h1>

      <div>
        <label className="block text-sm text-cream/60 mb-1" htmlFor="title">
          Titel
        </label>
        <input
          id="title"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
          placeholder="Spareribs, 6 uur laag"
        />
      </div>

      <div>
        <label className="block text-sm text-cream/60 mb-1" htmlFor="description">
          Omschrijving
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
        />
      </div>

      <div>
        <label className="block text-sm text-cream/60 mb-2">Foto</label>
        {coverPhotoUrl && (
          <img
            src={coverPhotoUrl}
            alt=""
            className="w-full max-w-xs rounded-md mb-3 border border-line"
          />
        )}
        <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
        {uploading && <p className="text-xs text-cream/50 mt-1">Uploaden...</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-cream/60 mb-1" htmlFor="cookTime">
            Kooktijd (minuten)
          </label>
          <input
            id="cookTime"
            type="number"
            min={0}
            value={cookTimeMinutes}
            onChange={(e) => setCookTimeMinutes(e.target.value)}
            className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
          />
        </div>
        <div>
          <label className="block text-sm text-cream/60 mb-1" htmlFor="servings">
            Aantal personen
          </label>
          <input
            id="servings"
            type="number"
            min={0}
            value={servings}
            onChange={(e) => setServings(e.target.value)}
            className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm text-cream/60 mb-2">Sterren</label>
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>

      <ListEditor
        label="Ingrediënten"
        items={ingredients}
        onChange={setIngredients}
        placeholder="500g spare ribs"
      />

      <ListEditor
        label="Stappen"
        items={steps}
        onChange={setSteps}
        placeholder="Kruid de ribs en laat 1 uur rusten"
      />

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 accent-flame"
        />
        Openbaar voor mijn collega chefs
      </label>

      {error && <p className="text-sm text-flame">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading}
        className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md py-2.5 disabled:opacity-50"
      >
        {saving ? 'Opslaan...' : 'Recept opslaan'}
      </button>
    </form>
  )
}
