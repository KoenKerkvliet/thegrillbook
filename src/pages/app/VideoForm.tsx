import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { extractYoutubeId } from '../../lib/youtube'

export default function VideoForm() {
  const { user } = useAuth()
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [isRecipe, setIsRecipe] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    if (!extractYoutubeId(youtubeUrl.trim())) {
      setError('Dit lijkt geen geldige YouTube-link. Kopieer de link rechtstreeks uit YouTube.')
      return
    }
    setError(null)
    setSaving(true)
    const { error } = await supabase.from('videos').insert({
      owner_id: user.id,
      youtube_url: youtubeUrl.trim(),
      caption: caption.trim() || null,
      is_recipe: isRecipe,
    })
    setSaving(false)
    if (error) {
      setError('Opslaan mislukt.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-md text-center py-10">
        <p className="font-display text-3xl mb-4">📺 Gedeeld!</p>
        <p className="text-cream/70 mb-6">
          Je video staat in de feed
          {isRecipe ? ' en op het Tutorials-tabblad in je kookboek.' : '.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => {
              setDone(false)
              setYoutubeUrl('')
              setCaption('')
              setIsRecipe(false)
            }}
            className="border border-line hover:border-cream/40 transition-colors px-5 py-2.5 rounded-md font-semibold"
          >
            Nog een video
          </button>
          <Link
            to="/app"
            className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-5 py-2.5 rounded-md"
          >
            Naar de feed
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl mb-2">Video delen</h1>
        <p className="text-cream/60 text-sm">
          Zag je een goede BBQ-tutorial, review of gewoon iets leuks op YouTube? Deel 'm met je
          collega chefs.
        </p>
      </div>

      <div>
        <label className="block text-sm text-cream/60 mb-1" htmlFor="youtubeUrl">
          YouTube-link <span className="text-flame">*</span>
        </label>
        <input
          id="youtubeUrl"
          type="url"
          required
          value={youtubeUrl}
          onChange={(e) => setYoutubeUrl(e.target.value)}
          placeholder="https://www.youtube.com/watch?v=..."
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
        />
      </div>

      <div>
        <label className="block text-sm text-cream/60 mb-1" htmlFor="caption">
          Tekstje (optioneel)
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder="Deze brisket-techniek moet ik proberen"
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
        />
      </div>

      <label className="flex items-start gap-2.5 text-sm text-cream/80 cursor-pointer">
        <input
          type="checkbox"
          checked={isRecipe}
          onChange={(e) => setIsRecipe(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          Dit is ook een recept — zet 'm ook op het Tutorials-tabblad in mijn kookboek
        </span>
      </label>

      {error && <p className="text-sm text-flame">{error}</p>}

      <button
        type="submit"
        disabled={saving || !youtubeUrl.trim()}
        className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md py-2.5 disabled:opacity-50"
      >
        {saving ? 'Bezig...' : 'Delen'}
      </button>
    </form>
  )
}
