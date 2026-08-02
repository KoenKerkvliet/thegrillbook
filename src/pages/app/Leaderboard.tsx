import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { RankIcon } from '../../components/RankIcon'
import { useAuth } from '../../lib/auth/useAuth'
import { supabase } from '../../lib/supabaseClient'
import { useFeatureFlag } from '../../lib/featureFlags'

type LeaderboardRow = {
  user_id: string
  username: string
  display_name: string | null
  avatar_url: string | null
  monthly_points: number
  total_points: number
  recipes_logged: number
  moments_logged: number
}

const POSITION_LABELS = ['1', '2', '3']

export default function Leaderboard() {
  const { user } = useAuth()
  const { enabled, loaded } = useFeatureFlag('leaderboard')
  const [rows, setRows] = useState<LeaderboardRow[] | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.rpc('get_monthly_following_leaderboard').then(({ data }) => {
      if (!cancelled) setRows(data ?? [])
    })
    return () => {
      cancelled = true
    }
  }, [])

  if (loaded && !enabled) return <Navigate to="/app" replace />

  const monthName = new Intl.DateTimeFormat('nl-NL', {
    month: 'long',
    year: 'numeric',
  }).format(new Date())

  return (
    <div className="max-w-3xl">
      <div className="mb-7">
        <p className="text-xs font-semibold tracking-widest text-flame uppercase mb-2">
          Jij en je collega chefs
        </p>
        <h1 className="font-display text-3xl">Leaderboard</h1>
        <p className="text-sm text-cream/50 mt-2 capitalize">
          {monthName} · 2 punten per recept, 1 punt per BBQ-moment
        </p>
      </div>

      {rows === null && <p className="text-cream/50">Ranglijst laden...</p>}

      {rows?.length === 0 && (
        <div className="bg-surface border border-line rounded-md p-6">
          <p className="font-semibold">Nog niemand op het bord</p>
          <p className="text-sm text-cream/50 mt-1">
            Log een recept of BBQ-moment om de maandstrijd te openen.
          </p>
        </div>
      )}

      {rows && rows.length > 0 && (
        <div className="flex flex-col gap-2">
          {rows.map((row, index) => {
            const isMe = row.user_id === user?.id
            return (
              <div
                key={row.user_id}
                className={`grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 rounded-md border px-4 py-3 ${
                  isMe ? 'border-flame/50 bg-flame/5' : 'border-line bg-surface'
                }`}
              >
                <div
                  className={`font-display text-2xl text-center ${
                    index < 3 ? 'text-flame' : 'text-cream/35'
                  }`}
                >
                  {POSITION_LABELS[index] ?? index + 1}
                </div>

                <Link
                  to={isMe ? '/app/profiel' : `/app/chefs/${row.username}`}
                  className="flex items-center gap-3 min-w-0 group"
                >
                  <div className="w-11 h-11 rounded-full bg-surface-2 overflow-hidden shrink-0 flex items-center justify-center text-xs text-cream/40">
                    {row.avatar_url ? (
                      <img src={row.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      row.username.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold truncate flex items-center gap-1.5 group-hover:text-flame transition-colors">
                      {row.display_name || row.username}
                      {isMe && <span className="text-[10px] text-flame">(jij)</span>}
                      <RankIcon points={row.total_points} />
                    </p>
                    <p className="text-xs text-cream/45">
                      {row.recipes_logged} {row.recipes_logged === 1 ? 'recept' : 'recepten'} ·{' '}
                      {row.moments_logged} {row.moments_logged === 1 ? 'moment' : 'momenten'}
                    </p>
                  </div>
                </Link>

                <div className="text-right">
                  <p className="font-display text-2xl text-cream">{row.monthly_points}</p>
                  <p className="text-[10px] uppercase tracking-wider text-cream/40">punten</p>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <p className="text-xs text-cream/35 mt-5">
        Alleen jij en chefs die je volgt doen mee. Op de eerste dag van elke maand begint iedereen
        weer op nul.
      </p>
    </div>
  )
}
