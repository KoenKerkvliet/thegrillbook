import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../lib/auth/useAuth'
import { FollowButton } from '../../components/FollowButton'
import type { Tables } from '../../types/database'

type Profile = Tables<'profiles'>

function ProfileRow({
  profile,
  following,
  onToggled,
}: {
  profile: Profile
  following: boolean
  onToggled: (following: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3 bg-surface border border-line rounded-md px-4 py-3">
      <Link to="#" className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            profile.username.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold truncate">{profile.display_name || profile.username}</p>
          <p className="text-sm text-cream/50 truncate">@{profile.username}</p>
          {profile.bbq_brand && (
            <p className="text-xs text-flame truncate">🔥 {profile.bbq_brand}</p>
          )}
        </div>
      </Link>
      <FollowButton targetUserId={profile.id} initiallyFollowing={following} onToggled={onToggled} />
    </div>
  )
}

export default function Chefs() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const [query, setQuery] = useState(searchParams.get('q') ?? '')
  const [results, setResults] = useState<Profile[] | null>(null)
  const [following, setFollowing] = useState<Profile[]>([])
  const [followers, setFollowers] = useState<Profile[]>([])
  const [followingIds, setFollowingIds] = useState<Set<string>>(new Set())

  async function loadRelations() {
    if (!user) return
    const [{ data: followingRows }, { data: followerRows }] = await Promise.all([
      supabase
        .from('follows')
        .select('profiles!follows_following_id_fkey(*)')
        .eq('follower_id', user.id),
      supabase
        .from('follows')
        .select('profiles!follows_follower_id_fkey(*)')
        .eq('following_id', user.id),
    ])

    const followingProfiles = (followingRows ?? [])
      .map((r) => r.profiles as Profile | null)
      .filter((p): p is Profile => Boolean(p))
    setFollowing(followingProfiles)
    setFollowingIds(new Set(followingProfiles.map((p) => p.id)))

    setFollowers(
      (followerRows ?? [])
        .map((r) => r.profiles as Profile | null)
        .filter((p): p is Profile => Boolean(p)),
    )
  }

  useEffect(() => {
    loadRelations()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setQuery(q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  useEffect(() => {
    if (!user) return
    if (!query.trim()) {
      setResults(null)
      return
    }
    let cancelled = false
    const timeout = setTimeout(async () => {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .ilike('username', `%${query.trim()}%`)
        .neq('id', user.id)
        .limit(20)
      if (!cancelled) setResults(data ?? [])
    }, 250)
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [query, user])

  return (
    <div className="max-w-2xl flex flex-col gap-10">
      <div>
        <h1 className="font-display text-3xl mb-4">Collega chefs</h1>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Zoek op gebruikersnaam..."
          className="w-full rounded-md bg-surface border border-line px-3 py-2 outline-none focus:border-flame"
        />
      </div>

      {results !== null && (
        <div>
          <h2 className="font-display text-lg mb-3">Zoekresultaten</h2>
          {results.length === 0 ? (
            <p className="text-cream/50 text-sm">Niemand gevonden met die naam.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {results.map((p) => (
                <ProfileRow
                  key={p.id}
                  profile={p}
                  following={followingIds.has(p.id)}
                  onToggled={loadRelations}
                />
              ))}
            </div>
          )}
        </div>
      )}

      <div>
        <h2 className="font-display text-lg mb-3">Ik volg ({following.length})</h2>
        {following.length === 0 ? (
          <p className="text-cream/50 text-sm">Je volgt nog niemand.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {following.map((p) => (
              <ProfileRow key={p.id} profile={p} following={true} onToggled={loadRelations} />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="font-display text-lg mb-3">Volgers ({followers.length})</h2>
        {followers.length === 0 ? (
          <p className="text-cream/50 text-sm">Nog geen volgers.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {followers.map((p) => (
              <ProfileRow
                key={p.id}
                profile={p}
                following={followingIds.has(p.id)}
                onToggled={loadRelations}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
