import { useEffect, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { resizeAndConvertToWebp } from '../../lib/imageProcessing'
import type { Tables } from '../../types/database'

const ACTIONS = {
  none: { label: '', path: '' },
  profile: { label: 'Vul je profiel in', path: '/app/profiel' },
  recipe: { label: 'Maak je eerste recept', path: '/app/kookboek/nieuw' },
  follow: { label: 'Ontdek collega-chefs', path: '/app/chefs' },
  moment: { label: 'Log een BBQ-moment', path: '/app/moment/nieuw' },
} as const

type ActionKey = keyof typeof ACTIONS

export default function EditorialForm() {
  const { user, profile } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [action, setAction] = useState<ActionKey>('none')
  const [completionRule, setCompletionRule] = useState<ActionKey>('none')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [existingPosts, setExistingPosts] = useState<Tables<'editorial_posts'>[]>([])

  async function loadPosts() {
    const { data } = await supabase
      .from('editorial_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setExistingPosts(data ?? [])
  }

  useEffect(() => {
    if (profile?.is_official) loadPosts()
  }, [profile?.is_official])

  if (!profile?.is_official) return <Navigate to="/app" replace />

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !user) return
    setUploading(true)
    setError(null)
    try {
      const webp = await resizeAndConvertToWebp(file)
      const path = `${user.id}/editorial/${crypto.randomUUID()}.webp`
      const { error: uploadError } = await supabase.storage
        .from('recipe-photos')
        .upload(path, webp, { contentType: 'image/webp' })
      if (uploadError) throw uploadError
      const { data } = supabase.storage.from('recipe-photos').getPublicUrl(path)
      setImageUrl(data.publicUrl)
    } catch {
      setError('De afbeelding kon niet worden geüpload.')
    }
    setUploading(false)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!user || !title.trim() || !body.trim()) return
    setSaving(true)
    setError(null)
    const selectedAction = ACTIONS[action]
    const payload = {
      author_id: user.id,
      title: title.trim(),
      body: body.trim(),
      image_url: imageUrl,
      cta_label: selectedAction.label || null,
      cta_path: selectedAction.path || null,
      completion_rule: completionRule,
    }
    const { error: saveError } = editingId
      ? await supabase.from('editorial_posts').update(payload).eq('id', editingId)
      : await supabase.from('editorial_posts').insert(payload)
    setSaving(false)
    if (saveError) {
      setError('Het redactiebericht kon niet worden opgeslagen.')
      return
    }
    setSuccess(editingId ? 'Redactiebericht bijgewerkt.' : 'Redactiebericht gepubliceerd.')
    resetForm()
    await loadPosts()
  }

  function resetForm() {
    setEditingId(null)
    setTitle('')
    setBody('')
    setAction('none')
    setCompletionRule('none')
    setImageUrl(null)
  }

  function editPost(post: Tables<'editorial_posts'>) {
    const matchingAction =
      (Object.entries(ACTIONS).find(([, value]) => value.path === (post.cta_path ?? ''))?.[0] as ActionKey)
      ?? 'none'
    setEditingId(post.id)
    setTitle(post.title)
    setBody(post.body)
    setAction(matchingAction)
    setCompletionRule(post.completion_rule as ActionKey)
    setImageUrl(post.image_url)
    setSuccess(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function togglePost(post: Tables<'editorial_posts'>) {
    await supabase.from('editorial_posts').update({ is_active: !post.is_active }).eq('id', post.id)
    await loadPosts()
  }

  async function deletePost(post: Tables<'editorial_posts'>) {
    if (!confirm(`Weet je zeker dat je "${post.title}" wilt verwijderen?`)) return
    await supabase.from('editorial_posts').delete().eq('id', post.id)
    if (editingId === post.id) resetForm()
    await loadPosts()
  }

  return (
    <div className="max-w-2xl flex flex-col gap-10">
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-widest text-flame mb-1">BBQHeros Redactie</p>
        <h1 className="font-display text-3xl">
          {editingId ? 'Redactiebericht bewerken' : 'Nieuw redactiebericht'}
        </h1>
      </div>
      <label className="text-sm text-cream/60">
        Titel
        <input
          required
          maxLength={80}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-cream"
        />
      </label>
      <label className="text-sm text-cream/60">
        Bericht
        <textarea
          required
          maxLength={1000}
          rows={5}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-cream"
        />
      </label>
      <div>
        <label className="block text-sm text-cream/60 mb-2">Afbeelding (optioneel)</label>
        {imageUrl && <img src={imageUrl} alt="" className="mb-3 max-h-56 rounded-md border border-line" />}
        <input type="file" accept="image/*" onChange={handlePhotoChange} className="text-sm" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-cream/60">
          Knop
          <select
            value={action}
            onChange={(e) => setAction(e.target.value as ActionKey)}
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-cream"
          >
            <option value="none">Geen knop</option>
            <option value="profile">Profiel invullen</option>
            <option value="recipe">Recept maken</option>
            <option value="follow">Chefs ontdekken</option>
            <option value="moment">Moment loggen</option>
          </select>
        </label>
        <label className="text-sm text-cream/60">
          Automatisch verbergen zodra
          <select
            value={completionRule}
            onChange={(e) => setCompletionRule(e.target.value as ActionKey)}
            className="mt-1 w-full rounded-md border border-line bg-surface px-3 py-2 text-cream"
          >
            <option value="none">Alleen handmatig gesloten</option>
            <option value="profile">Profiel is ingevuld</option>
            <option value="recipe">Eerste recept is geplaatst</option>
            <option value="follow">Eerste chef wordt gevolgd</option>
            <option value="moment">Eerste moment is gelogd</option>
          </select>
        </label>
      </div>
      {error && <p role="alert" className="text-sm text-flame">{error}</p>}
      {success && <p role="status" className="text-sm text-cream/65">{success}</p>}
      <button
        type="submit"
        disabled={saving || uploading}
        className="rounded-md bg-flame py-2.5 font-semibold text-ink disabled:opacity-50"
      >
        {saving ? 'Opslaan...' : editingId ? 'Wijzigingen opslaan' : 'Publiceren'}
      </button>
      {editingId && (
        <button type="button" onClick={resetForm} className="text-sm text-cream/50 hover:text-cream">
          Bewerken annuleren
        </button>
      )}
    </form>
    <section>
      <h2 className="font-display text-2xl mb-4">Bestaande berichten</h2>
      {existingPosts.length === 0 ? (
        <p className="text-sm text-cream/50">Nog geen redactieberichten.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {existingPosts.map((post) => (
            <li key={post.id} className="rounded-md border border-line bg-surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-semibold">{post.title}</p>
                  <p className="text-xs text-cream/45 mt-1">
                    {post.is_active ? 'Actief in de feed' : 'Niet actief'}
                  </p>
                </div>
                <span className={`h-2.5 w-2.5 rounded-full ${post.is_active ? 'bg-flame' : 'bg-cream/20'}`} />
              </div>
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <button type="button" onClick={() => editPost(post)} className="text-flame hover:underline">
                  Bewerken
                </button>
                <button type="button" onClick={() => togglePost(post)} className="text-cream/60 hover:text-cream">
                  {post.is_active ? 'Uitzetten' : 'Activeren'}
                </button>
                <button type="button" onClick={() => deletePost(post)} className="text-cream/45 hover:text-flame">
                  Verwijderen
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
    </div>
  )
}
