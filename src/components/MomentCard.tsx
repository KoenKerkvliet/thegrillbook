import { relativeTime } from '../lib/relativeTime'
import { RankIcon } from './RankIcon'
import { LikeButton } from './LikeButton'
import { ShareButton } from './ShareButton'

export type MomentCardData = {
  id: string
  photo_url: string | null
  caption: string | null
  created_at: string
  ownerUsername: string
  ownerDisplayName: string | null
  ownerAvatarUrl: string | null
  ownerPoints: number
  likeCount: number
  likedByMe: boolean
  sourceRecipeTitle: string | null
}

type Props = {
  moment: MomentCardData
  isOwner?: boolean
  onDelete?: (id: string) => void
}

export function MomentCard({ moment, isOwner, onDelete }: Props) {
  return (
    <article className="bg-surface border border-line relative">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-10 h-10 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40">
          {moment.ownerAvatarUrl ? (
            <img src={moment.ownerAvatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            moment.ownerUsername.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate flex items-center gap-1.5">
            {moment.ownerDisplayName || moment.ownerUsername}
            <RankIcon points={moment.ownerPoints} />
            <span className="text-[10px] font-bold tracking-wide text-flame border border-flame/40 rounded px-1.5 py-0.5">
              🔥 VUUR AAN
            </span>
          </p>
          <p className="text-xs text-cream/50">
            @{moment.ownerUsername} · {relativeTime(moment.created_at)}
          </p>
        </div>
        {isOwner && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(moment.id)}
            aria-label="Moment verwijderen"
            className="text-cream/30 hover:text-flame shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      {moment.photo_url && (
        <div className="aspect-square bg-surface-2 overflow-hidden">
          <img src={moment.photo_url} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      {moment.sourceRecipeTitle && (
        <div className={moment.caption ? 'px-5 pt-5' : 'p-5'}>
          <p className="text-xs font-semibold tracking-wide text-flame">
            🔥 Gemaakt: {moment.sourceRecipeTitle}
          </p>
        </div>
      )}

      {moment.caption && (
        <div className={moment.sourceRecipeTitle ? 'px-5 pb-5 pt-2' : 'p-5'}>
          <p
            className={
              moment.photo_url
                ? 'text-cream/80 text-sm leading-relaxed'
                : 'font-display text-xl leading-snug'
            }
          >
            {moment.caption}
          </p>
        </div>
      )}

      <div className={`flex flex-wrap items-center gap-2 px-5 pb-5 ${moment.caption ? 'pt-0' : 'pt-5'}`}>
        <LikeButton
          kind="moment"
          targetId={moment.id}
          initiallyLiked={moment.likedByMe}
          initialCount={moment.likeCount}
        />
        <ShareButton kind="moment" targetId={moment.id} />
      </div>
    </article>
  )
}
