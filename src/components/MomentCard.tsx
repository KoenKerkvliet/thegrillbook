import { relativeTime } from '../lib/relativeTime'

export type MomentCardData = {
  id: string
  photo_url: string
  caption: string | null
  created_at: string
  ownerUsername: string
  ownerDisplayName: string | null
  ownerAvatarUrl: string | null
}

export function MomentCard({ moment }: { moment: MomentCardData }) {
  return (
    <article className="bg-surface border border-line">
      <div className="flex items-center gap-3 px-5 py-4">
        <div className="w-10 h-10 rounded-full bg-surface-2 shrink-0 overflow-hidden flex items-center justify-center text-xs text-cream/40">
          {moment.ownerAvatarUrl ? (
            <img src={moment.ownerAvatarUrl} alt="" className="w-full h-full object-cover" />
          ) : (
            moment.ownerUsername.slice(0, 2).toUpperCase()
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate">
            {moment.ownerDisplayName || moment.ownerUsername}
            <span className="ml-2 align-middle text-[10px] font-bold tracking-wide text-flame border border-flame/40 rounded px-1.5 py-0.5">
              🔥 VUUR AAN
            </span>
          </p>
          <p className="text-xs text-cream/50">
            @{moment.ownerUsername} · {relativeTime(moment.created_at)}
          </p>
        </div>
      </div>

      <div className="aspect-square bg-surface-2 overflow-hidden">
        <img src={moment.photo_url} alt="" className="w-full h-full object-cover" />
      </div>

      {moment.caption && (
        <div className="p-5">
          <p className="text-cream/80 text-sm leading-relaxed">{moment.caption}</p>
        </div>
      )}
    </article>
  )
}
