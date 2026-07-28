import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const SITE_URL = Deno.env.get('SITE_URL') || 'https://bbqheros.nl'
const LOGIN_URL = `${SITE_URL}/login`
const EMAILIT_API_KEY = Deno.env.get('EMAILIT_API_KEY')!
const EMAILIT_FROM = Deno.env.get('EMAILIT_FROM') || 'BBQHeros <noreply@bbqheros.nl>'
const EMAILIT_REPLY_TO = Deno.env.get('EMAILIT_REPLY_TO') || ''

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (character) =>
      ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      })[character]!,
  )
}

function welcomeEmailHtml(name: string): string {
  const safeName = escapeHtml(name)

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Je BBQHeros-account is klaar</title>
</head>
<body style="margin:0;padding:0;background:#F2EDE4;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;opacity:0;">
    Je account is bevestigd. Vanaf nu log je in via de gewone inlogpagina.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F2EDE4" style="background:#F2EDE4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;max-width:600px;width:100%;">
          <tr>
            <td bgcolor="#0B0B0B" style="background:#0B0B0B;padding:28px 32px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:22px;letter-spacing:1px;color:#F2EDE4;">BBQ<span style="color:#FF5B14;">HEROS</span></span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.6;">
              <h1 style="margin:0 0 16px;font-size:22px;color:#0B0B0B;">Je account is klaar, ${safeName}</h1>
              <p style="margin:0 0 18px;">Je e-mailadres is bevestigd en je kunt BBQHeros nu gebruiken.</p>
              <p style="margin:0 0 24px;"><strong>Goed om te weten:</strong> de bevestigingslink uit onze vorige e-mail is eenmalig. Wil je later terugkomen? Gebruik dan altijd de gewone inlogpagina met je e-mailadres en wachtwoord.</p>
              <p style="margin:0 0 28px;text-align:center;">
                <a href="${LOGIN_URL}" style="background:#FF5B14;color:#0B0B0B;padding:14px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">Inloggen bij BBQHeros</a>
              </p>
              <h2 style="margin:0 0 10px;font-size:17px;color:#0B0B0B;">Zo ga je van start</h2>
              <ul style="margin:0 0 24px;padding-left:20px;">
                <li style="margin-bottom:8px;">Voeg je eigen recepten toe aan <strong>Mijn kookboek</strong>.</li>
                <li style="margin-bottom:8px;">Log je BBQ-momenten en bouw je reeks en rang op.</li>
                <li style="margin-bottom:8px;">Volg collega-chefs en ontdek nieuwe inspiratie in je feed.</li>
                <li>Vul je profiel aan, zodat andere chefs weten wie er achter de grill staat.</li>
              </ul>
              <p style="margin:0;font-size:13px;color:#666;">Bewaar deze e-mail gerust. Je vaste inlogpagina is:<br><a href="${LOGIN_URL}" style="color:#FF5B14;word-break:break-all;">${LOGIN_URL}</a></p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#F2EDE4" style="background:#F2EDE4;padding:16px 32px;color:#79746E;font-size:12px;text-align:center;">
              &copy; ${new Date().getFullYear()} BBQHeros | bbqheros.nl
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function welcomeEmailText(name: string): string {
  return `Hoi ${name},

Je e-mailadres is bevestigd en je BBQHeros-account is klaar voor gebruik.

Goed om te weten: de bevestigingslink uit onze vorige e-mail is eenmalig. Wil je later terugkomen? Gebruik dan altijd de gewone inlogpagina met je e-mailadres en wachtwoord:

${LOGIN_URL}

Zo ga je van start:
- Voeg je eigen recepten toe aan Mijn kookboek.
- Log je BBQ-momenten en bouw je reeks en rang op.
- Volg collega-chefs en ontdek nieuwe inspiratie in je feed.
- Vul je profiel aan, zodat andere chefs weten wie er achter de grill staat.

Met vriendelijke groet,
BBQHeros

--
(c) ${new Date().getFullYear()} BBQHeros | bbqheros.nl`
}

async function sendEmail(to: string, name: string): Promise<void> {
  const headers: Record<string, string> = {
    'Auto-Submitted': 'auto-generated',
    'X-Auto-Response-Suppress': 'All',
    'X-Entity-Ref-ID': crypto.randomUUID(),
  }
  const body: Record<string, unknown> = {
    from: EMAILIT_FROM,
    to,
    subject: 'Je BBQHeros-account is klaar',
    html: welcomeEmailHtml(name),
    text: welcomeEmailText(name),
    headers,
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
    throw new Error(`EmailIt API error: ${response.status} ${await response.text()}`)
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ success: false, error: 'Method not allowed.' }, 405)

  const authHeader = req.headers.get('Authorization')
  if (!authHeader) return json({ success: false, error: 'Niet ingelogd.' }, 401)

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonClient = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: authHeader } },
  })
  const { data: userData, error: userError } = await anonClient.auth.getUser()
  const user = userData.user

  if (userError || !user?.email || !user.email_confirmed_at) {
    return json({ success: false, error: 'Geen bevestigd account gevonden.' }, 401)
  }

  const admin = createClient(supabaseUrl, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
  const { error: claimError } = await admin
    .from('welcome_emails')
    .insert({ user_id: user.id })

  if (claimError?.code === '23505') return json({ success: true, alreadySent: true })
  if (claimError) return json({ success: false, error: claimError.message }, 500)

  try {
    const { data: profile } = await admin
      .from('profiles')
      .select('display_name, username')
      .eq('id', user.id)
      .single()
    const name = profile?.display_name || profile?.username || 'chef'

    await sendEmail(user.email, name)
    return json({ success: true })
  } catch (error) {
    await admin.from('welcome_emails').delete().eq('user_id', user.id)
    return json({ success: false, error: (error as Error).message }, 500)
  }
})
