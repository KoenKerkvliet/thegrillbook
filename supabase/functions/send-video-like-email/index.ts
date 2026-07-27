import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './_shared/cors.ts'
import { sendEmail } from './_shared/emailit.ts'

const SITE_URL = Deno.env.get('SITE_URL') || 'https://bbqheros.nl'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function likeEmailHtml(likerName: string, likerUsername: string, feedLink: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Iemand heeft je video geliket</title>
</head>
<body style="margin:0;padding:0;background:#F2EDE4;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;opacity:0;">
    ${likerName} liket je gedeelde video.
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
              <h1 style="margin:0 0 16px;font-size:20px;color:#0B0B0B;">Iemand heeft je video geliket</h1>
              <p style="margin:0 0 24px;"><strong>${likerName}</strong> (@${likerUsername}) liket de video die je deelde.</p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${feedLink}" style="background:#FF5B14;color:#0B0B0B;padding:14px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">Bekijk je feed</a>
              </p>
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

function likeEmailText(likerName: string, likerUsername: string, feedLink: string): string {
  return `Hoi,

${likerName} (@${likerUsername}) liket de video die je deelde.

${feedLink}

Met vriendelijke groet,
BBQHeros

--
(c) ${new Date().getFullYear()} BBQHeros | bbqheros.nl`
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
    const {
      data: { user: liker },
    } = await userClient.auth.getUser()
    if (!liker) return json({ success: false, error: 'Unauthorized' }, 401)

    const { videoId } = await req.json()
    if (!videoId) return json({ success: false, error: 'videoId is verplicht.' }, 400)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const [{ data: video }, { data: likerProfile }] = await Promise.all([
      admin.from('videos').select('owner_id').eq('id', videoId).single(),
      admin.from('profiles').select('username, display_name').eq('id', liker.id).single(),
    ])

    if (!video || !likerProfile || video.owner_id === liker.id) {
      return json({ success: true }) // nothing to notify
    }

    const { data: owner } = await admin.auth.admin.getUserById(video.owner_id)
    const ownerEmail = owner?.user?.email
    if (!ownerEmail) return json({ success: true })

    const likerName = likerProfile.display_name || likerProfile.username
    const feedLink = `${SITE_URL}/app`

    await sendEmail({
      to: ownerEmail,
      subject: 'Iemand heeft je video geliket',
      html: likeEmailHtml(likerName, likerProfile.username, feedLink),
      text: likeEmailText(likerName, likerProfile.username, feedLink),
    })

    return json({ success: true })
  } catch (err) {
    return json({ success: false, error: (err as Error).message }, 500)
  }
})
