import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from './_shared/cors.ts'

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && email.toLowerCase().endsWith('@designpixels.nl'))
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
      data: { user: caller },
    } = await userClient.auth.getUser()
    if (!caller || !isAdminEmail(caller.email)) {
      return json({ success: false, error: 'Forbidden' }, 403)
    }

    const { userId } = await req.json()
    if (!userId) return json({ success: false, error: 'userId is verplicht.' }, 400)

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const [{ error: profileError }, { error: banError }] = await Promise.all([
      admin.from('profiles').update({ archived_at: null }).eq('id', userId),
      admin.auth.admin.updateUserById(userId, { ban_duration: 'none' }),
    ])
    if (profileError) throw profileError
    if (banError) throw banError

    return json({ success: true })
  } catch (err) {
    return json({ success: false, error: (err as Error).message }, 500)
  }
})
