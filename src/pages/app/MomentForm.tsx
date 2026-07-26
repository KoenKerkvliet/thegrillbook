import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { resizeAndConvertToWebp } from '../../lib/imageProcessing'

export default function MomentForm() {
  const { user } = useAuth()
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setError(null)
    try {
      const webp = await resizeAndConvertToWebp(file)
      const path = `${user.id}/moments/${crypto.randomUUID()}.webp`
      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(path, webp, { contentType: 'image/webp' })
      if (!uploadError) {
        const { data } = supabase.storage.from('recipe-photos').getPublicUrl(path)
        setPhotoUrl(data.publicUrl)
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
    if (!photoUrl && !caption.trim()) {
      setError('Voeg een foto of een tekstje toe.')
      return
    }
    setError(null)
    setSaving(true)
    const { error } = await supabase
      .from('moments')
      .insert({ owner_id: user.id, photo_url: photoUrl, caption: caption.trim() || null })
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
        <p className="font-display text-3xl mb-4">🔥 Vuur aan!</p>
        <p className="text-cream/70 mb-6">Je moment staat in de feed.</p>
        <div className="flex gap-3 justify-center">
          <button
            type="button"
            onClick={() => {
              setDone(false)
              setPhotoUrl(null)
              setCaption('')
            }}
            className="border border-line hover:border-cream/40 transition-colors px-5 py-2.5 rounded-md font-semibold"
          >
            Nog een moment
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
        <h1 className="font-display text-3xl mb-2">Vuur aan?</h1>
        <p className="text-cream/60 text-sm">
          Geen volledig recept nodig — laat je collega chefs gewoon zien dat de BBQ aan staat.
        </p>
      </div>

      <div>
        <label className="block text-sm text-cream/60 mb-2">Foto (optioneel)</label>
        {photoUrl && (
          <img
            src={photoUrl}
            alt=""
            className="w-full max-w-xs rounded-md mb-3 border border-line aspect-square object-cover"
          />
        )}
        <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
        {uploading && <p className="text-xs text-cream/50 mt-1">Uploaden...</p>}
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
          placeholder="Ribs op de kolen, wordt goed vanavond"
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
        />
      </div>

      {error && <p className="text-sm text-flame">{error}</p>}

      <button
        type="submit"
        disabled={saving || uploading || (!photoUrl && !caption.trim())}
        className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md py-2.5 disabled:opacity-50"
      >
        {saving ? 'Bezig...' : 'Delen'}
      </button>
    </form>
  )
}
