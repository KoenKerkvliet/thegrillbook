import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { RecipeCard, type RecipeCardData } from '../../components/RecipeCard'
import { extractYoutubeId, getYoutubeThumbnail } from '../../lib/youtube'

type Tutorial = {
  id: string
  youtube_url: string
  caption: string | null
}

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

export default function Kookboek() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'recepten' | 'tutorials'>('recepten')
  const [recipes, setRecipes] = useState<RecipeCardData[] | null>(null)
  const [tutorials, setTutorials] = useState<Tutorial[] | null>(null)

  useEffect(() => {
    if (!user) return
    let cancelled = false

    supabase
      .from('recipes')
      .select(
        'id, title, cover_photo_url, cook_time_minutes, servings, rating, is_public, original_owner_username',
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
      </div>

      {tab === 'recepten' && (
        <>
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
    </div>
  )
}
