import { useEffect, useRef, useState } from 'react'
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
    <div className="hidden md:block border border-flame/25 bg-flame/5 rounded-md p-4 mt-4">
      <p className="font-display text-sm tracking-wide text-flame">DEZE WEEK</p>
      <p className="text-sm mt-1 text-cream/70">
        {count === 0
          ? 'Nog niks gelogd deze week. Tijd om het vuur aan te steken.'
          : `Je logde ${count} ${count === 1 ? 'recept' : 'recepten'}. Ga zo door, chef.`}
      </p>
    </div>
  )
}

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null)
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside()
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onOutside])
  return ref
}

function NewMenu() {
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  return (
    <div className="relative md:hidden" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Nieuw loggen"
        className="bg-flame hover:bg-flame-dark transition-colors text-ink w-9 h-9 rounded-full flex items-center justify-center text-lg font-semibold leading-none"
      >
        +
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-surface border border-line rounded-md shadow-lg overflow-hidden z-20">
          <NavLink
            to="/app/moment/nieuw"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-cream hover:bg-surface-2"
          >
            🔥 BBQ moment loggen
          </NavLink>
          <NavLink
            to="/app/kookboek/nieuw"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-cream hover:bg-surface-2 border-t border-line"
          >
            + Nieuw recept
          </NavLink>
        </div>
      )}
    </div>
  )
}

function ProfileMenu({ onSignOut }: { onSignOut: () => void }) {
  const { profile } = useAuth()
  const [open, setOpen] = useState(false)
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false))

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label="Accountmenu"
        className="w-9 h-9 rounded-full bg-surface-2 border border-line overflow-hidden flex items-center justify-center text-xs text-cream/60 shrink-0"
      >
        {profile?.avatar_url ? (
          <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
        ) : (
          profile?.username.slice(0, 2).toUpperCase() ?? '..'
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-44 bg-surface border border-line rounded-md shadow-lg overflow-hidden z-20">
          <NavLink
            to="/app/profiel"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-cream hover:bg-surface-2"
          >
            Profiel
          </NavLink>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              onSignOut()
            }}
            className="block w-full text-left px-4 py-2.5 text-sm text-cream/70 hover:bg-surface-2 hover:text-cream border-t border-line"
          >
            Uitloggen
          </button>
        </div>
      )}
    </div>
  )
}

export default function AppShell() {
  const { signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-svh bg-ink text-cream flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <NavLink to="/app" className="shrink-0">
            <Logo className="h-9" />
          </NavLink>

          <div className="flex-1" />

          <div className="hidden md:flex items-center gap-3 shrink-0">
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
          </div>

          <NewMenu />

          <ProfileMenu onSignOut={handleSignOut} />
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
