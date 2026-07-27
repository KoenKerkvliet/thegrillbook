import { Link } from 'react-router-dom'
import { StarRating } from './StarRating'
import { LikeButton } from './LikeButton'
import { ShareButton } from './ShareButton'
import { SaveButton } from './SaveButton'
import { RankIcon } from './RankIcon'
import { relativeTime } from '../lib/relativeTime'

export type FeedRecipeData = {
  id: string
  title: string
  description: string | null
  cover_photo_url: string | null
  cook_time_minutes: number | null
  servings: number | null
  rating: number | null
  created_at: string
  ownerUsername: string
  ownerDisplayName: string | null
  ownerAvatarUrl: string | null
  ownerPoints: number
  likeCount: number
  likedByMe: boolean
  savedAsId: string | null
}

export function FeedRecipeCard({ recipe }: { recipe: FeedRecipeData }) {
  return (
    <article className="bg-surface border border-line">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-10 h-10 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40">
          {recipe.ownerAvatarUrl ? (
            <img src={recipe.ownerAvatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            recipe.ownerUsername.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate flex items-center gap-1.5">
            {recipe.ownerDisplayName || recipe.ownerUsername}
            <RankIcon points={recipe.ownerPoints} />
          </p>
          <p className="text-xs text-cream/50">
            @{recipe.ownerUsername} · {relativeTime(recipe.created_at)}
          </p>
        </div>
      </div>

      <Link to={`/app/recept/${recipe.id}`} className="block">
        <div className="aspect-video bg-surface-2 flex items-center justify-center text-cream/25 text-sm overflow-hidden">
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
      </Link>

      <div className="p-5">
        <Link to={`/app/recept/${recipe.id}`}>
          <h3 className="font-display text-2xl leading-tight mb-2">{recipe.title}</h3>
        </Link>
        <div className="flex flex-wrap items-center gap-3 text-sm text-cream/60 mb-3">
          {recipe.rating != null && <StarRating value={recipe.rating} size="sm" />}
          {recipe.cook_time_minutes != null && <span>{recipe.cook_time_minutes} min</span>}
          {recipe.servings != null && <span>{recipe.servings} personen</span>}
        </div>
        {recipe.description && (
          <p className="text-cream/70 text-sm leading-relaxed mb-4">{recipe.description}</p>
        )}
        <div className="flex flex-wrap items-center gap-2 pt-4 border-t border-line">
          <LikeButton
            kind="recipe"
            targetId={recipe.id}
            initiallyLiked={recipe.likedByMe}
            initialCount={recipe.likeCount}
          />
          <ShareButton kind="recipe" targetId={recipe.id} />
          <SaveButton recipeId={recipe.id} initiallySavedAsId={recipe.savedAsId} />
        </div>
      </div>
    </article>
  )
}
