import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Logo } from '../components/Logo'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    await supabase.functions.invoke('send-password-reset-email', { body: { email } })
    setLoading(false)
    setSent(true)
  }

  return (
    <div className="min-h-svh bg-ink text-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex justify-center mb-10">
          <Logo className="h-14" />
        </Link>

        {sent ? (
          <div className="text-center" role="status" aria-live="polite">
            <h1 className="font-display text-3xl mb-4">Check je mail</h1>
            <p className="text-cream/70">
              Als er een account bestaat bij <strong>{email}</strong>, hebben we een link gestuurd
              om je wachtwoord opnieuw in te stellen.
            </p>
          </div>
        ) : (
          <>
            <h1 className="font-display text-3xl mb-8 text-center">Wachtwoord vergeten</h1>
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
              <button
                type="submit"
                disabled={loading}
                className="mt-2 bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md py-2.5 disabled:opacity-50"
              >
                {loading ? 'Bezig...' : 'Stuur resetlink'}
              </button>
            </form>
          </>
        )}

        <p className="text-sm text-cream/60 text-center mt-6">
          <Link to="/login" className="text-flame hover:underline">
            Terug naar inloggen
          </Link>
        </p>
      </div>
    </div>
  )
}
