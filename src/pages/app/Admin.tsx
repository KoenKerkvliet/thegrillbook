import { useEffect, useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { isAdminEmail } from '../../lib/admin'
import { relativeTime, startOfThisWeek } from '../../lib/relativeTime'

type AdminUser = {
  id: string
  email: string | null
  createdAt: string
  lastSignInAt: string | null
  username: string | null
  displayName: string | null
  avatarUrl: string | null
  recipeCount: number
  momentCount: number
  points: number
}

export default function Admin() {
  const { user } = useAuth()
  const admin = isAdminEmail(user?.email)
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    if (!admin) return
    supabase.functions.invoke('admin-list-users').then(({ data, error: invokeError }) => {
      if (invokeError || data?.success === false) {
        setError(data?.error || 'Gebruikers laden mislukt.')
        return
      }
      setUsers(data.users)
    })
  }, [admin])

  const filtered = useMemo(() => {
    if (!users) return null
    const q = query.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    )
  }, [users, query])

  const stats = useMemo(() => {
    if (!users) return null
    const weekStart = startOfThisWeek().getTime()
    return {
      totalUsers: users.length,
      totalRecipes: users.reduce((sum, u) => sum + u.recipeCount, 0),
      totalMoments: users.reduce((sum, u) => sum + u.momentCount, 0),
      newThisWeek: users.filter((u) => new Date(u.createdAt).getTime() >= weekStart).length,
    }
  }, [users])

  if (!admin) {
    return <Navigate to="/app" replace />
  }

  async function handleDelete(target: AdminUser) {
    const label = target.username ? `@${target.username}` : target.email || 'deze gebruiker'
    if (
      !confirm(
        `Weet je zeker dat je ${label} wilt verwijderen? Dit verwijdert al hun recepten, momenten, video's en overige gegevens, en kan niet ongedaan gemaakt worden.`,
      )
    ) {
      return
    }
    setDeletingId(target.id)
    setError(null)
    const { data, error: invokeError } = await supabase.functions.invoke('admin-delete-user', {
      body: { userId: target.id },
    })
    if (invokeError || data?.success === false) {
      setError(data?.error || 'Verwijderen mislukt.')
      setDeletingId(null)
      return
    }
    setUsers((prev) => prev && prev.filter((u) => u.id !== target.id))
    setDeletingId(null)
  }

  return (
    <div className="max-w-5xl flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl mb-1">Admin</h1>
        <p className="text-sm text-cream/50">Accountbeheer voor BBQHeros.</p>
      </div>

      {error && <p className="text-sm text-flame">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(
            [
              ['Chefs', stats.totalUsers],
              ['Recepten', stats.totalRecipes],
              ['Momenten', stats.totalMoments],
              ['Nieuw deze week', stats.newThisWeek],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="bg-surface border border-line rounded-md p-4">
              <p className="text-2xl font-display">{value}</p>
              <p className="text-xs text-cream/50">{label}</p>
            </div>
          ))}
        </div>
      )}

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Zoek op gebruikersnaam, naam of e-mail..."
        className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
      />

      {filtered === null && <p className="text-cream/50 text-sm">Laden...</p>}

      {filtered && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-cream/50 border-b border-line">
                <th className="py-2 pr-4 font-medium">Chef</th>
                <th className="py-2 pr-4 font-medium">E-mail</th>
                <th className="py-2 pr-4 font-medium">Aangemeld</th>
                <th className="py-2 pr-4 font-medium text-right">Punten</th>
                <th className="py-2 pr-4 font-medium text-right">Recepten</th>
                <th className="py-2 pr-4 font-medium text-right">Momenten</th>
                <th className="py-2 pl-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-line/50">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40">
                        {u.avatarUrl ? (
                          <img src={u.avatarUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          (u.username ?? '??').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate">{u.displayName || u.username || '—'}</p>
                        {u.username && <p className="text-xs text-cream/40">@{u.username}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 pr-4 text-cream/70">{u.email ?? '—'}</td>
                  <td className="py-3 pr-4 text-cream/50">{relativeTime(u.createdAt)}</td>
                  <td className="py-3 pr-4 text-right">{u.points}</td>
                  <td className="py-3 pr-4 text-right">{u.recipeCount}</td>
                  <td className="py-3 pr-4 text-right">{u.momentCount}</td>
                  <td className="py-3 pl-4 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(u)}
                      disabled={deletingId === u.id}
                      className="text-xs text-cream/50 hover:text-flame disabled:opacity-50"
                    >
                      {deletingId === u.id ? 'Bezig...' : 'Verwijderen'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-cream/50 text-sm py-4">Niemand gevonden.</p>}
        </div>
      )}
    </div>
  )
}
