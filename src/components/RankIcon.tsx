import { getRank } from '../lib/ranks'

export function RankIcon({ points, className = '' }: { points: number; className?: string }) {
  const rank = getRank(points)
  return (
    <img
      src={`${import.meta.env.BASE_URL}${rank.icon}`}
      alt=""
      className={`inline-block w-5 h-5 object-contain shrink-0 ${className}`}
      title={`${rank.name} · ${points} punten`}
      aria-label={rank.name}
    />
  )
}
