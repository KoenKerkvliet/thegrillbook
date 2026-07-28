export const CHEF_SPECIALTIES = [
  'Rundvlees',
  'Varkensvlees',
  'Kip',
  'Lamsvlees',
  'Vis & seafood',
  'Groenten',
  'Pizza',
  'Burgers',
  'Comfort food',
  'Klassieke Amerikaanse BBQ',
] as const

export const CHEF_TECHNIQUES = [
  'Direct grillen',
  'Indirect grillen',
  'Low & slow',
  'Roken',
  'Reverse sear',
  'Cederhout',
  'Spiesen',
] as const

export const MAIN_INGREDIENTS = {
  rund: 'Rund',
  varken: 'Varken',
  kip: 'Kip',
  lam: 'Lam',
  'vis-en-seafood': 'Vis & seafood',
  vegetarisch: 'Vegetarisch',
  overig: 'Overig',
} as const

export const RECIPE_TECHNIQUES = {
  grillen: 'Grillen',
  'low-and-slow': 'Low & slow',
  roken: 'Roken',
  'reverse-sear': 'Reverse sear',
  bakken: 'Bakken',
  overig: 'Overig',
} as const

export const BBQ_TYPES = {
  kogelbarbecue: 'Kogelbarbecue',
  kamado: 'Kamado',
  smoker: 'Smoker',
  gasbarbecue: 'Gasbarbecue',
  pizzaoven: 'Pizzaoven',
  plancha: 'Plancha',
  anders: 'Anders',
} as const

export const DIFFICULTIES = {
  makkelijk: 'Makkelijk',
  gemiddeld: 'Gemiddeld',
  uitdagend: 'Uitdagend',
} as const
