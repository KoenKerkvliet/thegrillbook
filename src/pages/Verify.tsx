import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Logo } from '../components/Logo'

export default function Verify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!tokenHash || type !== 'signup') {
      setError('Deze bevestigingslink is ongeldig.')
      return
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'signup' }).then(({ error }) => {
      if (error) {
        setError('Deze bevestigingslink is verlopen of al gebruikt.')
        return
      }
      navigate('/app', { replace: true })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-svh bg-ink text-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">
        <Link to="/" className="flex justify-center mb-10">
          <Logo className="h-14" />
        </Link>
        {error ? (
          <>
            <h1 className="font-display text-3xl mb-4">Kon niet bevestigen</h1>
            <p className="text-cream/70 mb-6">{error}</p>
            <Link
              to="/registreren"
              className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-5 py-2.5 rounded-md inline-block"
            >
              Terug naar registreren
            </Link>
          </>
        ) : (
          <p className="text-cream/70">Je account wordt bevestigd...</p>
        )}
      </div>
    </div>
  )
}
