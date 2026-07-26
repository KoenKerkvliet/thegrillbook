import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth/useAuth'

type Props = {
  targetUserId: string
  initiallyFollowing: boolean
  onToggled?: (following: boolean) => void
}

export function FollowButton({ targetUserId, initiallyFollowing, onToggled }: Props) {
  const { user } = useAuth()
  const [following, setFollowing] = useState(initiallyFollowing)
  const [busy, setBusy] = useState(false)

  if (!user || user.id === targetUserId) return null

  async function toggle() {
    if (busy) return
    setBusy(true)
    const wasFollowing = following
    setFollowing(!wasFollowing)

    const { error } = wasFollowing
      ? await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user!.id)
          .eq('following_id', targetUserId)
      : await supabase.from('follows').insert({ follower_id: user!.id, following_id: targetUserId })

    if (error) {
      setFollowing(wasFollowing)
    } else {
      onToggled?.(!wasFollowing)
    }
    setBusy(false)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`text-sm font-semibold rounded-md px-4 py-1.5 transition-colors ${
        following
          ? 'border border-line text-cream/70 hover:border-cream/40'
          : 'bg-flame hover:bg-flame-dark text-ink'
      }`}
    >
      {following ? 'Volgend' : 'Volgen'}
    </button>
  )
}
