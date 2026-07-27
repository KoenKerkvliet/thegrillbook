export function StreakBadge({ weeks }: { weeks: number }) {
  if (weeks === 0) {
    return (
      <p className="text-xs text-cream/50">
        Nog geen streak — log deze week iets om te beginnen.
      </p>
    )
  }

  return (
    <p className="text-sm flex items-center gap-1.5">
      <span aria-hidden="true">🔥</span>
      <span className="font-semibold text-cream">
        {weeks} {weeks === 1 ? 'week' : 'weken'}
      </span>
      <span className="text-cream/50">op rij actief</span>
    </p>
  )
}
