const EMAILIT_API_KEY = Deno.env.get('EMAILIT_API_KEY')!
const EMAILIT_FROM = Deno.env.get('EMAILIT_FROM') || 'BBQHeros <noreply@bbqheros.nl>'
const EMAILIT_REPLY_TO = Deno.env.get('EMAILIT_REPLY_TO') || ''

export interface EmailitPayload {
  to: string
  subject: string
  html: string
  text: string // VERPLICHT - niet auto-genereren!
  from?: string
  reply_to?: string
  headers?: Record<string, string>
}

export async function sendEmail(payload: EmailitPayload): Promise<void> {
  const refId = crypto.randomUUID()

  const baseHeaders: Record<string, string> = {
    'Auto-Submitted': 'auto-generated',
    'X-Auto-Response-Suppress': 'All',
    'X-Entity-Ref-ID': refId,
  }

  const body: Record<string, unknown> = {
    from: payload.from || EMAILIT_FROM,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    headers: { ...baseHeaders, ...(payload.headers || {}) },
  }

  const replyTo = payload.reply_to || EMAILIT_REPLY_TO
  if (replyTo) body.reply_to = replyTo

  const response = await fetch('https://api.emailit.com/v2/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${EMAILIT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`EmailIt API error: ${response.status} ${errorText}`)
  }
}
