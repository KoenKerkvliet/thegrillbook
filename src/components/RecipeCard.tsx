import { Link } from 'react-router-dom'
import { StarRating } from './StarRating'
import { MailRecipeButton } from './MailRecipeButton'
import { DIFFICULTIES, RECIPE_TECHNIQUES } from '../lib/discoveryOptions'

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
  main_ingredient?: string
  technique?: string
  bbq_type?: string
  difficulty?: string
}

export function RecipeCard({ recipe }: { recipe: RecipeCardData }) {
  return (
    <div className="relative rounded-lg border border-line bg-surface hover:border-cream/30 transition-colors">
      <Link to={`/app/recept/${recipe.id}`} className="block">
        <div className="aspect-[4/3] rounded-t-lg bg-surface-2 flex items-center justify-center text-cream/25 text-xs overflow-hidden">
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
          {(recipe.technique || recipe.difficulty) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {recipe.technique && (
                <span className="text-[10px] rounded-full bg-flame/10 text-orange px-2 py-0.5">
                  {RECIPE_TECHNIQUES[recipe.technique as keyof typeof RECIPE_TECHNIQUES] ??
                    recipe.technique}
                </span>
              )}
              {recipe.difficulty && (
                <span className="text-[10px] rounded-full border border-line text-cream/50 px-2 py-0.5">
                  {DIFFICULTIES[recipe.difficulty as keyof typeof DIFFICULTIES] ?? recipe.difficulty}
                </span>
              )}
            </div>
          )}
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
      <div className="absolute top-2 right-2">
        <MailRecipeButton recipeId={recipe.id} overlay />
      </div>
    </div>
  )
}
