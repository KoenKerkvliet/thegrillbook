import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { resizeAndConvertToWebp } from '../../lib/imageProcessing'
import { RankBadge } from '../../components/RankBadge'
import { StreakBadge } from '../../components/StreakBadge'
import { CHEF_SPECIALTIES, CHEF_TECHNIQUES } from '../../lib/discoveryOptions'
import type { Tables } from '../../types/database'

type HardwareItem = Tables<'hardware_items'>

function ChoicePills({
  options,
  selected,
  onChange,
}: {
  options: readonly string[]
  selected: string[]
  onChange: (values: string[]) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = selected.includes(option)
        return (
          <button
            key={option}
            type="button"
            onClick={() =>
              onChange(active ? selected.filter((value) => value !== option) : [...selected, option])
            }
            className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
              active
                ? 'border-flame bg-flame/10 text-flame'
                : 'border-line bg-surface text-cream/60 hover:text-cream'
            }`}
            aria-pressed={active}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}

export default function Profile() {
  const { user, profile, refreshProfile, signOut } = useAuth()
  const navigate = useNavigate()
  const [displayName, setDisplayName] = useState(profile?.display_name ?? '')
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [specialties, setSpecialties] = useState<string[]>(profile?.specialties ?? [])
  const [favoriteTechniques, setFavoriteTechniques] = useState<string[]>(
    profile?.favorite_techniques ?? [],
  )
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [points, setPoints] = useState<number | null>(null)
  const [streak, setStreak] = useState<number | null>(null)
  const [hardware, setHardware] = useState<HardwareItem[]>([])
  const [newHardware, setNewHardware] = useState('')
  const [addingHardware, setAddingHardware] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaved, setPasswordSaved] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    Promise.all([
      supabase.rpc('get_chef_points', { target_user_id: user.id }),
      supabase.rpc('get_chef_streak', { target_user_id: user.id }),
      supabase.from('hardware_items').select('*').eq('owner_id', user.id).order('position'),
    ]).then(([pointsRes, streakRes, hardwareRes]) => {
      setPoints(pointsRes.data ?? 0)
      setStreak(streakRes.data ?? 0)
      setHardware(hardwareRes.data ?? [])
    })
  }, [user])

  async function handleAddHardware(e: FormEvent) {
    e.preventDefault()
    if (!user || !newHardware.trim() || addingHardware) return
    setAddingHardware(true)
    const { data, error } = await supabase
      .from('hardware_items')
      .insert({ owner_id: user.id, text: newHardware.trim(), position: hardware.length })
      .select('*')
      .single()
    if (!error && data) {
      setHardware((prev) => [...prev, data])
      setNewHardware('')
    }
    setAddingHardware(false)
  }

  async function handleDeleteHardware(id: string) {
    setHardware((prev) => prev.filter((h) => h.id !== id))
    await supabase.from('hardware_items').delete().eq('id', id)
  }

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
        specialties,
        favorite_techniques: favoriteTechniques,
      })
      .eq('id', user.id)
    await refreshProfile()
    setSaving(false)
    setSaved(true)
  }

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) {
      setPasswordError('Wachtwoord moet minstens 6 tekens zijn.')
      return
    }
    setPasswordError(null)
    setPasswordSaved(false)
    setPasswordSaving(true)
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    setPasswordSaving(false)
    if (error) {
      setPasswordError(error.message)
      return
    }
    setNewPassword('')
    setPasswordSaved(true)
  }

  async function handleDeleteAccount(e: FormEvent) {
    e.preventDefault()
    if (!profile || deleteConfirmText !== profile.username) return
    setDeleting(true)
    setDeleteError(null)
    const { data, error } = await supabase.functions.invoke('delete-own-account')
    if (error || data?.success === false) {
      setDeleteError(data?.error || 'Account verwijderen mislukt.')
      setDeleting(false)
      return
    }
    await signOut()
    navigate('/', { replace: true })
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

        <div>
          <p className="text-sm text-cream/60 mb-2">Mijn specialiteiten</p>
          <ChoicePills
            options={CHEF_SPECIALTIES}
            selected={specialties}
            onChange={setSpecialties}
          />
        </div>

        <div>
          <p className="text-sm text-cream/60 mb-2">Favoriete technieken</p>
          <ChoicePills
            options={CHEF_TECHNIQUES}
            selected={favoriteTechniques}
            onChange={setFavoriteTechniques}
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

      <section>
        <h2 className="font-display text-xl mb-1">Mijn hardware</h2>
        <p className="text-xs text-cream/40 mb-3">
          Grill, smoker, thermometer — log alles waar je mee werkt. Zichtbaar op je profiel.
        </p>
        <form onSubmit={handleAddHardware} className="flex gap-2 mb-4">
          <input
            value={newHardware}
            onChange={(e) => setNewHardware(e.target.value)}
            placeholder="bijv. Weber Master-Touch"
            className="flex-1 rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
          />
          <button
            type="submit"
            disabled={addingHardware || !newHardware.trim()}
            aria-label="Item toevoegen"
            title="Item toevoegen"
            className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-4 py-2 rounded-md text-sm disabled:opacity-50"
          >
            +
          </button>
        </form>
        <ul className="space-y-2">
          {hardware.map((item) => (
            <li
              key={item.id}
              className="flex items-center justify-between gap-3 bg-surface border border-line rounded-md px-3 py-2 text-sm"
            >
              <span className="text-cream/80">{item.text}</span>
              <button
                type="button"
                onClick={() => handleDeleteHardware(item.id)}
                className="text-cream/30 hover:text-flame shrink-0"
                aria-label="Item verwijderen"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
        {hardware.length === 0 && (
          <p className="text-sm text-cream/40">Nog niks gelogd — begin met je grill of smoker.</p>
        )}
      </section>

      <section>
        <h2 className="font-display text-xl mb-3">Wachtwoord wijzigen</h2>
        <form onSubmit={handleChangePassword} className="flex flex-col gap-3 max-w-sm">
          <input
            type="password"
            required
            minLength={6}
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Nieuw wachtwoord"
            className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
          />
          {passwordError && <p className="text-sm text-flame">{passwordError}</p>}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md px-5 py-2.5 text-sm disabled:opacity-50"
            >
              {passwordSaving ? 'Bezig...' : 'Wachtwoord wijzigen'}
            </button>
            {passwordSaved && <span className="text-sm text-cream/50">Gewijzigd ✓</span>}
          </div>
        </form>
      </section>

      <section className="border border-flame/30 rounded-md p-5">
        <h2 className="font-display text-xl mb-1 text-flame">Account verwijderen</h2>
        <p className="text-xs text-cream/50 mb-4">
          Dit verwijdert al je recepten, momenten, video's en overige gegevens definitief. Dit kan
          niet ongedaan gemaakt worden.
        </p>
        <form onSubmit={handleDeleteAccount} className="flex flex-col gap-3 max-w-sm">
          <label className="text-sm text-cream/60" htmlFor="deleteConfirm">
            Typ <strong className="text-cream">@{profile?.username}</strong> om te bevestigen
          </label>
          <input
            id="deleteConfirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
          />
          {deleteError && <p className="text-sm text-flame">{deleteError}</p>}
          <button
            type="submit"
            disabled={deleting || !profile || deleteConfirmText !== profile.username}
            className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md px-5 py-2.5 text-sm disabled:opacity-50 self-start"
          >
            {deleting ? 'Bezig...' : 'Verwijder mijn account'}
          </button>
        </form>
      </section>
    </div>
  )
}
