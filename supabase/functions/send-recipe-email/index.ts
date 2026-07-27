import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './_shared/cors.ts'
import { sendEmail } from './_shared/emailit.ts'

const SITE_URL = Deno.env.get('SITE_URL') || 'https://bbqheros.nl'
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function ratingStars(rating: number | null): string {
  if (!rating) return ''
  return '★'.repeat(rating) + '☆'.repeat(5 - rating)
}

type RecipeCardParams = {
  title: string
  description: string | null
  coverPhotoUrl: string | null
  cookTimeMinutes: number | null
  servings: number | null
  rating: number | null
  ingredients: string[]
  steps: string[]
  youtubeUrl: string | null
  ownerName: string
  ownerUsername: string
  recipeLink: string
}

function metaLine(params: RecipeCardParams): string {
  const bits: string[] = []
  if (params.rating) bits.push(ratingStars(params.rating))
  if (params.cookTimeMinutes != null) bits.push(`${params.cookTimeMinutes} min`)
  if (params.servings != null) bits.push(`${params.servings} personen`)
  return bits.join('  ·  ')
}

function recipeCardHtml(p: RecipeCardParams): string {
  const meta = metaLine(p)

  const bannerRow = p.coverPhotoUrl
    ? `<tr><td style="padding:0;"><img src="${p.coverPhotoUrl}" alt="" width="600" style="display:block;width:100%;max-width:600px;height:200px;object-fit:cover;" /></td></tr>`
    : ''

  const ingredientsHtml = p.ingredients.length
    ? `<h2 style="margin:24px 0 8px;font-size:16px;color:#0B0B0B;">Ingrediënten</h2>
       <ul style="margin:0 0 8px;padding-left:20px;color:#1a1a1a;font-size:14px;line-height:1.7;">
         ${p.ingredients.map((i) => `<li>${escapeHtml(i)}</li>`).join('')}
       </ul>`
    : ''

  const stepsHtml = p.steps.length
    ? `<h2 style="margin:24px 0 8px;font-size:16px;color:#0B0B0B;">Stappen</h2>
       <ol style="margin:0 0 8px;padding-left:20px;color:#1a1a1a;font-size:14px;line-height:1.7;">
         ${p.steps.map((s) => `<li style="margin-bottom:6px;">${escapeHtml(s)}</li>`).join('')}
       </ol>`
    : ''

  const youtubeHtml = p.youtubeUrl
    ? `<p style="margin:16px 0 0;font-size:14px;"><a href="${p.youtubeUrl}" style="color:#FF5B14;">Bekijk de video op YouTube</a></p>`
    : ''

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${escapeHtml(p.title)}</title>
</head>
<body style="margin:0;padding:0;background:#F2EDE4;font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:#fff;opacity:0;">
    ${escapeHtml(p.title)} — bewaar dit recept van BBQHeros.
  </div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#F2EDE4" style="background:#F2EDE4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" bgcolor="#ffffff" style="background:#ffffff;max-width:600px;width:100%;">
          <tr>
            <td bgcolor="#0B0B0B" style="background:#0B0B0B;padding:20px 32px;">
              <span style="font-family:Arial,Helvetica,sans-serif;font-weight:900;font-size:20px;letter-spacing:1px;color:#F2EDE4;">BBQ<span style="color:#FF5B14;">HEROS</span></span>
            </td>
          </tr>
          ${bannerRow}
          <tr>
            <td style="padding:28px 32px 8px;">
              <h1 style="margin:0 0 6px;font-size:24px;color:#0B0B0B;">${escapeHtml(p.title)}</h1>
              <p style="margin:0 0 12px;font-size:13px;color:#79746E;">Van ${escapeHtml(p.ownerName)} (@${escapeHtml(p.ownerUsername)})</p>
              ${meta ? `<p style="margin:0 0 12px;font-size:14px;color:#1a1a1a;">${meta}</p>` : ''}
              ${p.description ? `<p style="margin:0 0 8px;font-size:14px;color:#1a1a1a;line-height:1.6;">${escapeHtml(p.description)}</p>` : ''}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              ${ingredientsHtml}
              ${stepsHtml}
              ${youtubeHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:0 32px 24px;">
              <a href="${p.recipeLink}" style="background:#FF5B14;color:#0B0B0B;padding:12px 24px;text-decoration:none;border-radius:4px;display:inline-block;font-weight:bold;font-size:14px;">Bekijk op BBQHeros</a>
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

function recipeCardText(p: RecipeCardParams): string {
  const meta = metaLine(p)
  const parts: string[] = [p.title, `Van ${p.ownerName} (@${p.ownerUsername})`]
  if (meta) parts.push(meta)
  parts.push('')
  if (p.description) {
    parts.push(p.description, '')
  }
  if (p.ingredients.length) {
    parts.push('INGREDIENTEN', ...p.ingredients.map((i) => `- ${i}`), '')
  }
  if (p.steps.length) {
    parts.push('STAPPEN', ...p.steps.map((s, idx) => `${idx + 1}. ${s}`), '')
  }
  if (p.youtubeUrl) {
    parts.push(`Video: ${p.youtubeUrl}`, '')
  }
  parts.push('Bekijk op BBQHeros:', p.recipeLink, '', '--', `(c) ${new Date().getFullYear()} BBQHeros | bbqheros.nl`)
  return parts.join('\n')
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
      data: { user },
    } = await userClient.auth.getUser()
    if (!user) return json({ success: false, error: 'Unauthorized' }, 401)

    const { recipeId, customEmail } = await req.json()
    if (!recipeId) return json({ success: false, error: 'recipeId is verplicht.' }, 400)

    let toEmail = user.email ?? null
    if (customEmail) {
      const trimmed = String(customEmail).trim()
      if (!EMAIL_PATTERN.test(trimmed)) {
        return json({ success: false, error: 'Ongeldig e-mailadres.' }, 400)
      }
      toEmail = trimmed
    }
    if (!toEmail) return json({ success: false, error: 'Geen e-mailadres bekend.' }, 400)

    // Query with the requester's own JWT so RLS decides whether they may see
    // this recipe (own, public, or shared) — no separate access check needed.
    const [{ data: recipe }, { data: ingredientRows }, { data: stepRows }] = await Promise.all([
      userClient
        .from('recipes')
        .select('*, profiles!recipes_owner_id_fkey(username, display_name)')
        .eq('id', recipeId)
        .single(),
      userClient.from('recipe_ingredients').select('text').eq('recipe_id', recipeId).order('position'),
      userClient.from('recipe_steps').select('text').eq('recipe_id', recipeId).order('position'),
    ])

    if (!recipe) return json({ success: false, error: 'Recept niet gevonden of geen toegang.' }, 404)

    const params: RecipeCardParams = {
      title: recipe.title,
      description: recipe.description,
      coverPhotoUrl: recipe.cover_photo_url,
      cookTimeMinutes: recipe.cook_time_minutes,
      servings: recipe.servings,
      rating: recipe.rating,
      ingredients: (ingredientRows ?? []).map((i: { text: string }) => i.text),
      steps: (stepRows ?? []).map((s: { text: string }) => s.text),
      youtubeUrl: recipe.youtube_url,
      ownerName: recipe.profiles?.display_name || recipe.profiles?.username || 'Onbekend',
      ownerUsername: recipe.profiles?.username || '',
      recipeLink: `${SITE_URL}/app/recept/${recipeId}`,
    }

    await sendEmail({
      to: toEmail,
      subject: `Recept: ${recipe.title}`,
      html: recipeCardHtml(params),
      text: recipeCardText(params),
    })

    return json({ success: true })
  } catch (err) {
    return json({ success: false, error: (err as Error).message }, 500)
  }
})
