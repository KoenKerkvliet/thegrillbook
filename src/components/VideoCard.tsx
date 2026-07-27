import { relativeTime } from '../lib/relativeTime'
import { extractYoutubeId, getYoutubeThumbnail } from '../lib/youtube'
import { RankIcon } from './RankIcon'
import { LikeButton } from './LikeButton'
import { ShareButton } from './ShareButton'

export type VideoCardData = {
  id: string
  youtube_url: string
  caption: string | null
  is_recipe: boolean
  created_at: string
  ownerUsername: string
  ownerDisplayName: string | null
  ownerAvatarUrl: string | null
  ownerPoints: number
  likeCount: number
  likedByMe: boolean
}

type Props = {
  video: VideoCardData
  isOwner?: boolean
  onDelete?: (id: string) => void
}

export function VideoCard({ video, isOwner, onDelete }: Props) {
  const videoId = extractYoutubeId(video.youtube_url)

  return (
    <article className="bg-surface border border-line">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-10 h-10 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40">
          {video.ownerAvatarUrl ? (
            <img src={video.ownerAvatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            video.ownerUsername.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate flex items-center gap-1.5">
            {video.ownerDisplayName || video.ownerUsername}
            <RankIcon points={video.ownerPoints} />
            <span className="text-[10px] font-bold tracking-wide text-flame border border-flame/40 rounded px-1.5 py-0.5">
              📺 VIDEO
            </span>
            {video.is_recipe && (
              <span className="text-[10px] font-bold tracking-wide text-cream/70 border border-line rounded px-1.5 py-0.5">
                📖 RECEPT
              </span>
            )}
          </p>
          <p className="text-xs text-cream/50">
            @{video.ownerUsername} · {relativeTime(video.created_at)}
          </p>
        </div>
        {isOwner && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(video.id)}
            aria-label="Video verwijderen"
            className="text-cream/30 hover:text-flame shrink-0"
          >
            ✕
          </button>
        )}
      </div>

      <a
        href={video.youtube_url}
        target="_blank"
        rel="noreferrer"
        className="block aspect-video bg-surface-2 relative group"
      >
        {videoId ? (
          <img
            src={getYoutubeThumbnail(videoId)}
            alt=""
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-cream/25 text-sm">
            Video
          </div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/35 transition-colors">
          <div className="w-14 h-14 rounded-full bg-flame/90 flex items-center justify-center text-ink text-2xl">
            ▶
          </div>
        </div>
      </a>

      {video.caption && (
        <div className="p-5">
          <p className="text-cream/80 text-sm leading-relaxed">{video.caption}</p>
        </div>
      )}

      <div className={`flex flex-wrap items-center gap-2 px-5 pb-5 ${video.caption ? 'pt-0' : 'pt-5'}`}>
        <LikeButton
          kind="video"
          targetId={video.id}
          initiallyLiked={video.likedByMe}
          initialCount={video.likeCount}
        />
        <ShareButton kind="video" targetId={video.id} />
      </div>
    </article>
  )
}
