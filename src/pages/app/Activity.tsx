import { NotificationItem } from '../../components/NotificationItem'
import { useNotifications } from '../../lib/notifications/useNotifications'

export default function Activity() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications()
  const today = new Date().toDateString()
  const todayNotifications =
    notifications?.filter((notification) => new Date(notification.created_at).toDateString() === today) ?? []
  const earlierNotifications =
    notifications?.filter((notification) => new Date(notification.created_at).toDateString() !== today) ?? []

  return (
    <div className="max-w-2xl">
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl mb-1">Activiteit</h1>
          <p className="text-sm text-cream/50">Likes, volgers en gedeelde inspiratie op één plek.</p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={() => void markAllRead()}
            className="text-sm font-semibold text-flame hover:underline shrink-0"
          >
            Alles gelezen
          </button>
        )}
      </div>

      {notifications === null ? (
        <p className="text-cream/50">Activiteit laden...</p>
      ) : notifications.length === 0 ? (
        <div className="border border-line bg-surface rounded-md p-8 text-center">
          <p className="font-display text-2xl mb-2">Nog rustig rond het vuur</p>
          <p className="text-sm text-cream/55">
            Nieuwe likes, volgers en gedeelde content verschijnen hier vanzelf.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {todayNotifications.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-widest text-cream/45 uppercase mb-3">
                Vandaag
              </h2>
              <div className="flex flex-col gap-2">
                {todayNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onOpen={(id) => void markRead(id)}
                  />
                ))}
              </div>
            </section>
          )}
          {earlierNotifications.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold tracking-widest text-cream/45 uppercase mb-3">
                Eerder
              </h2>
              <div className="flex flex-col gap-2">
                {earlierNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onOpen={(id) => void markRead(id)}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
