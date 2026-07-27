import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { resizeAndConvertToWebp } from '../../lib/imageProcessing'
import { RankBadge } from '../../components/RankBadge'
import { StreakBadge } from '../../components/StreakBadge'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [bbqBrand, setBbqBrand] = useState(profile?.bbq_brand ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [points, setPoints] = useState<number | null>(null)
  const [streak, setStreak] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.rpc('get_chef_points', { target_user_id: user.id }),
      supabase.rpc('get_chef_streak', { target_user_id: user.id }),
    ]).then(([pointsRes, streakRes]) => {
      setPoints(pointsRes.data ?? 0)
      setStreak(streakRes.data ?? 0)
    })
  }, [user])

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setUploadError(null)
    try {
      const webp = await resizeAndConvertToWebp(file)
      const path = `${user.id}/avatar-${crypto.randomUUID()}.webp`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, webp, { contentType: 'image/webp' })
      if (!error) {
        const { data } = supabase.storage.from('avatars').getPublicUrl(path)
        setAvatarUrl(data.publicUrl)
      } else {
        setUploadError('Avatar uploaden mislukt.')
      }
    } catch {
      setUploadError('Deze foto kon niet verwerkt worden. Probeer een andere afbeelding.')
    }
    setUploading(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSaved(false)
    await supabase
      .from('profiles')
      .update({
        display_name: displayName || null,
        bio: bio || null,
        avatar_url: avatarUrl,
        bbq_brand: bbqBrand || null,
      })
      .eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="max-w-lg flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl mb-4">Mijn profiel</h1>
        {points !== null && (
          <div className="bg-surface border border-line rounded-md p-4 flex flex-col gap-3">
            <RankBadge points={points} showProgress />
            {streak !== null && (
              <>
                <div className="border-t border-line" />
                <StreakBadge weeks={streak} />
              </>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <p className="text-sm text-cream/60 mb-1">Gebruikersnaam</p>
          <p className="text-cream">@{profile?.username}</p>
        </div>

        <div>
          <label className="block text-sm text-cream/60 mb-2">Avatar</label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-surface-2 overflow-hidden flex items-center justify-center text-cream/40">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.username.slice(0, 2).toUpperCase()
              )}
            </div>
            <input type="file" accept="image/*" onChange={handleAvatarChange} className="text-sm" />
          </div>
          {uploading && <p className="text-xs text-cream/50 mt-1">Uploaden...</p>}
          {uploadError && <p className="text-xs text-flame mt-1">{uploadError}</p>}
        </div>

        <div>
          <label className="block text-sm text-cream/60 mb-1" htmlFor="displayName">
            Naam
          </label>
          <input
            id="displayName"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
          />
        </div>

        <div>
          <label className="block text-sm text-cream/60 mb-1" htmlFor="bbqBrand">
            Favoriete merk / welke BBQ heb je?
          </label>
          <input
            id="bbqBrand"
            value={bbqBrand}
            onChange={(e) => setBbqBrand(e.target.value)}
            placeholder="bijv. Weber Master-Touch"
            className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
          />
        </div>

        <div>
          <label className="block text-sm text-cream/60 mb-1" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md px-5 py-2.5 disabled:opacity-50"
          >
            {saving ? 'Opslaan...' : 'Opslaan'}
          </button>
          {saved && <span className="text-sm text-cream/50">Opgeslagen ✓</span>}
        </div>
      </form>
    </div>
  )
}
