export type Rank = {
  min: number
  name: string
  icon: string
  vibe: string
}

// A recipe takes real effort (ingredients, steps, photo) — worth more than
// a quick BBQ moment log. Likes are given by someone else, not earned by
// your own effort, so they don't count toward points.
export const RECIPE_POINTS = 2
export const MOMENT_POINTS = 1
export const LIKE_POINTS = 0

export const RANKS: Rank[] = [
  { min: 0, name: 'Recruit', icon: '🔥', vibe: 'Net aangemeld, moet het vak nog leren' },
  { min: 4, name: 'Grill Private', icon: '🌭', vibe: 'Kan de basis, staat nog onder toezicht' },
  { min: 10, name: 'Corporal of the Coals', icon: '🍖', vibe: 'Neemt kleine beslissingen zelfstandig' },
  { min: 20, name: 'Sergeant Smokehouse', icon: '🌶️', vibe: 'Commandeert het vuur met overtuiging' },
  { min: 35, name: 'Lieutenant Lowandslow', icon: '🎖️', vibe: 'Herkend gezag binnen de troep' },
  { min: 55, name: 'Captain Charcoal', icon: '💀', vibe: 'Stuurt anderen aan, kent alle technieken' },
  { min: 80, name: 'Colonel Kettle', icon: '👑', vibe: 'Legendarische staat van dienst' },
  { min: 120, name: 'BBQ General', icon: '🏆', vibe: 'Hoogste rang, de veteraan der veteranen' },
]

export function getRank(points: number): Rank {
  let current = RANKS[0]
  for (const rank of RANKS) {
    if (points >= rank.min) current = rank
    else break
  }
  return current
}

export function getNextRank(points: number): Rank | null {
  return RANKS.find((rank) => rank.min > points) ?? null
}
