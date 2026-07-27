import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth/useAuth'
import type { Tables } from '../types/database'

type Profile = Tables<'profiles'>

export function ShareButton({ recipeId }: { recipeId: string }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Profile[]>([])
  const [sharedWithIds, setSharedWithIds] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState(false)

  async function handleSearch(value: string) {
    setQuery(value)
    if (!user || !value.trim()) {
      setResults([])
      return
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${value.trim()}%`)
      .neq('id', user.id)
      .limit(8)
    setResults(data ?? [])
  }

  async function handleShare(target: Profile) {
    if (!user || busy) return
    setBusy(true)
    const { error } = await supabase
      .from('recipe_shares')
      .insert({ recipe_id: recipeId, shared_by: user.id, shared_with: target.id })
    if (!error || error.code === '23505') {
      setSharedWithIds((prev) => new Set(prev).add(target.id))
      supabase.functions
        .invoke('send-recipe-shared-email', { body: { recipeId, sharedWithUserId: target.id } })
        .catch(() => {})
    }
    setBusy(false)
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Delen met een gebruiker"
        title="Delen met een gebruiker"
        className="flex items-center justify-center w-9 h-9 rounded-md border border-line text-cream/70 hover:border-cream/40 transition-colors"
      >
        <span aria-hidden="true">📤</span>
      </button>
      {open && (
        <div className="absolute z-10 top-full left-0 mt-2 w-64 bg-surface border border-line rounded-md p-3 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-cream/50">Deel met een gebruiker</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
              className="text-cream/40 hover:text-cream text-xs"
            >
              ✕
            </button>
          </div>
          <input
            autoFocus
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Zoek gebruikersnaam..."
            className="w-full rounded-md bg-surface-2 border border-line px-2 py-1.5 text-sm outline-none focus:border-flame mb-2"
          />
          <div className="flex flex-col gap-1 max-h-48 overflow-y-auto">
            {results.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleShare(p)}
                disabled={busy || sharedWithIds.has(p.id)}
                className="flex items-center justify-between text-sm px-2 py-1.5 rounded hover:bg-surface-2 text-left disabled:hover:bg-transparent"
              >
                <span>@{p.username}</span>
                {sharedWithIds.has(p.id) && <span className="text-flame text-xs">Gedeeld ✓</span>}
              </button>
            ))}
            {query.trim() && results.length === 0 && (
              <p className="text-xs text-cream/40 px-2 py-1">Niemand gevonden.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
