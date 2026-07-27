import { getNextRank, getRank } from '../lib/ranks'

export function RankBadge({
  points,
  showProgress = false,
}: {
  points: number
  showProgress?: boolean
}) {
  const rank = getRank(points)
  const next = getNextRank(points)
  const progress = next ? ((points - rank.min) / (next.min - rank.min)) * 100 : 100

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-xl leading-none" aria-hidden="true">
          {rank.icon}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-cream truncate">{rank.name}</p>
          <p className="text-xs text-cream/50">
            {points} {points === 1 ? 'punt' : 'punten'} · {rank.vibe}
          </p>
        </div>
      </div>
      {showProgress && next && (
        <div className="mt-2">
          <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div
              className="h-full bg-flame rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="text-[11px] text-cream/40 mt-1">
            Nog {next.min - points} {next.min - points === 1 ? 'punt' : 'punten'} tot {next.icon}{' '}
            {next.name}
          </p>
        </div>
      )}
    </div>
  )
}
