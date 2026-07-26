export function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return 'zojuist'
  if (minutes < 60) return `${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} uur`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} ${days === 1 ? 'dag' : 'dagen'}`
  const weeks = Math.floor(days / 7)
  return `${weeks} ${weeks === 1 ? 'week' : 'weken'}`
}

export function startOfThisWeek(): Date {
  const now = new Date()
  const day = now.getDay()
  const diffToMonday = (day + 6) % 7
  const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday)
  monday.setHours(0, 0, 0, 0)
  return monday
}
