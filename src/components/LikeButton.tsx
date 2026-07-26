import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth/useAuth'

type Props = {
  recipeId: string
  initiallyLiked: boolean
  initialCount: number
}

export function LikeButton({ recipeId, initiallyLiked, initialCount }: Props) {
  const { user } = useAuth()
  const [liked, setLiked] = useState(initiallyLiked)
  const [count, setCount] = useState(initialCount)
  const [busy, setBusy] = useState(false)

  async function toggle() {
    if (!user || busy) return
    setBusy(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((c) => (wasLiked ? c - 1 : c + 1))

    const { error } = wasLiked
      ? await supabase.from('recipe_likes').delete().eq('recipe_id', recipeId).eq('user_id', user.id)
      : await supabase.from('recipe_likes').insert({ recipe_id: recipeId, user_id: user.id })

    if (error) {
      setLiked(wasLiked)
      setCount((c) => (wasLiked ? c + 1 : c - 1))
    }
    setBusy(false)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      className={`flex items-center gap-1.5 text-sm rounded-md px-3 py-1.5 border transition-colors ${
        liked
          ? 'bg-flame border-flame text-ink'
          : 'border-line text-cream/70 hover:border-cream/40'
      }`}
    >
      <span>{liked ? '♥' : '♡'}</span>
      <span>{count}</span>
    </button>
  )
}
