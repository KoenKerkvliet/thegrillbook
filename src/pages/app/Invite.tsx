import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import QRCode from 'qrcode'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'

const SITE_URL = 'https://bbqheros.nl'

export default function Invite() {
  const { profile } = useAuth()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [email, setEmail] = useState('')
  const [sending, setSending] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const inviteUrl = useMemo(() => {
    const url = new URL('/registreren', SITE_URL)
    if (profile?.username) url.searchParams.set('ref', profile.username)
    return url.toString()
  }, [profile?.username])

  const shareText = `Steek jij graag de BBQ aan? Bekijk BBQHeros: je eigen BBQ-kookboek én een community van collega chefs. ${inviteUrl}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`

  useEffect(() => {
    if (!canvasRef.current) return
    QRCode.toCanvas(canvasRef.current, inviteUrl, {
      width: 220,
      margin: 1,
      color: { dark: '#0B0B0B', light: '#F2EDE4' },
      errorCorrectionLevel: 'M',
    })
  }, [inviteUrl])

  async function sendInvite(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    setMessage(null)
    const { data, error } = await supabase.functions.invoke('send-app-invite-email', {
      body: { email: email.trim(), inviteUrl },
    })
    setSending(false)
    if (error || !data?.success) {
      setMessage('Versturen lukte niet. Probeer het straks nog eens.')
      return
    }
    setEmail('')
    setMessage('Uitnodiging verstuurd!')
  }

  async function copyLink() {
    await navigator.clipboard.writeText(inviteUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="max-w-4xl">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest text-flame uppercase mb-2">
          Samen rond het vuur
        </p>
        <h1 className="font-display text-4xl mb-3">Deel BBQHeros</h1>
        <p className="text-cream/60 max-w-xl">
          Nodig je BBQ-maten uit. Zodra ze een account hebben, kun je elkaar volgen en verschijnen
          jullie recepten en momenten in elkaars feed.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        <section className="bg-surface border border-line rounded-md p-6">
          <p className="font-display text-xl mb-2">Scan de QR-code</p>
          <p className="text-sm text-cream/55 mb-5">
            Handig als jullie samen bij de kamado staan.
          </p>
          <div className="bg-cream rounded-md p-3 w-fit mx-auto">
            <canvas ref={canvasRef} aria-label="QR-code naar de registratiepagina van BBQHeros" />
          </div>
        </section>

        <div className="flex flex-col gap-5">
          <section className="bg-surface border border-line rounded-md p-6">
            <p className="font-display text-xl mb-2">Uitnodigen per e-mail</p>
            <p className="text-sm text-cream/55 mb-4">
              Wij sturen een nette uitnodiging uit jouw naam.
            </p>
            <form onSubmit={sendInvite} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="chef@voorbeeld.nl"
                className="flex-1 min-w-0 rounded-md bg-surface-2 border border-line px-3 py-2.5 outline-none focus:border-flame"
              />
              <button
                type="submit"
                disabled={sending}
                className="bg-flame hover:bg-flame-dark text-ink font-semibold rounded-md px-4 py-2.5 disabled:opacity-50"
              >
                {sending ? 'Versturen...' : 'Uitnodigen'}
              </button>
            </form>
            {message && <p className="text-sm text-cream/65 mt-3">{message}</p>}
          </section>

          <section className="bg-surface border border-line rounded-md p-6">
            <p className="font-display text-xl mb-2">Deel direct</p>
            <p className="text-sm text-cream/55 mb-4">
              Stuur je persoonlijke uitnodigingslink via WhatsApp of kopieer hem.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#25D366] hover:bg-[#20bd5a] text-ink font-semibold rounded-md px-4 py-2.5 text-center"
              >
                Deel via WhatsApp
              </a>
              <button
                type="button"
                onClick={copyLink}
                className="border border-line hover:border-cream/40 font-semibold rounded-md px-4 py-2.5"
              >
                {copied ? 'Link gekopieerd!' : 'Kopieer link'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
