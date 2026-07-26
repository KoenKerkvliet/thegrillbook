import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './_shared/cors.ts'
import { sendEmail } from './_shared/emailit.ts'

const SITE_URL = Deno.env.get('SITE_URL') || 'https://thegrillbook.nl'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function verificationEmailHtml(link: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Bevestig je e-mailadres</title>
</head>
<body style="margin:0;padding:0;background:#F2EDE4;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;opacity:0;">
    Nog een klik en je kookboek staat klaar.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F2EDE4" style="background:#F2EDE4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;max-width:600px;width:100%;">
          <tr>
            <td bgcolor="#0B0B0B" style="background:#0B0B0B;padding:28px 32px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:22px;letter-spacing:1px;color:#F2EDE4;">THE<span style="color:#FF5B14;">GRILL</span>BOOK</span>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.6;">
              <h1 style="margin:0 0 16px;font-size:20px;color:#0B0B0B;">Bevestig je e-mailadres</h1>
              <p style="margin:0 0 24px;">Hoi,<br>Bedankt voor je registratie bij TheGrillBook. Klik op de knop hieronder om je e-mailadres te bevestigen en je kookboek te openen.</p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${link}" style="background:#FF5B14;color:#0B0B0B;padding:14px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">Bevestig e-mailadres</a>
              </p>
              <p style="margin:0;font-size:13px;color:#666;">Werkt de knop niet? Kopieer deze link in je browser:<br><a href="${link}" style="color:#FF5B14;word-break:break-all;">${link}</a></p>
            </td>
          </tr>
          <tr>
            <td bgcolor="#F2EDE4" style="background:#F2EDE4;padding:16px 32px;color:#79746E;font-size:12px;text-align:center;">
              &copy; ${new Date().getFullYear()} TheGrillBook | thegrillbook.nl
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function verificationEmailText(link: string): string {
  return `Hoi,

Bedankt voor je registratie bij TheGrillBook. Klik op de link hieronder om je e-mailadres te bevestigen en je kookboek te openen.

${link}

Met vriendelijke groet,
TheGrillBook

--
(c) ${new Date().getFullYear()} TheGrillBook | thegrillbook.nl`
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { email, password, username, displayName } = await req.json()
    if (!email || !password || !username) {
      return json({ success: false, error: 'E-mail, wachtwoord en gebruikersnaam zijn verplicht.' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data, error } = await admin.auth.admin.generateLink({
      type: 'signup',
      email,
      password,
      options: {
        data: { username, display_name: displayName || username },
        redirectTo: `${SITE_URL}/#/bevestigen`,
      },
    })

    if (error || !data.properties?.hashed_token) {
      return json({ success: false, error: error?.message ?? 'Registreren mislukt.' }, 400)
    }

    const link = `${SITE_URL}/#/bevestigen?token_hash=${data.properties.hashed_token}&type=signup`

    await sendEmail({
      to: email,
      subject: 'Bevestig je e-mailadres',
      html: verificationEmailHtml(link),
      text: verificationEmailText(link),
    })

    return json({ success: true })
  } catch (err) {
    return json({ success: false, error: (err as Error).message }, 500)
  }
})
