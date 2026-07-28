import { Link } from 'react-router-dom'
import { relativeTime } from '../lib/relativeTime'
import type { ActivityNotification } from '../lib/notifications/NotificationContext'
import {
  notificationIcon,
  notificationMessage,
  notificationPath,
} from '../lib/notifications/notificationPresentation'

export function NotificationItem({
  notification,
  onOpen,
  compact = false,
}: {
  notification: ActivityNotification
  onOpen: (id: string) => void
  compact?: boolean
}) {
  const actor = notification.actor

  return (
    <Link
      to={notificationPath(notification)}
      onClick={() => onOpen(notification.id)}
      className={`flex items-start gap-3 transition-colors ${
        compact ? 'px-4 py-3' : 'p-4 sm:p-5 rounded-md border border-line'
      } ${notification.read_at ? 'bg-surface text-cream/65' : 'bg-flame/5 hover:bg-flame/10'}`}
    >
      <div className="relative shrink-0">
        <div className="w-10 h-10 rounded-full bg-surface-2 overflow-hidden flex items-center justify-center text-xs text-cream/40">
          {actor?.avatar_url ? (
            <img src={actor.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            actor?.username.slice(0, 2).toUpperCase() ?? '??'
          )}
        </div>
        <span
          className="absolute -right-1 -bottom-1 w-5 h-5 rounded-full bg-ink border border-line flex items-center justify-center text-[10px]"
          aria-hidden="true"
        >
          {notificationIcon(notification)}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <p className="text-sm leading-snug flex-1">{notificationMessage(notification)}</p>
          {!notification.read_at && (
            <span className="w-2 h-2 rounded-full bg-flame mt-1.5 shrink-0" aria-label="Ongelezen" />
          )}
        </div>
        {notification.subject && (
          <p className="text-xs text-cream/45 truncate mt-1">{notification.subject}</p>
        )}
        <p className="text-[11px] text-cream/35 mt-1">{relativeTime(notification.created_at)}</p>
      </div>
    </Link>
  )
}
