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

function sharedEmailHtml(sharerName: string, sharerUsername: string, recipeTitle: string, recipeLink: string): string {
  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>Er is een recept met je gedeeld</title>
</head>
<body style="margin:0;padding:0;background:#F2EDE4;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;opacity:0;">
    ${sharerName} deelde "${recipeTitle}" met je.
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
              <h1 style="margin:0 0 16px;font-size:20px;color:#0B0B0B;">Er is een recept met je gedeeld</h1>
              <p style="margin:0 0 24px;"><strong>${sharerName}</strong> (@${sharerUsername}) deelde het recept <strong>"${recipeTitle}"</strong> met je.</p>
              <p style="margin:0 0 24px;text-align:center;">
                <a href="${recipeLink}" style="background:#FF5B14;color:#0B0B0B;padding:14px 28px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;">Bekijk het recept</a>
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

function sharedEmailText(sharerName: string, sharerUsername: string, recipeTitle: string, recipeLink: string): string {
  return `Hoi,

${sharerName} (@${sharerUsername}) deelde het recept "${recipeTitle}" met je.

${recipeLink}

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
      data: { user: sharer },
    } = await userClient.auth.getUser()
    if (!sharer) return json({ success: false, error: 'Unauthorized' }, 401)

    const { recipeId, sharedWithUserId } = await req.json()
    if (!recipeId || !sharedWithUserId) {
      return json({ success: false, error: 'recipeId en sharedWithUserId zijn verplicht.' }, 400)
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    // Only send if a genuine share row exists for this exact pair — avoids the
    // endpoint being used to email arbitrary people about arbitrary recipes.
    const [{ data: shareRow }, { data: recipe }, { data: sharerProfile }] = await Promise.all([
      admin
        .from('recipe_shares')
        .select('recipe_id')
        .eq('recipe_id', recipeId)
        .eq('shared_by', sharer.id)
        .eq('shared_with', sharedWithUserId)
        .maybeSingle(),
      admin.from('recipes').select('title').eq('id', recipeId).single(),
      admin.from('profiles').select('username, display_name').eq('id', sharer.id).single(),
    ])

    if (!shareRow || !recipe || !sharerProfile) return json({ success: true })

    const { data: recipient } = await admin.auth.admin.getUserById(sharedWithUserId)
    const recipientEmail = recipient?.user?.email
    if (!recipientEmail) return json({ success: true })

    const sharerName = sharerProfile.display_name || sharerProfile.username
    const recipeLink = `${SITE_URL}/#/app/recept/${recipeId}`

    await sendEmail({
      to: recipientEmail,
      subject: 'Er is een recept met je gedeeld',
      html: sharedEmailHtml(sharerName, sharerProfile.username, recipe.title, recipeLink),
      text: sharedEmailText(sharerName, sharerProfile.username, recipe.title, recipeLink),
    })

    return json({ success: true })
  } catch (err) {
    return json({ success: false, error: (err as Error).message }, 500)
  }
})
