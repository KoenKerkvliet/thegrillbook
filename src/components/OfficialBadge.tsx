export function OfficialBadge({ compact = false }: { compact?: boolean }) {
  return (
    <span
      title="Officieel BBQHeros-account"
      aria-label="Officieel BBQHeros-account"
      className={`inline-flex shrink-0 items-center justify-center rounded-full bg-flame text-ink font-bold ${
        compact ? 'h-4 w-4 text-[10px]' : 'h-5 w-5 text-xs'
      }`}
    >
      ✓
    </span>
  )
}
