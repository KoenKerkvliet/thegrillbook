import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { Logo } from '../components/Logo'

export default function Verify() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [issue, setIssue] = useState<'invalid' | 'used-or-expired' | null>(null)

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash')
    const type = searchParams.get('type')

    if (!tokenHash || type !== 'signup') {
      setIssue('invalid')
      return
    }

    supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'signup' }).then(({ error }) => {
      if (error) {
        setIssue('used-or-expired')
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
        {issue ? (
          <div role="alert" aria-live="assertive">
            <h1 className="font-display text-3xl mb-4">
              {issue === 'used-or-expired' ? 'Account mogelijk al bevestigd' : 'Ongeldige link'}
            </h1>
            <p className="text-cream/70 mb-6">
              {issue === 'used-or-expired'
                ? 'Deze bevestigingslink is eenmalig en is al gebruikt of verlopen. Heb je eerder bevestigd? Log dan gewoon in met je e-mailadres en wachtwoord.'
                : 'Deze bevestigingslink is niet compleet. Open de volledige link uit de bevestigingsmail opnieuw.'}
            </p>
            <Link
              to="/login"
              className="bg-flame hover:bg-flame-dark transition-colors text-ink font-semibold px-5 py-2.5 rounded-md inline-block"
            >
              Naar inloggen
            </Link>
            <p className="text-sm text-cream/50 mt-5">
              Lukt inloggen niet?{' '}
              <Link to="/wachtwoord-vergeten" className="text-flame hover:underline">
                Stel een nieuw wachtwoord in
              </Link>
              .
            </p>
          </div>
        ) : (
          <p className="text-cream/70">Je account wordt bevestigd...</p>
        )}
      </div>
    </div>
  )
}
