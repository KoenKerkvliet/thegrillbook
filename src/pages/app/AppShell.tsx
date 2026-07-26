import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth/useAuth'
import { Logo } from '../../components/Logo'

const NAV_LINKS = [
  { to: '/app', label: 'Feed', end: true },
  { to: '/app/kookboek', label: 'Kookboek', end: false },
  { to: '/app/chefs', label: 'Collega chefs', end: false },
]

export default function AppShell() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <div className="min-h-svh bg-ink text-cream flex flex-col">
      <header className="border-b border-line">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between gap-6">
          <NavLink to="/app" className="shrink-0">
            <Logo className="h-10" />
          </NavLink>

          <nav className="flex items-center gap-6 text-sm overflow-x-auto">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `whitespace-nowrap transition-colors ${
                    isActive ? 'text-flame font-semibold' : 'text-cream/70 hover:text-cream'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex items-center gap-4 shrink-0">
            <NavLink
              to="/app/kookboek/nieuw"
              className="bg-flame hover:bg-flame-dark transition-colors text-ink text-sm font-semibold px-3 py-1.5 rounded-md"
            >
              + Nieuw recept
            </NavLink>
            <NavLink to="/app/profiel" className="text-sm text-cream/70 hover:text-cream">
              @{profile?.username ?? '...'}
            </NavLink>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-sm text-cream/50 hover:text-cream"
            >
              Uitloggen
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-8">
        <Outlet />
      </main>
    </div>
  )
}
