import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { RecipeCard, type RecipeCardData } from '../../components/RecipeCard'
import {
  BBQ_TYPES,
  DIFFICULTIES,
  MAIN_INGREDIENTS,
  RECIPE_TECHNIQUES,
} from '../../lib/discoveryOptions'

type SortOption = 'nieuwste' | 'rating' | 'kooktijd'

const SORT_LABELS: Record<SortOption, string> = {
  nieuwste: 'Nieuwste eerst',
  rating: 'Hoogst gewaardeerd',
  kooktijd: 'Kortste bereidingstijd',
}

export default function Discover() {
  const { user } = useAuth()
  const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('nieuwste')
  const [ingredientFilter, setIngredientFilter] = useState('')
  const [techniqueFilter, setTechniqueFilter] = useState('')
  const [bbqTypeFilter, setBbqTypeFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')

  useEffect(() => {
    if (!user) return
    let cancelled = false

    supabase
      .from('recipes')
      .select(
        'id, title, cover_photo_url, cook_time_minutes, servings, rating, is_public, visibility, original_owner_username, main_ingredient, technique, bbq_type, difficulty, profiles!recipes_owner_id_fkey(username)',
      )
      .eq('is_public', true)
      .neq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setRecipes(
          (data ?? [])
            .filter((recipe) => recipe.profiles?.username !== 'admin')
            .map(({ profiles, ...recipe }) => ({
              ...recipe,
              ownerUsername: profiles?.username,
            })),
        )
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const filteredRecipes = useMemo(() => {
    if (!recipes) return null
    const normalizedQuery = query.trim().toLowerCase()
    const list = recipes.filter((recipe) => {
      if (normalizedQuery && !recipe.title.toLowerCase().includes(normalizedQuery)) return false
      if (ingredientFilter && recipe.main_ingredient !== ingredientFilter) return false
      if (techniqueFilter && recipe.technique !== techniqueFilter) return false
      if (bbqTypeFilter && recipe.bbq_type !== bbqTypeFilter) return false
      if (difficultyFilter && recipe.difficulty !== difficultyFilter) return false
      return true
    })

    if (sort === 'rating') list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    if (sort === 'kooktijd') {
      list.sort((a, b) => {
        if (a.cook_time_minutes == null) return 1
        if (b.cook_time_minutes == null) return -1
        return a.cook_time_minutes - b.cook_time_minutes
      })
    }
    return list
  }, [recipes, query, sort, ingredientFilter, techniqueFilter, bbqTypeFilter, difficultyFilter])

  function clearFilters() {
    setQuery('')
    setIngredientFilter('')
    setTechniqueFilter('')
    setBbqTypeFilter('')
    setDifficultyFilter('')
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-semibold tracking-widest uppercase text-flame">Inspiratie van de community</p>
        <h1 className="font-display text-3xl mt-1">Ontdekken</h1>
        <p className="text-sm text-cream/60 mt-2 max-w-2xl">
          Openbare recepten van BBQ-liefhebbers. Bewaar wat je wilt proberen in je eigen kookboek.
        </p>
      </div>

      {recipes === null && <p className="text-cream/50">Recepten laden...</p>}
      {recipes?.length === 0 && (
        <p className="text-cream/60">Er zijn nog geen openbare recepten om te ontdekken.</p>
      )}
      {recipes && recipes.length > 0 && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Zoek op titel..."
              className="lg:col-span-2 rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
            />
            <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm">
              {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => <option key={option} value={option}>{SORT_LABELS[option]}</option>)}
            </select>
            <select value={ingredientFilter} onChange={(e) => setIngredientFilter(e.target.value)} className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm">
              <option value="">Alle ingrediÃ«nten</option>
              {Object.entries(MAIN_INGREDIENTS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={techniqueFilter} onChange={(e) => setTechniqueFilter(e.target.value)} className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm">
              <option value="">Alle technieken</option>
              {Object.entries(RECIPE_TECHNIQUES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={bbqTypeFilter} onChange={(e) => setBbqTypeFilter(e.target.value)} className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm">
              <option value="">Alle BBQ-types</option>
              {Object.entries(BBQ_TYPES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)} className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm">
              <option value="">Alle niveaus</option>
              {Object.entries(DIFFICULTIES).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
          </div>

          {filteredRecipes?.length === 0 && (
            <div className="flex items-center gap-3">
              <p className="text-cream/50 text-sm">Geen recepten gevonden met deze filters.</p>
              <button type="button" onClick={clearFilters} className="text-sm text-flame hover:underline">Wis filters</button>
            </div>
          )}
          {filteredRecipes && filteredRecipes.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredRecipes.map((recipe) => <RecipeCard key={recipe.id} recipe={recipe} />)}
            </div>
          )}
        </>
      )}
    </div>
  )
}

