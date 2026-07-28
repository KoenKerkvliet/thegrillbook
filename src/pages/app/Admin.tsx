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
  archivedAt: string | null
  recipeCount: number
  momentCount: number
  points: number
}

type Tab = 'active' | 'archived'

type UserActionsProps = {
  target: AdminUser
  tab: Tab
  busy: boolean
  isCurrentUser: boolean
  onArchive: (target: AdminUser) => void
  onRestore: (target: AdminUser) => void
  onDelete: (target: AdminUser) => void
  onResetPassword: (target: AdminUser) => void
}

function UserActions({
  target,
  tab,
  busy,
  isCurrentUser,
  onArchive,
  onRestore,
  onDelete,
  onResetPassword,
}: UserActionsProps) {
  if (isCurrentUser) {
    return <span className="text-xs text-cream/30">Jouw account</span>
  }

  if (tab === 'active') {
    return (
      <>
        <button
          type="button"
          onClick={() => onResetPassword(target)}
          disabled={busy}
          className="text-xs text-cream/50 hover:text-cream disabled:opacity-50"
        >
          Wachtwoord resetten
        </button>
        <button
          type="button"
          onClick={() => onArchive(target)}
          disabled={busy}
          className="text-xs text-cream/50 hover:text-flame disabled:opacity-50"
        >
          Archiveren
        </button>
      </>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => onRestore(target)}
        disabled={busy}
        className="text-xs text-cream/50 hover:text-cream disabled:opacity-50"
      >
        Herstellen
      </button>
      <button
        type="button"
        onClick={() => onDelete(target)}
        disabled={busy}
        className="text-xs text-cream/50 hover:text-flame disabled:opacity-50"
      >
        Verwijderen
      </button>
    </>
  )
}

