import { useEffect, useMemo, useState } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { isAdminEmail } from '../../lib/admin'
import { relativeTime, startOfThisWeek } from '../../lib/relativeTime'
import { setFeatureFlag, useFeatureFlag } from '../../lib/featureFlags'

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
type UserFilter = 'all' | 'recent' | 'inactive' | 'never' | 'with_content' | 'without_content'
type UserSort = 'newest' | 'last_active' | 'points' | 'content' | 'name'
type FeedbackStatus = 'new' | 'reviewed' | 'planned' | 'completed' | 'not_now'

type FeedbackItem = {
  id: string
  type: 'idea' | 'bug' | 'question'
  subject: string
  details: string | null
  page_url: string | null
  status: FeedbackStatus
  created_at: string
  email_notified_at: string | null
  profiles: { username: string; display_name: string | null } | null
}

const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  new: 'Nieuw',
  reviewed: 'Bekeken',
  planned: 'Gepland',
  completed: 'Afgerond',
  not_now: 'Niet gepland',
}

const feedbackTypeLabels = {
  idea: 'Idee',
  bug: 'Probleem',
  question: 'Vraag',
} as const

function LeaderboardToggle() {
  const { enabled, loaded, setEnabled } = useFeatureFlag('leaderboard')
  const [saving, setSaving] = useState(false)
  async function toggle() {
    setSaving(true)
    const next = !enabled
    const { error } = await setFeatureFlag('leaderboard', next)
    if (!error) setEnabled(next)
    setSaving(false)
  }
  return <section className="border border-line rounded-md bg-surface p-5"><h2 className="font-display text-2xl">Functies</h2><p className="text-sm text-cream/50 mt-1">Zet onderdelen aan wanneer de community er klaar voor is.</p><div className="mt-4 flex items-center justify-between gap-4"><div><p className="font-semibold">Maandranglijst</p><p className="text-xs text-cream/45 mt-1">Toont de leaderboard-pagina, navigatie en zijbalkkaart.</p></div><button type="button" disabled={!loaded || saving} onClick={toggle} className={`rounded-md px-4 py-2 text-sm font-semibold ${enabled ? 'bg-flame text-ink' : 'border border-line text-cream/70'}`}>{enabled ? 'Actief' : 'Verborgen'}</button></div></section>
}

