import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'

type FeedbackType = 'idea' | 'bug' | 'question'
type FeedbackStatus = 'new' | 'reviewed' | 'planned' | 'completed' | 'not_now'

type OwnFeedback = {
  id: string
  type: FeedbackType
  subject: string
  status: FeedbackStatus
  created_at: string
}

const statusLabels: Record<FeedbackStatus, string> = {
  new: 'Ontvangen',
  reviewed: 'Bekeken',
  planned: 'Gepland',
  completed: 'Afgerond',
  not_now: 'Niet gepland',
}

export default function Feedback() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [type, setType] = useState<FeedbackType>('idea')
  const [subject, setSubject] = useState('')
  const [details, setDetails] = useState('')
  const [items, setItems] = useState<OwnFeedback[]>([])
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    supabase
      .from('feedback_submissions')
      .select('id, type, subject, status, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(10)
      .then(({ data }) => setItems((data ?? []) as OwnFeedback[]))
  }, [user])

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!user || subject.trim().length < 2) return

    setBusy(true)
    setError(null)
    setMessage(null)
    const sourcePath = searchParams.get('from')
    const pageUrl = sourcePath ? `${window.location.origin}${sourcePath}` : null
    const { data, error: insertError } = await supabase
      .from('feedback_submissions')
      .insert({
        user_id: user.id,
        type,
        subject: subject.trim(),
        details: details.trim() || null,
        page_url: pageUrl,
      })
      .select('id, type, subject, status, created_at')
      .single()

    if (insertError || !data) {
      setError('Versturen lukte niet. Probeer het straks nog eens.')
      setBusy(false)
      return
    }

    setItems((current) => [data as OwnFeedback, ...current].slice(0, 10))
    setSubject('')
    setDetails('')
    const { data: mailData, error: mailError } = await supabase.functions.invoke('send-feedback-email', {
      body: { feedbackId: data.id },
    })
    setMessage(
      mailError || mailData?.success === false
        ? 'Je bericht is opgeslagen. De e-mailmelding kon niet direct worden verstuurd.'
        : 'Bedankt! Je bericht is verstuurd.',
    )
    setBusy(false)
  }

  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-flame mb-2">Samen beter</p>
      <h1 className="font-display text-4xl mb-2">Feedback & ideeën</h1>
      <p className="text-cream/60 mb-8">
        Mis je iets, werkt er iets niet of heb je een slim idee? Laat het hier weten.
      </p>

      <form onSubmit={submit} className="bg-surface border border-line rounded-md p-5 sm:p-6 space-y-5">
        <div>
          <label htmlFor="feedback-type" className="block text-sm font-semibold mb-2">Waar gaat het over?</label>
          <div className="grid grid-cols-3 gap-2">
            {([
              ['idea', 'Idee'],
              ['bug', 'Probleem'],
              ['question', 'Vraag'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={`rounded-md border px-3 py-2.5 text-sm font-semibold transition-colors ${
                  type === value
                    ? 'border-flame bg-flame/10 text-flame'
                    : 'border-line text-cream/60 hover:text-cream'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <select
            id="feedback-type"
            value={type}
            onChange={(e) => setType(e.target.value as FeedbackType)}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          >
            <option value="idea">Idee</option>
            <option value="bug">Probleem</option>
            <option value="question">Vraag</option>
          </select>
        </div>

        <div>
          <label htmlFor="feedback-subject" className="block text-sm font-semibold mb-2">Kort samengevat</label>
          <input
            id="feedback-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            maxLength={120}
            required
            className="w-full rounded-md bg-surface-2 border border-line px-3 py-2.5 outline-none focus:border-flame"
          />
        </div>

        <div>
          <label htmlFor="feedback-details" className="block text-sm font-semibold mb-2">
            Extra uitleg <span className="font-normal text-cream/40">(optioneel)</span>
          </label>
          <textarea
            id="feedback-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            maxLength={2000}
            rows={5}
            className="w-full resize-y rounded-md bg-surface-2 border border-line px-3 py-2.5 outline-none focus:border-flame"
          />
        </div>

        {error && <p className="text-sm text-flame">{error}</p>}
        {message && <p className="text-sm text-cream/70">{message}</p>}

        <button
          type="submit"
          disabled={busy || subject.trim().length < 2}
          className="rounded-md bg-flame px-5 py-2.5 font-semibold text-ink hover:bg-flame-dark disabled:opacity-50"
        >
          {busy ? 'Versturen...' : 'Verstuur bericht'}
        </button>
      </form>

      {items.length > 0 && (
        <section className="mt-10">
          <h2 className="font-display text-2xl mb-4">Jouw inzendingen</h2>
          <div className="space-y-2">
            {items.map((item) => (
              <article key={item.id} className="flex items-center justify-between gap-4 border border-line rounded-md px-4 py-3">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{item.subject}</p>
                  <p className="text-xs text-cream/40 mt-0.5">
                    {new Intl.DateTimeFormat('nl-NL', { dateStyle: 'medium' }).format(new Date(item.created_at))}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-line px-2.5 py-1 text-xs text-cream/60">
                  {statusLabels[item.status]}
                </span>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
