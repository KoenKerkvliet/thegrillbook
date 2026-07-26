import { useEffect, useState, type FormEvent } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/useAuth'
import { Logo } from '../../components/Logo'
import { supabase } from '../../lib/supabaseClient'
import { startOfThisWeek } from '../../lib/relativeTime'

const NAV_LINKS = [
  { to: '/app', label: 'Feed', end: true },
  { to: '/app/kookboek', label: 'Mijn kookboek', end: false },
  { to: '/app/chefs', label: 'Collega chefs', end: false },
  { to: '/app/profiel', label: 'Profiel', end: false },
]

function SidebarNav() {
  return (
    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
      {NAV_LINKS.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `whitespace-nowrap px-3 py-2.5 text-sm font-medium border-l-2 transition-colors ${
              isActive
                ? 'border-flame text-cream bg-surface'
                : 'border-transparent text-cream/60 hover:text-cream'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}

function WeekWidget() {
  const { user } = useAuth()
  const [count, setCount] = useState<number | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('recipes')
      .select('id', { count: 'exact', head: true })
      .eq('owner_id', user.id)
      .gte('created_at', startOfThisWeek().toISOString())
      .then(({ count }) => setCount(count ?? 0))
  }, [user])

  if (count === null) return null

  return (
    <div className="hidden md:block bg-cream text-ink p-4 mt-4">
      <p className="font-display text-sm tracking-wide">DEZE WEEK</p>
      <p className="text-sm mt-1 text-ink/70">
        {count === 0
          ? 'Nog niks gelogd deze week. Tijd om het vuur aan te steken.'
          : `Je logde ${count} ${count === 1 ? 'recept' : 'recepten'}. Ga zo door, chef.`}
      </p>
    </div>
  )
}

export default function AppShell() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [search, setSearch] = useState('')

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/app/chefs?q=${encodeURIComponent(search.trim())}`)
    }
  }

  return (
    <div className="min-h-svh bg-ink text-cream flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-6">
          <NavLink to="/app" className="shrink-0">
            <Logo className="h-9" />
          </NavLink>

          <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Zoek een kok..."
              className="w-full rounded-md bg-surface border border-line pl-3 pr-9 py-2 text-sm outline-none focus:border-flame"
            />
            <button
              type="submit"
              aria-label="Zoeken"
              className="absolute right-0 top-0 bottom-0 px-3 text-cream/40 hover:text-cream"
            >
              ⌕
            </button>
          </form>

          <div className="flex-1" />

          <div className="flex items-center gap-4 shrink-0">
            <NavLink
              to="/app/moment/nieuw"
              className="border border-line hover:border-cream/40 transition-colors text-cream text-sm font-semibold px-3 py-1.5 rounded-md"
            >
              🔥 Vuur aan
            </NavLink>
            <NavLink
              to="/app/kookboek/nieuw"
              className="bg-flame hover:bg-flame-dark transition-colors text-ink text-sm font-semibold px-3 py-1.5 rounded-md"
            >
              + Recept
            </NavLink>
            <NavLink
              to="/app/profiel"
              className="w-9 h-9 rounded-full bg-surface-2 border border-line overflow-hidden flex items-center justify-center text-xs text-cream/60 shrink-0"
            >
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.username.slice(0, 2).toUpperCase() ?? '..'
              )}
            </NavLink>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-cream/50 hover:text-cream hidden sm:inline"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto px-6 py-8 flex-1 flex flex-col md:flex-row gap-8">
        <aside className="md:w-52 shrink-0">
          <SidebarNav />
          <WeekWidget />
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
