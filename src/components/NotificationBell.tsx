import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../lib/notifications/useNotifications'
import { NotificationItem } from './NotificationItem'

function BellIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
      <path d="M10 21h4" />
    </svg>
  )
}

function Badge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full bg-flame text-ink text-[10px] font-bold flex items-center justify-center">
      {count > 9 ? '9+' : count}
    </span>
  )
}

export function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function close(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', close)
    return () => document.removeEventListener('mousedown', close)
  }, [])

  const label =
    unreadCount === 0 ? 'Activiteit' : `Activiteit, ${unreadCount} ongelezen`

  return (
    <>
      <Link
        to="/app/activiteit"
        className="md:hidden relative w-9 h-9 rounded-full border border-line text-cream/65 hover:text-cream flex items-center justify-center"
        aria-label={label}
      >
        <BellIcon />
        <Badge count={unreadCount} />
      </Link>

      <div className="hidden md:block relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="relative w-9 h-9 rounded-full border border-line text-cream/65 hover:text-cream flex items-center justify-center"
          aria-label={label}
          aria-haspopup="dialog"
          aria-expanded={open}
        >
          <BellIcon />
          <Badge count={unreadCount} />
        </button>

        {open && (
          <section
            className="absolute right-0 top-full mt-2 w-96 max-h-[32rem] overflow-hidden bg-surface border border-line rounded-md shadow-xl z-50"
            aria-label="Recente activiteit"
          >
            <div className="px-4 py-3 border-b border-line flex items-center justify-between gap-3">
              <h2 className="font-display text-lg">Activiteit</h2>
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={() => void markAllRead()}
                  className="text-xs text-flame hover:underline"
                >
                  Alles gelezen
                </button>
              )}
            </div>
            <div className="max-h-96 overflow-y-auto divide-y divide-line">
              {notifications === null ? (
                <p className="text-sm text-cream/45 p-5">Activiteit laden...</p>
              ) : notifications.length === 0 ? (
                <p className="text-sm text-cream/45 p-5">Nog geen activiteit.</p>
              ) : (
                notifications.slice(0, 6).map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    compact
                    onOpen={(id) => {
                      setOpen(false)
                      void markRead(id)
                    }}
                  />
                ))
              )}
            </div>
            <Link
              to="/app/activiteit"
              onClick={() => setOpen(false)}
              className="block px-4 py-3 border-t border-line text-sm font-semibold text-flame hover:bg-surface-2"
            >
              Alle activiteit bekijken →
            </Link>
          </section>
        )}
      </div>
    </>
  )
}
