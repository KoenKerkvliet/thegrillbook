import { getRank } from '../lib/ranks'

export function RankIcon({ points, className = '' }: { points: number; className?: string }) {
  const rank = getRank(points)
  return (
    <span
      className={`inline-block leading-none ${className}`}
      title={`${rank.name} · ${points} punten`}
      aria-label={rank.name}
    >
      {rank.icon}
    </span>
  )
}
