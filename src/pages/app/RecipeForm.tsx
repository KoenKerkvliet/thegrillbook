import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { StarRating } from '../../components/StarRating'
import { resizeAndConvertToWebp } from '../../lib/imageProcessing'
import {
  BBQ_TYPES,
  DIFFICULTIES,
  MAIN_INGREDIENTS,
  RECIPE_TECHNIQUES,
} from '../../lib/discoveryOptions'

type StepDraft = {
  text: string
  section: string
}

type RecipeVisibility = 'private' | 'followers' | 'public'

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

function StepEditor({
  items,
  onChange,
}: {
  items: StepDraft[]
  onChange: (items: StepDraft[]) => void
}) {
  return (
    <fieldset>
      <legend className="block text-sm text-cream/60 mb-2">Stappen</legend>
      <p className="text-xs text-cream/40 mb-3">
        Voeg bij de eerste stap van een nieuwe fase eventueel een tussenkopje toe.
      </p>
      <div className="flex flex-col gap-3">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-line bg-surface/40 p-3">
            <div className="flex items-start gap-3">
              <span
                className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-flame/60 font-display text-lg text-flame"
                aria-hidden="true"
              >
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-2">
                <label className="sr-only" htmlFor={`step-${i}`}>
                  Stap {i + 1}
                </label>
                <textarea
                  id={`step-${i}`}
                  value={item.text}
                  rows={2}
                  onChange={(e) => {
                    const next = [...items]
                    next[i] = { ...item, text: e.target.value }
                    onChange(next)
                  }}
                  placeholder="Kruid de ribs en laat 1 uur rusten"
                  className="w-full resize-y rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
                />
                <label className="block text-xs text-cream/50" htmlFor={`step-section-${i}`}>
                  Tussenkopje vóór deze stap <span className="text-cream/30">(optioneel)</span>
                </label>
                <input
                  id={`step-section-${i}`}
                  value={item.section}
                  onChange={(e) => {
                    const next = [...items]
                    next[i] = { ...item, section: e.target.value }
                    onChange(next)
                  }}
                  placeholder="Bijvoorbeeld: Voorbereiden"
                  className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
                />
              </div>
              <button
                type="button"
                onClick={() => onChange(items.filter((_, idx) => idx !== i))}
                className="text-cream/40 hover:text-flame px-1 py-1"
                aria-label={`Stap ${i + 1} verwijderen`}
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => onChange([...items, { text: '', section: '' }])}
        className="mt-2 text-sm text-flame hover:underline"
      >
        + Stap toevoegen
      </button>
    </fieldset>
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
  const [grillTemperature, setGrillTemperature] = useState('')
  const [targetTemperature, setTargetTemperature] = useState('')
  const [rating, setRating] = useState(0)
  const [visibility, setVisibility] = useState<RecipeVisibility>('private')
  const [coverPhotoUrl, setCoverPhotoUrl] = useState<string | null>(null)
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [mainIngredient, setMainIngredient] = useState('overig')
  const [technique, setTechnique] = useState('grillen')
  const [bbqType, setBbqType] = useState('anders')
  const [difficulty, setDifficulty] = useState('gemiddeld')
  const [uploading, setUploading] = useState(false)
  const [ingredients, setIngredients] = useState<string[]>([''])
  const [steps, setSteps] = useState<StepDraft[]>([{ text: '', section: '' }])

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
      setGrillTemperature(recipe.grill_temperature_c?.toString() ?? '')
      setTargetTemperature(recipe.target_temperature_c?.toString() ?? '')
      setRating(recipe.rating ?? 0)
      setVisibility((recipe.visibility ?? (recipe.is_public ? 'followers' : 'private')) as RecipeVisibility)
      setCoverPhotoUrl(recipe.cover_photo_url)
      setYoutubeUrl(recipe.youtube_url ?? '')
      setMainIngredient(recipe.main_ingredient)
      setTechnique(recipe.technique)
      setBbqType(recipe.bbq_type)
      setDifficulty(recipe.difficulty)
      setIngredients(ingredientRows?.length ? ingredientRows.map((r) => r.text) : [''])
      setSteps(
        stepRows?.length
          ? stepRows.map((r) => ({ text: r.text, section: r.section ?? '' }))
          : [{ text: '', section: '' }],
      )
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
      grill_temperature_c: grillTemperature ? Number(grillTemperature) : null,
      target_temperature_c: targetTemperature ? Number(targetTemperature) : null,
      rating: rating || null,
      is_public: visibility !== 'private',
      visibility,
      cover_photo_url: coverPhotoUrl,
      youtube_url: youtubeUrl.trim() || null,
      main_ingredient: mainIngredient,
      technique,
      bbq_type: bbqType,
      difficulty,
    }

    const cleanIngredients = ingredients.map((t) => t.trim()).filter(Boolean)
    const cleanSteps = steps
      .map((step) => ({ text: step.text.trim(), section: step.section.trim() || null }))
      .filter((step) => Boolean(step.text))

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
        .insert(cleanSteps.map((step, position) => ({
          recipe_id: recipeId!,
          text: step.text,
          section: step.section,
          position,
        })))
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
          Titel <span className="text-flame">*</span>
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

      <div>
        <label className="block text-sm text-cream/60 mb-1" htmlFor="youtubeUrl">
          YouTube-link (optioneel)
        </label>
        <input
          id="youtubeUrl"
          type="url"
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
        />
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

      <fieldset className="rounded-lg border border-line bg-surface/40 p-4">
        <legend className="px-1 text-sm text-cream/60">Temperaturen</legend>
        <p className="mb-3 text-xs text-cream/40">
          Handig voor de volgende keer. Laat leeg als het niet relevant is.
        </p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-cream/60 mb-1" htmlFor="grillTemperature">
              BBQ / smoker (°C)
            </label>
            <input
              id="grillTemperature"
              type="number"
              min={40}
              max={400}
              value={grillTemperature}
              onChange={(e) => setGrillTemperature(e.target.value)}
              className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
              placeholder="120"
            />
          </div>
          <div>
            <label className="block text-sm text-cream/60 mb-1" htmlFor="targetTemperature">
              Kerntemperatuur (°C)
            </label>
            <input
              id="targetTemperature"
              type="number"
              min={1}
              max={150}
              value={targetTemperature}
              onChange={(e) => setTargetTemperature(e.target.value)}
              className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
              placeholder="54"
            />
          </div>
        </div>
      </fieldset>

      <div>
        <p className="text-sm text-cream/60 mb-2">Vindbaarheid</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <label className="text-xs text-cream/50">
            Hoofdingrediënt
            <select
              value={mainIngredient}
              onChange={(e) => setMainIngredient(e.target.value)}
              className="mt-1 w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm text-cream"
            >
              {Object.entries(MAIN_INGREDIENTS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-cream/50">
            Techniek
            <select
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              className="mt-1 w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm text-cream"
            >
              {Object.entries(RECIPE_TECHNIQUES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-cream/50">
            BBQ-type
            <select
              value={bbqType}
              onChange={(e) => setBbqType(e.target.value)}
              className="mt-1 w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm text-cream"
            >
              {Object.entries(BBQ_TYPES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-cream/50">
            Moeilijkheid
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="mt-1 w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm text-cream"
            >
              {Object.entries(DIFFICULTIES).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </label>
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

      <StepEditor items={steps} onChange={setSteps} />

      <fieldset>
        <legend className="block text-sm text-cream/60 mb-2">Wie mag dit recept zien?</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {([
            ['private', 'Privé', 'Alleen jij'],
            ['followers', 'Volgers', 'Chefs die jou volgen'],
            ['public', 'Iedereen', 'Iedereen op BBQHeros'],
          ] as const).map(([value, label, description]) => (
            <label
              key={value}
              className={`cursor-pointer rounded-md border p-3 transition-colors ${
                visibility === value
                  ? 'border-flame bg-flame/10'
                  : 'border-line bg-surface hover:border-cream/30'
              }`}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <input
                  type="radio"
                  name="visibility"
                  value={value}
                  checked={visibility === value}
                  onChange={() => setVisibility(value)}
                  className="accent-flame"
                />
                {label}
              </span>
              <span className="mt-1 block pl-5 text-xs text-cream/45">{description}</span>
            </label>
          ))}
        </div>
      </fieldset>

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
