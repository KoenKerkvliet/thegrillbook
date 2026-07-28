import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SITE_URL = Deno.env.get('SITE_URL') || 'https://bbqheros.nl'
const EMAILIT_API_KEY = Deno.env.get('EMAILIT_API_KEY')!
const EMAILIT_FROM = Deno.env.get('EMAILIT_FROM') || 'BBQHeros <noreply@bbqheros.nl>'
const EMAILIT_REPLY_TO = Deno.env.get('EMAILIT_REPLY_TO') || ''
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

async function sendEmail(payload: {
  to: string
  subject: string
  html: string
  text: string
}): Promise<void> {
  const body: Record<string, unknown> = {
    from: EMAILIT_FROM,
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
  if (EMAILIT_REPLY_TO) body.reply_to = EMAILIT_REPLY_TO

  const response = await fetch('https://api.emailit.com/v2/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${EMAILIT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`EmailIt API error: ${response.status}`)
  }
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    }
    return entities[character]
  })
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

    const body = await req.json()
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
      return json({ success: false, error: 'Invalid email' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    const { count } = await admin
      .from('app_invitations')
      .select('id', { count: 'exact', head: true })
      .eq('inviter_id', user.id)
      .gte('created_at', oneHourAgo)
    if ((count ?? 0) >= 10) {
      return json({ success: false, error: 'Rate limit reached' }, 429)
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('username, display_name')
      .eq('id', user.id)
      .single()
    if (!profile) return json({ success: false, error: 'Profile not found' }, 404)

    const inviterName = profile.display_name || profile.username
    const inviteUrl = `${SITE_URL}/registreren?ref=${encodeURIComponent(profile.username)}`
    const safeName = escapeHtml(inviterName)
    const safeUrl = escapeHtml(inviteUrl)

    await sendEmail({
      to: email,
      subject: `${inviterName} nodigt je uit voor BBQHeros`,
      html: `<!DOCTYPE html>
<html lang="nl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><title>Uitnodiging voor BBQHeros</title></head>
<body style="margin:0;background:#F2EDE4;font-family:Arial,Helvetica,sans-serif">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff">
<tr><td style="background:#0B0B0B;padding:28px 32px;color:#F2EDE4;font-size:22px;font-weight:900;letter-spacing:1px">BBQ<span style="color:#FF5B14">HEROS</span></td></tr>
<tr><td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.6">
<h1 style="margin:0 0 16px;font-size:22px">${safeName} nodigt je uit rond het vuur</h1>
<p>BBQHeros is je eigen digitale BBQ-kookboek én een plek om recepten, momenten en technieken met collega chefs te delen.</p>
<p style="text-align:center;margin:28px 0"><a href="${safeUrl}" style="background:#FF5B14;color:#0B0B0B;padding:14px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold">Maak je gratis account</a></p>
</td></tr>
<tr><td style="background:#F2EDE4;padding:16px 32px;color:#79746E;font-size:12px;text-align:center">&copy; ${new Date().getFullYear()} BBQHeros | bbqheros.nl</td></tr>
</table></td></tr></table></body></html>`,
      text: `${inviterName} nodigt je uit voor BBQHeros.\n\nMaak je gratis account:\n${inviteUrl}\n\nBBQHeros is je eigen digitale BBQ-kookboek en community voor collega chefs.`,
    })

    await admin.from('app_invitations').insert({
      inviter_id: user.id,
      recipient_email: email,
    })

    return json({ success: true })
  } catch (error) {
    return json({ success: false, error: (error as Error).message }, 500)
  }
})
