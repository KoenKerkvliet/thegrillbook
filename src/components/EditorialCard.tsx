import { Link } from 'react-router-dom'
import { OfficialBadge } from './OfficialBadge'
import type { Tables } from '../types/database'

type EditorialPost = Tables<'editorial_posts'>

export function EditorialCard({
  post,
  onDismiss,
}: {
  post: EditorialPost
  onDismiss: (postId: string) => void
}) {
  return (
    <article className="relative overflow-hidden rounded-md border border-flame/35 bg-[linear-gradient(135deg,rgba(255,92,20,0.11),rgba(23,23,23,0.96)_52%)]">
      {post.image_url && (
        <img
          src={post.image_url}
          alt=""
          className="h-40 w-full object-cover sm:h-48"
        />
      )}
      <div className="p-5 sm:p-6">
        <div className="mb-3 flex items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-flame">
            Van BBQHeros <OfficialBadge compact />
          </p>
          <button
            type="button"
            onClick={() => onDismiss(post.id)}
            aria-label={`"${post.title}" sluiten`}
            className="text-cream/35 hover:text-cream"
          >
            ×
          </button>
        </div>
        <h2 className="font-display text-2xl sm:text-3xl">{post.title}</h2>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-cream/70">{post.body}</p>
        {post.cta_label && post.cta_path && (
          <Link
            to={post.cta_path}
            className="mt-5 inline-flex rounded-md bg-flame px-4 py-2 text-sm font-semibold text-ink transition-colors hover:bg-flame-dark"
          >
            {post.cta_label}
          </Link>
        )}
      </div>
    </article>
  )
}
