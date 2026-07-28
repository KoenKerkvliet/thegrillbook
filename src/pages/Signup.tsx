import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Logo } from '../components/Logo'

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/

export default function Signup() {
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [checkEmail, setCheckEmail] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!USERNAME_PATTERN.test(username)) {
      setError('Gebruikersnaam: 3-20 tekens, alleen a-z, 0-9 en _.')
      return
    }

    setLoading(true)
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: { email, password, username, displayName: displayName || username },
    })
    setLoading(false)

    const invokeError = error || (data && data.success === false ? new Error(data.error) : null)
    if (invokeError) {
      const message = invokeError.message.toLowerCase()
      if (message.includes('already registered') || message.includes('already been registered')) {
        setError('Dit e-mailadres is al in gebruik.')
      } else if (message.includes('username')) {
        setError('Deze gebruikersnaam is al bezet, kies een andere.')
      } else {
        setError(invokeError.message || 'Registreren mislukt.')
      }
      return
    }

    setCheckEmail(true)
  }

  if (checkEmail) {
    return (
      <div className="min-h-svh bg-ink text-cream flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center" role="status" aria-live="polite">
          <h1 className="font-display text-3xl mb-4">Check je mail</h1>
          <p className="text-cream/70">
            We hebben een bevestigingslink gestuurd naar <strong>{email}</strong>. Klik erop om je
            account te activeren.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-svh bg-ink text-cream flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-sm text-cream/50 hover:text-cream flex justify-center mb-6">
          ← Terug naar de homepage
        </Link>
        <Link to="/" className="flex justify-center mb-10">
          <Logo className="h-14" />
        </Link>

        <h1 className="font-display text-3xl mb-8 text-center">Maak een account</h1>

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
            <label className="block text-sm text-cream/60 mb-1" htmlFor="username">
              Gebruikersnaam
            </label>
            <input
              id="username"
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
            />
          </div>
          <div>
            <label className="block text-sm text-cream/60 mb-1" htmlFor="displayName">
              Naam (optioneel)
            </label>
            <input
              id="displayName"
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
            />
          </div>
          <div>
            <label className="block text-sm text-cream/60 mb-1" htmlFor="password">
              Wachtwoord
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={6}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-describedby={`signup-password-help${error ? ' signup-error' : ''}`}
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
            <p id="signup-password-help" className="text-xs text-cream/45 mt-1">
              Minimaal 6 tekens.
            </p>
          </div>

          {error && (
            <p id="signup-error" role="alert" aria-live="assertive" className="text-sm text-flame">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md py-2.5 disabled:opacity-50"
          >
            {loading ? 'Bezig...' : 'Account aanmaken'}
          </button>
        </form>

        <p className="text-sm text-cream/60 text-center mt-6">
          Al een account?{' '}
          <Link to="/login" className="text-flame hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}
