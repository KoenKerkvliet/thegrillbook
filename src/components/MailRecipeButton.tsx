import { useState, type FormEvent } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth/useAuth'

type Status = 'idle' | 'sending' | 'sent' | 'error'

export function MailRecipeButton({
  recipeId,
  overlay = false,
}: {
  recipeId: string
  overlay?: boolean
}) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [customEmail, setCustomEmail] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  async function send(customEmailValue?: string) {
    setStatus('sending')
    setErrorMessage('')
    const { data, error } = await supabase.functions.invoke('send-recipe-email', {
      body: customEmailValue ? { recipeId, customEmail: customEmailValue } : { recipeId },
    })
    if (error || data?.success === false) {
      setStatus('error')
      setErrorMessage(data?.error || 'Versturen mislukt, probeer opnieuw.')
      return
    }
    setStatus('sent')
    setCustomEmail('')
  }

  function handleSendToSelf() {
    if (status === 'sending') return
    send()
  }

  function handleSendCustom(e: FormEvent) {
    e.preventDefault()
    if (status === 'sending' || !customEmail.trim()) return
    send(customEmail.trim())
  }

  function toggle() {
    setOpen((o) => !o)
    setStatus('idle')
    setErrorMessage('')
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label="Mail dit recept"
        title="Mail dit recept"
        className={
          overlay
            ? 'flex items-center justify-center w-8 h-8 rounded-full bg-ink/70 backdrop-blur-sm text-cream hover:bg-ink/90 transition-colors'
            : 'flex items-center justify-center w-9 h-9 rounded-md border border-line text-cream/70 hover:border-cream/40 transition-colors'
        }
      >
        <span aria-hidden="true">✉️</span>
      </button>
      {open && (
        <div className="absolute z-20 top-full right-0 mt-2 w-64 bg-surface border border-line rounded-md p-3 shadow-lg text-left">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-cream/50">Mail dit recept</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
              className="text-cream/40 hover:text-cream text-xs"
            >
              ✕
            </button>
          </div>

          <button
            type="button"
            onClick={handleSendToSelf}
            disabled={status === 'sending'}
            className="w-full text-sm mb-2 bg-flame/10 border border-flame text-flame rounded-md py-1.5 hover:bg-flame/20 transition-colors disabled:opacity-50"
          >
            {status === 'sending' ? 'Versturen...' : `Mail naar mezelf${user?.email ? ` (${user.email})` : ''}`}
          </button>

          <form onSubmit={handleSendCustom} className="flex gap-1.5">
            <input
              type="email"
              required
              value={customEmail}
              onChange={(e) => setCustomEmail(e.target.value)}
              placeholder="ander@mailadres.nl"
              className="flex-1 min-w-0 rounded-md bg-surface-2 border border-line px-2 py-1.5 text-xs outline-none focus:border-flame"
            />
            <button
              type="submit"
              disabled={status === 'sending'}
              className="text-xs px-2 rounded-md border border-line hover:border-cream/40 transition-colors disabled:opacity-50"
            >
              Verstuur
            </button>
          </form>

          {status === 'sent' && <p className="text-xs text-flame mt-2">Verstuurd ✓</p>}
          {status === 'error' && <p className="text-xs text-red-400 mt-2">{errorMessage}</p>}
        </div>
      )}
    </div>
  )
}
