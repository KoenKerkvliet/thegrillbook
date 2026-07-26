import { Link } from 'react-router-dom'
import { StarRating } from './StarRating'

export type RecipeCardData = {
  id: string
  title: string
  cover_photo_url: string | null
  cook_time_minutes: number | null
  servings: number | null
  rating: number | null
  is_public: boolean
  ownerUsername?: string
  original_owner_username?: string | null
}

export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  return (
    <Link
      to={`/app/recept/${recipe.id}`}
      className="block rounded-lg overflow-hidden border border-line bg-surface hover:border-cream/30 transition-colors"
    >
      <div className="aspect-[4/3] bg-surface-2 flex items-center justify-center text-cream/25 text-xs overflow-hidden">
        {recipe.cover_photo_url ? (
          <img
            src={recipe.cover_photo_url}
            alt={recipe.title}
            className="w-full h-full object-cover"
          />
        ) : (
          'Geen foto'
        )}
      </div>
      <div className="p-3">
        {recipe.ownerUsername && (
          <p className="text-xs text-cream/50 mb-1">@{recipe.ownerUsername}</p>
        )}
        <p className="font-display text-base leading-tight mb-1">{recipe.title}</p>
        <div className="flex items-center gap-2 text-xs text-cream/60">
          {recipe.rating != null && <StarRating value={recipe.rating} size="sm" />}
          {recipe.cook_time_minutes != null && <span>{recipe.cook_time_minutes}min</span>}
          {recipe.servings != null && <span>{recipe.servings} pers.</span>}
        </div>
        {recipe.original_owner_username && (
          <p className="text-[11px] text-cream/40 mt-2">
            Origineel van @{recipe.original_owner_username}
          </p>
        )}
        {!recipe.is_public && (
          <span className="inline-block mt-2 text-[10px] tracking-wide text-cream/40 border border-line rounded px-1.5 py-0.5">
            PRIVÉ
          </span>
        )}
      </div>
    </Link>
  )
}
