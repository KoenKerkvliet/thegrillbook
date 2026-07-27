import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../lib/auth/useAuth'

type Kind = 'recipe' | 'video'

type Props = {
  kind: Kind
  targetId: string
  initiallyLiked: boolean
  initialCount: number
}

async function insertLike(kind: Kind, targetId: string, userId: string) {
  return kind === 'recipe'
    ? supabase.from('recipe_likes').insert({ recipe_id: targetId, user_id: userId })
    : supabase.from('video_likes').insert({ video_id: targetId, user_id: userId })
}

async function deleteLike(kind: Kind, targetId: string, userId: string) {
  return kind === 'recipe'
    ? supabase.from('recipe_likes').delete().eq('recipe_id', targetId).eq('user_id', userId)
    : supabase.from('video_likes').delete().eq('video_id', targetId).eq('user_id', userId)
}

export function LikeButton({ kind, targetId, initiallyLiked, initialCount }: Props) {
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
      ? await deleteLike(kind, targetId, user.id)
      : await insertLike(kind, targetId, user.id)

    if (error) {
      setLiked(wasLiked)
      setCount((c) => (wasLiked ? c + 1 : c - 1))
    } else if (!wasLiked) {
      const emailFn = kind === 'recipe' ? 'send-like-email' : 'send-video-like-email'
      const body = kind === 'recipe' ? { recipeId: targetId } : { videoId: targetId }
      supabase.functions.invoke(emailFn, { body }).catch(() => {})
    }
    setBusy(false)
  }

  const onFire = count >= 10

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={busy}
      title={liked ? 'Staat in vuur en vlam' : 'Zet in vuur en vlam'}
      className={`flex items-center gap-1.5 text-sm rounded-md px-3 py-1.5 border transition-colors ${
        liked
          ? 'bg-flame/10 border-flame text-flame'
          : 'border-line text-cream/70 hover:border-cream/40'
      }`}
    >
      <span className={onFire ? 'animate-pulse' : ''}>🔥</span>
      <span>{count}</span>
    </button>
  )
}