function UserRow({
  target,
  tab,
  busy,
  isCurrentUser,
  onArchive,
  onRestore,
  onDelete,
  onResetPassword,
}: UserActionsProps) {
  return (
    <tr className={`border-b border-line/50 ${isCurrentUser ? 'bg-surface/40 text-cream/60' : ''}`}>
      <td className="py-3 pr-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40">
            {target.avatarUrl ? (
              <img src={target.avatarUrl} alt="" className="w-full h-full object-cover" />
            ) : (
              (target.username ?? '??').slice(0, 2).toUpperCase()
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <p className="truncate">{target.displayName || target.username || '—'}</p>
              {isCurrentUser && (
                <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-cream/40">
                  Jij
                </span>
              )}
            </div>
            {target.username && <p className="text-xs text-cream/40">@{target.username}</p>}
          </div>
        </div>
      </td>
      <td className="py-3 pr-4 text-cream/70">{target.email ?? '—'}</td>
      <td className="py-3 pr-4 text-cream/50">{relativeTime(target.createdAt)}</td>
      <td className="py-3 pr-4 text-right">{target.points}</td>
      <td className="py-3 pr-4 text-right">{target.recipeCount}</td>
      <td className="py-3 pr-4 text-right">{target.momentCount}</td>
      <td className="py-3 pl-4 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-3">
          <UserActions
            target={target}
            tab={tab}
            busy={busy}
            isCurrentUser={isCurrentUser}
            onArchive={onArchive}
            onRestore={onRestore}
            onDelete={onDelete}
            onResetPassword={onResetPassword}
          />
        </div>
      </td>
    </tr>
  )
}

function UserCard(props: UserActionsProps) {
  const { target, isCurrentUser } = props

  return (
    <article className={`border border-line rounded-md p-4 ${isCurrentUser ? 'bg-surface/40 text-cream/60' : 'bg-surface'}`}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40">
          {target.avatarUrl ? (
            <img src={target.avatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            (target.username ?? '??').slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-semibold truncate">{target.displayName || target.username || '—'}</p>
            {isCurrentUser && (
              <span className="rounded-full border border-line px-2 py-0.5 text-[10px] uppercase tracking-wide text-cream/40">
                Jij
              </span>
            )}
          </div>
          {target.username && <p className="text-xs text-cream/40">@{target.username}</p>}
          <p className="text-xs text-cream/60 mt-1 break-all">{target.email ?? '—'}</p>
        </div>
      </div>

      <dl className="grid grid-cols-4 gap-2 mt-4 border-y border-line/60 py-3 text-center">
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-cream/40">Sinds</dt>
          <dd className="text-xs mt-1">{relativeTime(target.createdAt)}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-cream/40">Punten</dt>
          <dd className="text-sm font-semibold mt-1">{target.points}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-cream/40">Recepten</dt>
          <dd className="text-sm font-semibold mt-1">{target.recipeCount}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wide text-cream/40">Momenten</dt>
          <dd className="text-sm font-semibold mt-1">{target.momentCount}</dd>
        </div>
      </dl>

      <div className="flex items-center justify-end gap-4 pt-3">
        <UserActions {...props} />
      </div>
    </article>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const admin = isAdminEmail(user?.email)
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('active')
  const [busyId, setBusyId] = useState<string | null>(null)

  function loadUsers() {
    return supabase.functions.invoke('admin-list-users').then(({ data, error: invokeError }) => {
      if (invokeError || data?.success === false) {
        setError(data?.error || 'Gebruikers laden mislukt.')
        return
      }
      setUsers(data.users)
    })
  }

  useEffect(() => {
    if (!admin) return
    loadUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin])

  const activeUsers = useMemo(() => (users ?? []).filter((u) => !u.archivedAt), [users])
  const archivedUsers = useMemo(() => (users ?? []).filter((u) => u.archivedAt), [users])

  const filtered = useMemo(() => {
    const list = tab === 'active' ? activeUsers : archivedUsers
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (u) =>
        u.username?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
    )
  }, [tab, activeUsers, archivedUsers, query])

  const stats = useMemo(() => {
    if (!users) return null
    const weekStart = startOfThisWeek().getTime()
    return {
      totalUsers: activeUsers.length,
      archivedUsers: archivedUsers.length,
      totalRecipes: activeUsers.reduce((sum, u) => sum + u.recipeCount, 0),
      totalMoments: activeUsers.reduce((sum, u) => sum + u.momentCount, 0),
      newThisWeek: activeUsers.filter((u) => new Date(u.createdAt).getTime() >= weekStart).length,
    }
  }, [users, activeUsers, archivedUsers])

  if (!admin) {
    return <Navigate to="/app" replace />
  }

  async function callAdminFn(fn: string, userId: string) {
    setBusyId(userId)
    setError(null)
    setNotice(null)
    const { data, error: invokeError } = await supabase.functions.invoke(fn, { body: { userId } })
    if (invokeError || data?.success === false) {
      setError(data?.error || 'Actie mislukt.')
      setBusyId(null)
      return false
    }
    setBusyId(null)
    return true
  }

  function labelFor(target: AdminUser) {
    return target.username ? `@${target.username}` : target.email || 'deze gebruiker'
  }

  async function handleArchive(target: AdminUser) {
    if (!confirm(`Weet je zeker dat je ${labelFor(target)} wilt archiveren? Diegene kan dan niet meer inloggen, maar de gegevens blijven bewaard.`)) {
      return
    }
    if (await callAdminFn('admin-archive-user', target.id)) await loadUsers()
  }

  async function handleRestore(target: AdminUser) {
    if (await callAdminFn('admin-restore-user', target.id)) await loadUsers()
  }

  async function handleDelete(target: AdminUser) {
    if (
      !confirm(
        `Weet je zeker dat je ${labelFor(target)} definitief wilt verwijderen? Dit verwijdert al hun recepten, momenten, video's en overige gegevens, en kan niet ongedaan gemaakt worden.`,
      )
    ) {
      return
    }
    if (await callAdminFn('admin-delete-user', target.id)) await loadUsers()
  }

  async function handleResetPassword(target: AdminUser) {
    if (!target.email) {
      setError('Geen e-mailadres bekend voor deze gebruiker.')
      return
    }
    setBusyId(target.id)
    setError(null)
    setNotice(null)
    await supabase.functions.invoke('send-password-reset-email', { body: { email: target.email } })
    setBusyId(null)
    setNotice(`Reset-link verstuurd naar ${target.email}.`)
  }

  return (
    <div className="max-w-5xl flex flex-col gap-8">
      <div>
        <h1 className="font-display text-3xl mb-1">Admin</h1>
        <p className="text-sm text-cream/50">Accountbeheer voor BBQHeros.</p>
      </div>

      {error && <p className="text-sm text-flame">{error}</p>}
      {notice && <p className="text-sm text-cream/60">{notice}</p>}

      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          {(
            [
              ['Chefs', stats.totalUsers],
              ['Recepten', stats.totalRecipes],
              ['Momenten', stats.totalMoments],
              ['Nieuw deze week', stats.newThisWeek],
              ['Gearchiveerd', stats.archivedUsers],
            ] as const
          ).map(([label, value]) => (
            <div key={label} className="bg-surface border border-line rounded-md p-4">
              <p className="text-2xl font-display">{value}</p>
              <p className="text-xs text-cream/50">{label}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2 border-b border-line">
        {(
          [
            ['active', `Actief${users ? ` (${activeUsers.length})` : ''}`],
            ['archived', `Archief${users ? ` (${archivedUsers.length})` : ''}`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === value ? 'border-flame text-cream' : 'border-transparent text-cream/50 hover:text-cream'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Zoek op gebruikersnaam, naam of e-mail..."
        className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
      />

      {users === null && <p className="text-cream/50 text-sm">Laden...</p>}

      {users !== null && (
        <>
          <div className="md:hidden flex flex-col gap-3">
            {filtered.map((u) => (
              <UserCard
                key={u.id}
                target={u}
                tab={tab}
                busy={busyId === u.id}
                isCurrentUser={u.id === user?.id}
                onArchive={handleArchive}
                onRestore={handleRestore}
                onDelete={handleDelete}
                onResetPassword={handleResetPassword}
              />
            ))}
          </div>

          <div className="hidden md:block overflow-x-auto">
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
                <UserRow
                  key={u.id}
                  target={u}
                  tab={tab}
                  busy={busyId === u.id}
                  isCurrentUser={u.id === user?.id}
                  onArchive={handleArchive}
                  onRestore={handleRestore}
                  onDelete={handleDelete}
                  onResetPassword={handleResetPassword}
                />
              ))}
            </tbody>
          </table>
          </div>

          {filtered.length === 0 && (
            <p className="text-cream/50 text-sm py-4">
              {tab === 'active' ? 'Niemand gevonden.' : 'Niemand gearchiveerd.'}
            </p>
          )}
        </>
      )}
    </div>
  )
}