function AdminFeedback() {
  const [items, setItems] = useState<FeedbackItem[] | null>(null)
  const [filter, setFilter] = useState<'all' | FeedbackStatus>('all')
  const [busyId, setBusyId] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('feedback_submissions')
      .select('id, type, subject, details, page_url, status, created_at, email_notified_at, profiles(username, display_name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => setItems((data ?? []) as unknown as FeedbackItem[]))
  }, [])

  async function updateStatus(id: string, status: FeedbackStatus) {
    setBusyId(id)
    const { error } = await supabase
      .from('feedback_submissions')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) {
      setItems((current) => current?.map((item) => item.id === id ? { ...item, status } : item) ?? [])
    }
    setBusyId(null)
  }

  const visible = (items ?? []).filter((item) => filter === 'all' || item.status === filter)
  const newCount = (items ?? []).filter((item) => item.status === 'new').length

  return (
    <section className="border border-line rounded-md bg-surface overflow-hidden">
      <div className="p-5 border-b border-line flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="font-display text-2xl">Feedback & ideeën</h2>
          <p className="text-sm text-cream/50 mt-1">
            {items === null ? 'Inzendingen laden...' : `${newCount} ${newCount === 1 ? 'nieuw bericht' : 'nieuwe berichten'}`}
          </p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as 'all' | FeedbackStatus)}
          className="rounded-md bg-surface-2 border border-line px-3 py-2 text-sm outline-none focus:border-flame"
        >
          <option value="all">Alle statussen</option>
          {Object.entries(feedbackStatusLabels).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </select>
      </div>

      {items !== null && visible.length === 0 && (
        <p className="p-5 text-sm text-cream/50">Nog geen inzendingen in deze selectie.</p>
      )}

      <div className="divide-y divide-line">
        {visible.map((item) => {
          const name = item.profiles?.display_name || item.profiles?.username || 'Onbekende gebruiker'
          return (
            <article key={item.id} className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-flame">
                      {feedbackTypeLabels[item.type]}
                    </span>
                    <span className="text-xs text-cream/35">{relativeTime(item.created_at)}</span>
                    {!item.email_notified_at && (
                      <span className="text-[10px] rounded-full border border-flame/40 px-2 py-0.5 text-flame">
                        E-mail niet bevestigd
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold">{item.subject}</h3>
                  {item.details && <p className="text-sm text-cream/65 whitespace-pre-wrap mt-2">{item.details}</p>}
                  <p className="text-xs text-cream/35 mt-3">
                    Van {name}{item.profiles?.username ? ` · @${item.profiles.username}` : ''}
                  </p>
                  {item.page_url && (
                    <a
                      href={item.page_url}
                      className="inline-block text-xs text-flame hover:underline mt-1 break-all"
                    >
                      Pagina bekijken
                    </a>
                  )}
                </div>
                <select
                  value={item.status}
                  disabled={busyId === item.id}
                  onChange={(e) => updateStatus(item.id, e.target.value as FeedbackStatus)}
                  className="shrink-0 rounded-md bg-surface-2 border border-line px-3 py-2 text-sm outline-none focus:border-flame disabled:opacity-50"
                  aria-label={`Status van ${item.subject}`}
                >
                  {Object.entries(feedbackStatusLabels).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

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
      <td className="py-3 pr-4 text-cream/50">
        {target.lastSignInAt ? relativeTime(target.lastSignInAt) : 'Nog nooit'}
      </td>
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
      <p className="mt-3 text-xs text-cream/40">
        Laatst actief: {target.lastSignInAt ? relativeTime(target.lastSignInAt) : 'nog nooit'}
      </p>

      <div className="flex items-center justify-end gap-4 pt-3">
        <UserActions {...props} />
      </div>
    </article>
  )
}

export default function Admin() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const admin = isAdminEmail(user?.email)
  const adminView = searchParams.get('view') === 'feedback' ? 'feedback' : 'users'
  const [users, setUsers] = useState<AdminUser[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<Tab>('active')
  const [userFilter, setUserFilter] = useState<UserFilter>('all')
  const [userSort, setUserSort] = useState<UserSort>('newest')
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
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    return list
      .filter((u) =>
        !q ||
        u.username?.toLowerCase().includes(q) ||
        u.displayName?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q),
      )
      .filter((u) => {
        if (userFilter === 'recent') {
          return Boolean(u.lastSignInAt && new Date(u.lastSignInAt).getTime() >= thirtyDaysAgo)
        }
        if (userFilter === 'inactive') {
          return Boolean(u.lastSignInAt && new Date(u.lastSignInAt).getTime() < thirtyDaysAgo)
        }
        if (userFilter === 'never') return !u.lastSignInAt
        if (userFilter === 'with_content') return u.recipeCount + u.momentCount > 0
        if (userFilter === 'without_content') return u.recipeCount + u.momentCount === 0
        return true
      })
      .sort((a, b) => {
        if (userSort === 'last_active') {
          return (b.lastSignInAt ? new Date(b.lastSignInAt).getTime() : 0)
            - (a.lastSignInAt ? new Date(a.lastSignInAt).getTime() : 0)
        }
        if (userSort === 'points') return b.points - a.points
        if (userSort === 'content') {
          return (b.recipeCount + b.momentCount) - (a.recipeCount + a.momentCount)
        }
        if (userSort === 'name') {
          return (a.displayName || a.username || a.email || '').localeCompare(
            b.displayName || b.username || b.email || '',
            'nl',
          )
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [tab, activeUsers, archivedUsers, query, userFilter, userSort])

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

      <LeaderboardToggle />

      {error && <p className="text-sm text-flame">{error}</p>}
      {notice && <p className="text-sm text-cream/60">{notice}</p>}

      <div className="flex items-center gap-2 border-b border-line">
        <button
          type="button"
          onClick={() => setSearchParams({})}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            adminView === 'users'
              ? 'border-flame text-cream'
              : 'border-transparent text-cream/50 hover:text-cream'
          }`}
        >
          Gebruikers
        </button>
        <button
          type="button"
          onClick={() => setSearchParams({ view: 'feedback' })}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            adminView === 'feedback'
              ? 'border-flame text-cream'
              : 'border-transparent text-cream/50 hover:text-cream'
          }`}
        >
          Ideeënbus
        </button>
      </div>

      {adminView === 'users' ? (
        <>
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

      <div className="grid gap-3 md:grid-cols-[1fr_190px_190px]">
        <label className="sr-only" htmlFor="admin-user-search">Gebruikers zoeken</label>
        <input
          id="admin-user-search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op gebruikersnaam, naam of e-mail..."
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
        />
        <label className="sr-only" htmlFor="admin-user-filter">Gebruikers filteren</label>
        <select
          id="admin-user-filter"
          value={userFilter}
          onChange={(e) => setUserFilter(e.target.value as UserFilter)}
          className="rounded-md bg-surface border border-line px-3 py-2 text-sm outline-none focus:border-flame"
        >
          <option value="all">Alle gebruikers</option>
          <option value="recent">Actief in 30 dagen</option>
          <option value="inactive">30+ dagen niet actief</option>
          <option value="never">Nog nooit ingelogd</option>
          <option value="with_content">Met eigen content</option>
          <option value="without_content">Zonder eigen content</option>
        </select>
        <label className="sr-only" htmlFor="admin-user-sort">Gebruikers sorteren</label>
        <select
          id="admin-user-sort"
          value={userSort}
          onChange={(e) => setUserSort(e.target.value as UserSort)}
          className="rounded-md bg-surface border border-line px-3 py-2 text-sm outline-none focus:border-flame"
        >
          <option value="newest">Nieuwste eerst</option>
          <option value="last_active">Laatst actief</option>
          <option value="points">Meeste punten</option>
          <option value="content">Meeste content</option>
          <option value="name">Naam A–Z</option>
        </select>
      </div>

      {users !== null && (
        <p className="text-xs text-cream/40">
          {filtered.length} {filtered.length === 1 ? 'gebruiker' : 'gebruikers'} gevonden
        </p>
      )}

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
                <th className="py-2 pr-4 font-medium">Laatst actief</th>
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
        </>
      ) : (
        <AdminFeedback />
      )}
    </div>
  )
}
