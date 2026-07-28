import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { extractYoutubeId } from '../../lib/youtube'

export default function VideoForm() {
  const { user } = useAuth()
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [caption, setCaption] = useState('')
  const [saveToTutorials, setSaveToTutorials] = useState(false)
  const [shareInFeed, setShareInFeed] = useState(true)
  const [tutorialCategory, setTutorialCategory] = useState('onderhoud')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || (!saveToTutorials && !shareInFeed)) return
    if (!extractYoutubeId(youtubeUrl.trim())) {
      setError('Dit lijkt geen geldige YouTube-link. Kopieer de link rechtstreeks uit YouTube.')
      return
    }
    setError(null)
    setSaving(true)
    const { error: saveError } = await supabase.from('videos').insert({
      owner_id: user.id,
      youtube_url: youtubeUrl.trim(),
      caption: caption.trim() || null,
      is_recipe: saveToTutorials,
      tutorial_category: saveToTutorials ? tutorialCategory : null,
      is_feed_visible: shareInFeed,
    })
    setSaving(false)
    if (saveError) {
      setError('Opslaan mislukt.')
      return
    }
    setDone(true)
  }

  if (done) {
    return (
      <div className="max-w-md text-center py-10">
        <p className="font-display text-3xl mb-4">Video opgeslagen!</p>
        <p className="text-cream/70 mb-6">
          {shareInFeed && saveToTutorials
            ? 'Je video staat in de feed en is bewaard bij Tutorials.'
            : shareInFeed
              ? 'Je video staat in de feed.'
              : 'Je video is bewaard bij Tutorials en blijft daar makkelijk terug te vinden.'}
        </p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => {
              setDone(false)
              setYoutubeUrl('')
              setCaption('')
              setSaveToTutorials(false)
              setShareInFeed(true)
              setTutorialCategory('onderhoud')
            }}
            className="border border-line hover:border-cream/40 transition-colors px-5 py-2.5 rounded-md font-semibold"
          >
            Nog een video
          </button>
          <Link
            to={saveToTutorials && !shareInFeed ? '/app/kookboek?tab=tutorials' : '/app'}
            className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-5 py-2.5 rounded-md"
          >
            {saveToTutorials && !shareInFeed ? 'Naar mijn kookboek' : 'Naar de feed'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl mb-2">Video toevoegen</h1>
        <p className="text-cream/60 text-sm">
          Bewaar belangrijke uitleg in je eigen naslagwerk, deel een leuke video met je collega
          chefs, of doe allebei.
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
          Titel of notitie (optioneel)
        </label>
        <textarea
          id="caption"
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          rows={2}
          maxLength={280}
          placeholder="Zo maak je de kamado grondig schoon"
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
        />
      </div>

      <div className="bg-surface border border-line rounded-md p-4 flex flex-col gap-4">
        <p className="text-xs font-semibold tracking-widest text-cream/50 uppercase">
          Waar wil je deze video plaatsen?
        </p>
        <label className="flex items-start gap-2.5 text-sm text-cream/80 cursor-pointer">
          <input
            type="checkbox"
            checked={saveToTutorials}
            onChange={(e) => setSaveToTutorials(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Bewaar bij Tutorials
            <span className="block text-cream/45">Voor blijvende uitleg en onderhoud.</span>
          </span>
        </label>
        {saveToTutorials && (
          <label className="block text-sm text-cream/60">
            Categorie
            <select
              value={tutorialCategory}
              onChange={(e) => setTutorialCategory(e.target.value)}
              className="mt-1 w-full rounded-md bg-surface-2 border border-line px-3 py-2 outline-none focus:border-flame text-cream"
            >
              <option value="onderhoud">Onderhoud</option>
              <option value="techniek">Techniek</option>
              <option value="bereiding">Bereiding</option>
              <option value="materiaal">Materiaal</option>
              <option value="overig">Overig</option>
            </select>
          </label>
        )}
        <label className="flex items-start gap-2.5 text-sm text-cream/80 cursor-pointer">
          <input
            type="checkbox"
            checked={shareInFeed}
            onChange={(e) => setShareInFeed(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Deel in de feed
            <span className="block text-cream/45">Zichtbaar voor chefs die je volgen.</span>
          </span>
        </label>
      </div>

      {!saveToTutorials && !shareInFeed && (
        <p className="text-sm text-flame">Kies minimaal één plek voor deze video.</p>
      )}
      {error && <p className="text-sm text-flame">{error}</p>}

      <button
        type="submit"
        disabled={saving || !youtubeUrl.trim() || (!saveToTutorials && !shareInFeed)}
        className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md py-2.5 disabled:opacity-50"
      >
        {saving ? 'Bezig...' : 'Video opslaan'}
      </button>
    </form>
  )
}
