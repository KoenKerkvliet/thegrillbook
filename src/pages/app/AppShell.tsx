import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/useAuth'
import { Logo } from '../../components/Logo'
import { supabase } from '../../lib/supabaseClient'
import { startOfThisWeek } from '../../lib/relativeTime'
import { isAdminEmail } from '../../lib/admin'
import { NotificationBell } from '../../components/NotificationBell'

const NAV_LINKS = [
  { to: '/app', label: 'Feed', end: true },
  { to: '/app/kookboek', label: 'Mijn kookboek', end: false },
  { to: '/app/chefs', label: 'Collega chefs', end: false },
  { to: '/app/leaderboard', label: 'Leaderboard', end: false },
  { to: '/app/profiel', label: 'Profiel', end: false },
]

const ADMIN_LINKS = [
  { to: '/app/admin', label: 'Beheer', end: false },
  { to: '/app/profiel', label: 'Profiel', end: false },
]

function MobileNavIcon({ name }: { name: string }) {
  const common = {
    width: 21,
    height: 21,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  }

  if (name === 'Feed') {
    return <svg {...common}><path d="M4 5h16M4 12h16M4 19h10" /></svg>
  }
  if (name === 'Mijn kookboek') {
    return <svg {...common}><path d="M5 4.5A2.5 2.5 0 0 1 7.5 2H20v17H7.5A2.5 2.5 0 0 0 5 21.5z" /><path d="M5 4.5v17M9 6h7" /></svg>
  }
  if (name === 'Collega chefs') {
    return <svg {...common}><circle cx="9" cy="8" r="3" /><path d="M3.5 19c.5-3.2 2.3-5 5.5-5s5 1.8 5.5 5M16 6.5a3 3 0 0 1 0 5.8M16.5 14c2.5.4 3.8 2 4 4.5" /></svg>
  }
  if (name === 'Leaderboard') {
    return <svg {...common}><path d="M8 21h8M12 17v4M7 4h10v3a5 5 0 0 1-10 0z" /><path d="M7 6H4v1a4 4 0 0 0 4 4M17 6h3v1a4 4 0 0 1-4 4" /></svg>
  }
  if (name === 'Beheer') {
    return <svg {...common}><path d="M12 3 4.5 6v5.5c0 4.7 3 8 7.5 9.5 4.5-1.5 7.5-4.8 7.5-9.5V6z" /><path d="M8.5 10h7M8.5 14h4" /></svg>
  }
  return <svg {...common}><circle cx="12" cy="8" r="3.5" /><path d="M5 21c.6-4.2 2.9-6.5 7-6.5s6.4 2.3 7 6.5" /></svg>
}

function SidebarNav() {
  const { user } = useAuth()
  const links = isAdminEmail(user?.email) ? ADMIN_LINKS : NAV_LINKS

  return (
    <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
      {links.map((link) => (
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

function MobileBottomNav() {
  const { user } = useAuth()
  const links = isAdminEmail(user?.email) ? ADMIN_LINKS : NAV_LINKS

  return (
    <nav
      className="md:hidden fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur-md"
      aria-label="Hoofdnavigatie"
    >
      <div className={`grid ${links.length === 2 ? 'grid-cols-2' : 'grid-cols-5'} px-1 pb-[max(0.35rem,env(safe-area-inset-bottom))]`}>
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `relative flex flex-col items-center justify-center gap-1 min-h-16 px-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-flame' : 'text-cream/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute top-0 w-8 h-0.5 rounded-full bg-flame" />}
                <MobileNavIcon name={link.label} />
                <span>
                  {link.label === 'Mijn kookboek'
                    ? 'Kookboek'
                    : link.label === 'Leaderboard'
                      ? 'Ranking'
                      : link.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
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

function LeaderboardWidget() {
  return (
    <NavLink
      to="/app/leaderboard"
      className="hidden md:block border border-line hover:border-flame/40 bg-surface rounded-md p-4 mt-4 transition-colors group"
    >
      <p className="font-display text-sm tracking-wide text-cream group-hover:text-flame transition-colors">
        MAANDRANGLIJST
      </p>
      <p className="text-xs mt-1 text-cream/50">Bekijk jouw positie tussen de chefs die je volgt.</p>
      <span className="inline-block text-xs font-semibold text-flame mt-3">Bekijk leaderboard →</span>
    </NavLink>
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
            to="/app/video/nieuw"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-cream hover:bg-surface-2 border-t border-line"
          >
            📺 Video delen
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
          <NavLink
            to="/app/delen"
            onClick={() => setOpen(false)}
            className="block px-4 py-2.5 text-sm text-cream hover:bg-surface-2 border-t border-line"
          >
            BBQHeros delen
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
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const admin = isAdminEmail(user?.email)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-svh bg-ink text-cream flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-4">
          <NavLink to={admin ? '/app/admin' : '/app'} className="shrink-0">
            <Logo className="h-9" />
          </NavLink>

          <div className="flex-1" />

          {!admin && (
            <>
              <div className="hidden md:flex items-center gap-3 shrink-0">
                <NavLink
                  to="/app/moment/nieuw"
                  className="border border-line hover:border-cream/40 transition-colors text-cream text-sm font-semibold px-3 py-1.5 rounded-md"
                >
                  🔥 Vuur aan
                </NavLink>
                <NavLink
                  to="/app/video/nieuw"
                  className="border border-line hover:border-cream/40 transition-colors text-cream text-sm font-semibold px-3 py-1.5 rounded-md"
                >
                  📺 Video
                </NavLink>
                <NavLink
                  to="/app/kookboek/nieuw"
                  className="bg-flame hover:bg-flame-dark transition-colors text-ink text-sm font-semibold px-3 py-1.5 rounded-md"
                >
                  + Recept
                </NavLink>
              </div>

              <NewMenu />
            </>
          )}

          {!admin && <NotificationBell />}
          <ProfileMenu onSignOut={handleSignOut} />
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6 pb-24 md:py-8 flex-1 flex flex-col md:flex-row gap-8">
        <aside className="hidden md:block md:w-52 shrink-0">
          <SidebarNav />
          {!admin && (
            <>
              <WeekWidget />
              <LeaderboardWidget />
            </>
          )}
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
      <MobileBottomNav />
    </div>
  )
}
