import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Logo } from '../components/Logo'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [status, setStatus] = useState<'verifying' | 'ready' | 'error'>('verifying')
  const [password, setPassword] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!tokenHash || type !== 'recovery') {
      setStatus('error')
      return
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'recovery' }).then(({ error }) => {
      setStatus(error ? 'error' : 'ready')
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (password.length < 6) {
      setError('Wachtwoord moet minstens 6 tekens zijn.')
      return
    }
    setError(null)
    setSaving(true)
    const { error } = await supabase.auth.updateUser({ password })
    setSaving(false)
    if (error) {
      setError(error.message)
      return
    }
    navigate('/app', { replace: true })
  }

  return (
    <div className="min-h-svh bg-ink text-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex justify-center mb-10">
          <Logo className="h-14" />
        </Link>

        {status === 'verifying' && <p className="text-cream/70 text-center">Even checken...</p>}

        {status === 'error' && (
          <div className="text-center">
            <h1 className="font-display text-3xl mb-4">Kon niet resetten</h1>
            <p className="text-cream/70 mb-6">
              Deze link is ongeldig of verlopen. Vraag een nieuwe aan.
            </p>
            <Link
              to="/wachtwoord-vergeten"
              className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-5 py-2.5 rounded-md inline-block"
            >
              Nieuwe link aanvragen
            </Link>
          </div>
        )}

        {status === 'ready' && (
          <>
            <h1 className="font-display text-3xl mb-8 text-center">Nieuw wachtwoord</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm text-cream/60 mb-1" htmlFor="password">
                  Nieuw wachtwoord
                </label>
                <input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
                />
              </div>
              {error && <p className="text-sm text-flame">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="mt-2 bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold rounded-md py-2.5 disabled:opacity-50"
              >
                {saving ? 'Bezig...' : 'Wachtwoord opslaan'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
