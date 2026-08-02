import { useEffect, useState, type FormEvent } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { RecipeCard, type RecipeCardData } from '../../components/RecipeCard'
import { extractYoutubeId, getYoutubeThumbnail } from '../../lib/youtube'
import { relativeTime } from '../../lib/relativeTime'
import type { Tables } from '../../types/database'

type Tutorial = {
  id: string
  youtube_url: string
  caption: string | null
  tutorial_category: string | null
}

const TUTORIAL_CATEGORIES: Record<string, string> = {
  onderhoud: 'Onderhoud',
  techniek: 'Techniek',
  bereiding: 'Bereiding',
  materiaal: 'Materiaal',
  overig: 'Overig',
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
        <span className="inline-block mb-2 text-[10px] font-semibold tracking-widest uppercase text-flame">
          {TUTORIAL_CATEGORIES[video.tutorial_category ?? 'overig'] ?? 'Overig'}
        </span>
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
          placeholder="Rundvlees medium-rare: 54Â°C&#10;Kip: 74Â°C&#10;..."
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
                âœ•
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Kookboek() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [tab, setTab] = useState<'recepten' | 'tutorials' | 'aantekeningen'>(
    searchParams.get('tab') === 'tutorials' ? 'tutorials' : 'recepten',
  )
  const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null)
  const [tutorials, setTutorials] = useState<Tutorial[] | null>(null)
  const [tutorialCategory, setTutorialCategory] = useState('')
  useEffect(() => {
    if (!user) return
    let cancelled = false

    supabase
      .from('recipes')
      .select(
        'id, title, cover_photo_url, cook_time_minutes, servings, rating, is_public, visibility, original_owner_username, main_ingredient, technique, bbq_type, difficulty',
      )
      .eq('owner_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setRecipes(data ?? [])
      })

    supabase
      .from('videos')
      .select('id, youtube_url, caption, tutorial_category')
      .eq('owner_id', user.id)
      .eq('is_recipe', true)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (cancelled) return
        setTutorials(data ?? [])
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

      {tab === 'recepten' && (
        <>
          {recipes === null && (
            <p className="text-cream/50">Laden...</p>
          )}
          {recipes?.length === 0 && (
            <p className="text-cream/60">
              Nog niks gelogd. Tijd om iets op het vuur te gooien.
            </p>
          )}
          {recipes && recipes.length > 0 && (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {recipes.map((recipe) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === 'tutorials' && (
        <>
          {tutorials === null && <p className="text-cream/50">Laden...</p>}
          {tutorials?.length === 0 && (
            <p className="text-cream/60">
              Nog geen tutorials bewaard. Voeg een YouTube-video toe en kies â€œBewaar bij
              Tutorialsâ€ om hem hier blijvend terug te vinden.
            </p>
          )}
          {tutorials && tutorials.length > 0 && (
            <>
              <div className="flex flex-wrap gap-2 mb-5">
                <button
                  type="button"
                  onClick={() => setTutorialCategory('')}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                    tutorialCategory === ''
                      ? 'border-flame text-flame'
                      : 'border-line text-cream/60'
                  }`}
                >
                  Alles
                </button>
                {Object.entries(TUTORIAL_CATEGORIES).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setTutorialCategory(value)}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      tutorialCategory === value
                        ? 'border-flame text-flame'
                        : 'border-line text-cream/60'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {tutorials
                  .filter(
                    (video) =>
                      !tutorialCategory ||
                      (video.tutorial_category ?? 'overig') === tutorialCategory,
                  )
                  .map((video) => (
                    <TutorialCard key={video.id} video={video} />
                  ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === 'aantekeningen' && user && <LogbookTab user={user} />}
    </div>
  )
}
