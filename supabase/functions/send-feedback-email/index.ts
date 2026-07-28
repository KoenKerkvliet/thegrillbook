import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = Deno.env.get('SITE_URL') || 'https://bbqheros.nl'
const FEEDBACK_TO = Deno.env.get('FEEDBACK_TO') || 'koen.kerkvliet@designpixels.nl'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: string) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

const typeLabels: Record<string, string> = {
  idea: 'Idee',
  bug: 'Probleem',
  question: 'Vraag',
}

async function sendEmail(payload: {
  to: string
  subject: string
  html: string
  text: string
  reply_to?: string
}) {
  const body: Record<string, unknown> = {
    from: Deno.env.get('EMAILIT_FROM') || 'BBQHeros <noreply@bbqheros.nl>',
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
    headers: {
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'All',
      'X-Entity-Ref-ID': crypto.randomUUID(),
    },
  }
  if (payload.reply_to) body.reply_to = payload.reply_to

  const response = await fetch('https://api.emailit.com/v2/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${Deno.env.get('EMAILIT_API_KEY')!}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`Emailit API error: ${response.status} ${await response.text()}`)
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ success: false, error: 'Unauthorized' }, 401)

    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } },
    )
    const { data: { user } } = await userClient.auth.getUser()
    if (!user) return json({ success: false, error: 'Unauthorized' }, 401)

    const { feedbackId } = await req.json()
    if (!feedbackId) return json({ success: false, error: 'Feedback ontbreekt.' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const { data: feedback, error } = await admin
      .from('feedback_submissions')
      .select('id, user_id, type, subject, details, page_url, created_at, email_notified_at, profiles(username, display_name)')
      .eq('id', feedbackId)
      .single()

    if (error || !feedback || feedback.user_id !== user.id) {
      return json({ success: false, error: 'Feedback niet gevonden.' }, 404)
    }
    if (feedback.email_notified_at) return json({ success: true })

    const profile = Array.isArray(feedback.profiles) ? feedback.profiles[0] : feedback.profiles
    const name = profile?.display_name || profile?.username || user.email || 'Onbekende gebruiker'
    const username = profile?.username ? `@${profile.username}` : ''
    const type = typeLabels[feedback.type] || 'Feedback'
    const details = feedback.details?.trim() || 'Geen extra toelichting.'
    const page = feedback.page_url?.trim() || 'Niet opgegeven'
    const adminLink = `${SITE_URL}/app/admin?view=feedback`

    await sendEmail({
      to: FEEDBACK_TO,
      reply_to: user.email || undefined,
      subject: `[BBQHeros ${type}] ${feedback.subject}`,
      html: `<!doctype html>
<html lang="nl"><body style="margin:0;background:#f2ede4;font-family:Arial,Helvetica,sans-serif;color:#1a1a1a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff">
<tr><td style="background:#0b0b0b;padding:24px 30px;color:#f2ede4;font-weight:900;font-size:22px">BBQ<span style="color:#ff5b14">HEROS</span></td></tr>
<tr><td style="padding:30px;line-height:1.6">
<p style="margin:0 0 8px;color:#ff5b14;font-size:13px;font-weight:bold;text-transform:uppercase">${escapeHtml(type)}</p>
<h1 style="margin:0 0 22px;font-size:23px">${escapeHtml(feedback.subject)}</h1>
<p style="white-space:pre-wrap;margin:0 0 22px">${escapeHtml(details)}</p>
<table role="presentation" width="100%" cellpadding="6" cellspacing="0" style="background:#f7f4ef;font-size:13px">
<tr><td><strong>Van</strong></td><td>${escapeHtml(name)} ${escapeHtml(username)}</td></tr>
<tr><td><strong>E-mail</strong></td><td>${escapeHtml(user.email || 'Onbekend')}</td></tr>
<tr><td><strong>Pagina</strong></td><td>${escapeHtml(page)}</td></tr>
</table>
<p style="margin:24px 0 0"><a href="${adminLink}" style="display:inline-block;background:#ff5b14;color:#0b0b0b;text-decoration:none;font-weight:bold;padding:12px 20px;border-radius:4px">Bekijk in beheer</a></p>
</td></tr></table></td></tr></table></body></html>`,
      text: `${type}: ${feedback.subject}

${details}

Van: ${name} ${username}
E-mail: ${user.email || 'Onbekend'}
Pagina: ${page}

Bekijk in beheer: ${adminLink}`,
    })

    await admin
      .from('feedback_submissions')
      .update({ email_notified_at: new Date().toISOString() })
      .eq('id', feedback.id)
      .is('email_notified_at', null)

    return json({ success: true })
  } catch (err) {
    return json({ success: false, error: (err as Error).message }, 500)
  }
})
