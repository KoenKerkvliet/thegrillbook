import { useState, type FormEvent } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'

export default function Profile() {
  const { user, profile, refreshProfile } = useAuth()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    const path = `${user.id}/avatar-${crypto.randomUUID()}-${file.name}`
    const { error } = await supabase.storage.from('avatars').upload(path, file)
    if (!error) {
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
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
      .update({ display_name: displayName || null, bio: bio || null, avatar_url: avatarUrl })
      .eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-lg flex flex-col gap-6">
      <h1 className="font-display text-3xl">Mijn profiel</h1>

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
  )
}
