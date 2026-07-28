import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { RecipeCard, type RecipeCardData } from '../../components/RecipeCard'
import { extractYoutubeId, getYoutubeThumbnail } from '../../lib/youtube'
import { relativeTime } from '../../lib/relativeTime'
import {
  BBQ_TYPES,
  DIFFICULTIES,
  MAIN_INGREDIENTS,
  RECIPE_TECHNIQUES,
} from '../../lib/discoveryOptions'
import type { Tables } from '../../types/database'

type Tutorial = {
  id: string
  youtube_url: string
  caption: string | null
}

type LogbookEntry = Tables<'logbook_entries'>

function TutorialCard({ video }: { video: Tutorial }) {
  const videoId = extractYoutubeId(video.youtube_url)
  return (
    <a
      href={video.youtube_url}
      target="_blank"
      rel="noreferrer"
      className="block rounded-lg overflow-hidden border border-line bg-surface hover:border-cream/30 transition-colors"
    >
      <div className="aspect-[4/3] bg-surface-2 flex items-center justify-center text-cream/25 text-xs overflow-hidden">
        {videoId ? (
          <img src={getYoutubeThumbnail(videoId)} alt="" className="w-full h-full object-cover" />
        ) : (
          'Video'
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-cream/80 leading-snug line-clamp-2">
          {video.caption || 'Bekijk op YouTube'}
        </p>
      </div>
    </a>
  )
}

function LogbookTab({ user }: { user: { id: string } }) {
  const [entries, setEntries] = useState<LogbookEntry[] | null>(null)
  const [query, setQuery] = useState('')
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const { data } = await supabase
      .from('logbook_entries')
      .select('*')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
    setEntries(data ?? [])
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!title.trim() || !body.trim()) return
    setSaving(true)
    const { data, error } = await supabase
      .from('logbook_entries')
      .insert({ owner_id: user.id, title: title.trim(), body: body.trim() })
      .select('*')
      .single()
    setSaving(false)
    if (!error && data) {
      setEntries((prev) => [data, ...(prev ?? [])])
      setTitle('')
      setBody('')
    }
  }

  async function handleDelete(id: string) {
    setEntries((prev) => prev && prev.filter((e) => e.id !== id))
    await supabase.from('logbook_entries').delete().eq('id', id)
  }

  const filtered =
    entries &&
    (query.trim()
      ? entries.filter(
          (e) =>
            e.title.toLowerCase().includes(query.trim().toLowerCase()) ||
            e.body.toLowerCase().includes(query.trim().toLowerCase()),
        )
      : entries)

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={handleSubmit}
        className="bg-surface border border-line rounded-md p-4 flex flex-col gap-3"
      >
        <p className="text-xs font-semibold tracking-widest text-cream/50 uppercase">
          Nieuwe aantekening
        </p>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Titel, bijv. Kerntemperaturen vlees"
          className="w-full rounded-md bg-surface-2 border border-line px-3 py-2 outline-none focus:border-flame"
        />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Rundvlees medium-rare: 54°C&#10;Kip: 74°C&#10;..."
          className="w-full rounded-md bg-surface-2 border border-line px-3 py-2 outline-none focus:border-flame"
        />
        <button
          type="submit"
          disabled={saving || !title.trim() || !body.trim()}
          className="self-start bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-4 py-2 rounded-md text-sm disabled:opacity-50"
        >
          {saving ? 'Opslaan...' : 'Opslaan'}
        </button>
      </form>

      {entries && entries.length > 0 && (
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek in je aantekeningen..."
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
        />
      )}

      {entries === null && <p className="text-cream/50">Laden...</p>}
      {entries?.length === 0 && (
        <p className="text-cream/60">
          Nog geen aantekeningen. Handig voor dingen die je steeds weer opzoekt, zoals
          kerntemperaturen.
        </p>
      )}
      {filtered?.length === 0 && entries && entries.length > 0 && (
        <p className="text-cream/50 text-sm">Niets gevonden voor "{query}".</p>
      )}

      {filtered && filtered.length > 0 && (
        <div className="flex flex-col gap-3">
          {filtered.map((entry) => (
            <div
              key={entry.id}
              className="bg-surface border border-line rounded-md p-4 flex items-start justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-semibold">{entry.title}</p>
                <p className="text-sm text-cream/70 whitespace-pre-wrap mt-1">{entry.body}</p>
                <p className="text-xs text-cream/40 mt-2">{relativeTime(entry.created_at)}</p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(entry.id)}
                aria-label="Aantekening verwijderen"
                className="text-cream/30 hover:text-flame shrink-0"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

type SortOption = 'nieuwste' | 'rating' | 'kooktijd'

const SORT_LABELS: Record<SortOption, string> = {
  nieuwste: 'Nieuwste eerst',
  rating: 'Hoogst gewaardeerd',
  kooktijd: 'Kortste bereidingstijd',
}

export default function Kookboek() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'recepten' | 'ontdekken' | 'tutorials' | 'aantekeningen'>(
    'recepten',
  )
  const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null)
  const [discoveryRecipes, setDiscoveryRecipes] = useState<RecipeCardData[] | null>(null)
  const [tutorials, setTutorials] = useState<Tutorial[] | null>(null)
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<SortOption>('nieuwste')
  const [ingredientFilter, setIngredientFilter] = useState('')
  const [techniqueFilter, setTechniqueFilter] = useState('')
  const [bbqTypeFilter, setBbqTypeFilter] = useState('')
  const [difficultyFilter, setDifficultyFilter] = useState('')

  const filteredRecipes = useMemo(() => {
    const source = tab === 'ontdekken' ? discoveryRecipes : recipes
    if (!source) return null
    const q = query.trim().toLowerCase()
    const list = source.filter((recipe) => {
      if (q && !recipe.title.toLowerCase().includes(q)) return false
      if (ingredientFilter && recipe.main_ingredient !== ingredientFilter) return false
      if (techniqueFilter && recipe.technique !== techniqueFilter) return false
      if (bbqTypeFilter && recipe.bbq_type !== bbqTypeFilter) return false
      if (difficultyFilter && recipe.difficulty !== difficultyFilter) return false
      return true
    })
    if (sort === 'rating') {
      list.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1))
    } else if (sort === 'kooktijd') {
      list.sort((a, b) => {
        if (a.cook_time_minutes == null) return 1
        if (b.cook_time_minutes == null) return -1
        return a.cook_time_minutes - b.cook_time_minutes
      })
    }
    // 'nieuwste' keeps the created_at-desc order the query already fetched in.
    return list
  }, [
    recipes,
    discoveryRecipes,
    tab,
    query,
    sort,
    ingredientFilter,
    techniqueFilter,
    bbqTypeFilter,
    difficultyFilter,
  ])

  useEffect(() => {
    if (!user) return
    let cancelled = false

    supabase
      .from('recipes')
      .select(
        'id, title, cover_photo_url, cook_time_minutes, servings, rating, is_public, original_owner_username, main_ingredient, technique, bbq_type, difficulty',
      )
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setRecipes(data ?? [])
      })

    supabase
      .from('videos')
      .select('id, youtube_url, caption')
      .eq('owner_id', user.id)
      .eq('is_recipe', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setTutorials(data ?? [])
      })

    supabase
      .from('recipes')
      .select(
        'id, title, cover_photo_url, cook_time_minutes, servings, rating, is_public, original_owner_username, main_ingredient, technique, bbq_type, difficulty, profiles!recipes_owner_id_fkey(username)',
      )
      .eq('is_public', true)
      .neq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setDiscoveryRecipes(
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

      <div className="flex gap-1 border-b border-line mb-6">
        <button
          type="button"
          onClick={() => setTab('ontdekken')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'ontdekken'
              ? 'border-flame text-cream'
              : 'border-transparent text-cream/50 hover:text-cream'
          }`}
        >
          Ontdekken {discoveryRecipes && `(${discoveryRecipes.length})`}
        </button>
        <button
          type="button"
          onClick={() => setTab('recepten')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'recepten'
              ? 'border-flame text-cream'
              : 'border-transparent text-cream/50 hover:text-cream'
          }`}
        >
          Recepten {recipes && `(${recipes.length})`}
        </button>
        <button
          type="button"
          onClick={() => setTab('tutorials')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'tutorials'
              ? 'border-flame text-cream'
              : 'border-transparent text-cream/50 hover:text-cream'
          }`}
        >
          Tutorials {tutorials && `(${tutorials.length})`}
        </button>
        <button
          type="button"
          onClick={() => setTab('aantekeningen')}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
            tab === 'aantekeningen'
              ? 'border-flame text-cream'
              : 'border-transparent text-cream/50 hover:text-cream'
          }`}
        >
          Aantekeningen
        </button>
      </div>

      {(tab === 'recepten' || tab === 'ontdekken') && (
        <>
          {(tab === 'recepten' ? recipes : discoveryRecipes) === null && (
            <p className="text-cream/50">Laden...</p>
          )}
          {(tab === 'recepten' ? recipes : discoveryRecipes)?.length === 0 && (
            <p className="text-cream/60">
              {tab === 'recepten'
                ? 'Nog niks gelogd. Tijd om iets op het vuur te gooien.'
                : 'Er zijn nog geen openbare recepten om te ontdekken.'}
            </p>
          )}
          {(tab === 'recepten' ? recipes : discoveryRecipes) &&
            (tab === 'recepten' ? recipes : discoveryRecipes)!.length > 0 && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Zoek op titel..."
                  className="lg:col-span-2 rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
                />
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortOption)}
                  className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm"
                >
                  {(Object.keys(SORT_LABELS) as SortOption[]).map((option) => (
                    <option key={option} value={option}>
                      {SORT_LABELS[option]}
                    </option>
                  ))}
                </select>
                <select
                  value={ingredientFilter}
                  onChange={(e) => setIngredientFilter(e.target.value)}
                  className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm"
                >
                  <option value="">Alle ingrediënten</option>
                  {Object.entries(MAIN_INGREDIENTS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select
                  value={techniqueFilter}
                  onChange={(e) => setTechniqueFilter(e.target.value)}
                  className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm"
                >
                  <option value="">Alle technieken</option>
                  {Object.entries(RECIPE_TECHNIQUES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select
                  value={bbqTypeFilter}
                  onChange={(e) => setBbqTypeFilter(e.target.value)}
                  className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm"
                >
                  <option value="">Alle BBQ-types</option>
                  {Object.entries(BBQ_TYPES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <select
                  value={difficultyFilter}
                  onChange={(e) => setDifficultyFilter(e.target.value)}
                  className="rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame text-sm"
                >
                  <option value="">Alle niveaus</option>
                  {Object.entries(DIFFICULTIES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              {filteredRecipes?.length === 0 && (
                <div className="flex items-center gap-3">
                  <p className="text-cream/50 text-sm">Geen recepten gevonden met deze filters.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setQuery('')
                      setIngredientFilter('')
                      setTechniqueFilter('')
                      setBbqTypeFilter('')
                      setDifficultyFilter('')
                    }}
                    className="text-sm text-flame hover:underline"
                  >
                    Wis filters
                  </button>
                </div>
              )}
              {filteredRecipes && filteredRecipes.length > 0 && (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredRecipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}

      {tab === 'tutorials' && (
        <>
          {tutorials === null && <p className="text-cream/50">Laden...</p>}
          {tutorials?.length === 0 && (
            <p className="text-cream/60">
              Nog geen tutorials bewaard. Deel een YouTube-video en vink "Dit is ook een recept"
              aan om 'm hier terug te vinden.
            </p>
          )}
          {tutorials && tutorials.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {tutorials.map((video) => (
                <TutorialCard key={video.id} video={video} />
              ))}
            </div>
          )}
        </>
      )}

      {tab === 'aantekeningen' && user && <LogbookTab user={user} />}
    </div>
  )
}
