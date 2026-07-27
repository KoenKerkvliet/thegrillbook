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

    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)

    const [{ data: authUsersData, error: listError }, { data: profiles }, { data: recipeRows }, { data: momentRows }] =
      await Promise.all([
        admin.auth.admin.listUsers({ perPage: 1000 }),
        admin.from('profiles').select('*'),
        admin.from('recipes').select('owner_id, forked_from_recipe_id'),
        admin.from('moments').select('owner_id'),
      ])
    if (listError) throw listError

    const totalRecipeCounts = new Map<string, number>()
    const originalRecipeCounts = new Map<string, number>()
    for (const r of recipeRows ?? []) {
      totalRecipeCounts.set(r.owner_id, (totalRecipeCounts.get(r.owner_id) ?? 0) + 1)
      if (!r.forked_from_recipe_id) {
        originalRecipeCounts.set(r.owner_id, (originalRecipeCounts.get(r.owner_id) ?? 0) + 1)
      }
    }
    const momentCounts = new Map<string, number>()
    for (const m of momentRows ?? []) {
      momentCounts.set(m.owner_id, (momentCounts.get(m.owner_id) ?? 0) + 1)
    }

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

    const users = (authUsersData?.users ?? []).map((u) => {
      const profile = profileMap.get(u.id)
      const recipeCount = totalRecipeCounts.get(u.id) ?? 0
      const momentCount = momentCounts.get(u.id) ?? 0
      const pointEligibleRecipes = originalRecipeCounts.get(u.id) ?? 0
      return {
        id: u.id,
        email: u.email ?? null,
        createdAt: u.created_at,
        lastSignInAt: u.last_sign_in_at ?? null,
        username: profile?.username ?? null,
        displayName: profile?.display_name ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        recipeCount,
        momentCount,
        points: pointEligibleRecipes * 2 + momentCount * 1,
      }
    })

    users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return json({ success: true, users })
  } catch (err) {
    return json({ success: false, error: (err as Error).message }, 500)
  }
})
