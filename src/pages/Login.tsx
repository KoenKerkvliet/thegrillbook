import { useState, type FormEvent } from 'react'
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth/useAuth'
import { Logo } from '../components/Logo'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, loading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const from = (location.state as { from?: string } | null)?.from ?? '/app'

  if (!authLoading && user) {
    return <Navigate to={from} replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError('Inloggen mislukt. Klopt je e-mail en wachtwoord?')
      return
    }
    navigate(from, { replace: true })
  }

  return (
    <div className="min-h-svh bg-ink text-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-sm text-cream/50 hover:text-cream flex justify-center mb-6">
          ← Terug naar de homepage
        </Link>
        <Link to="/" className="flex justify-center mb-10">
          <Logo className="h-14" />
        </Link>

        <h1 className="font-display text-3xl mb-8 text-center">Inloggen</h1>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm text-cream/60 mb-1" htmlFor="email">
              E-mail
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm text-cream/60" htmlFor="password">
                Wachtwoord
              </label>
              <Link to="/wachtwoord-vergeten" className="text-xs text-flame hover:underline">
                Wachtwoord vergeten?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={error ? 'login-error' : undefined}
                className="w-full rounded-md bg-surface border border-line px-3 py-2 pr-20 outline-none focus:border-flame"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute inset-y-0 right-3 text-xs font-semibold text-cream/50 hover:text-cream"
                aria-label={showPassword ? 'Wachtwoord verbergen' : 'Wachtwoord tonen'}
              >
                {showPassword ? 'Verberg' : 'Toon'}
              </button>
            </div>
          </div>

          {error && (
            <p id="login-error" role="alert" aria-live="assertive" className="text-sm text-flame">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md py-2.5 disabled:opacity-50"
          >
            {loading ? 'Bezig...' : 'Inloggen'}
          </button>
        </form>

        <p className="text-sm text-cream/60 text-center mt-6">
          Nog geen account?{' '}
          <Link to="/registreren" className="text-flame hover:underline">
            Maak er een aan
          </Link>
        </p>
      </div>
    </div>
  )
}
