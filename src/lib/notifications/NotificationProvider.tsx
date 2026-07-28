import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { supabase } from '../supabaseClient'
import { useAuth } from '../auth/useAuth'
import { isAdminEmail } from '../admin'
import {
  NotificationContext,
  type ActivityNotification,
} from './NotificationContext'

const NOTIFICATION_SELECT =
  'id, recipient_id, actor_id, kind, entity_id, subject, created_at, read_at, actor:profiles!notifications_actor_id_fkey(username, display_name, avatar_url)'

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<ActivityNotification[] | null>(null)
  const enabled = Boolean(user && !isAdminEmail(user.email))

  const refresh = useCallback(async () => {
    if (!user || !enabled) {
      setNotifications([])
      return
    }
    const { data, error } = await supabase
      .from('notifications')
      .select(NOTIFICATION_SELECT)
      .eq('recipient_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Activiteit laden mislukt:', error.message)
      setNotifications([])
      return
    }
    setNotifications((data ?? []) as unknown as ActivityNotification[])
  }, [enabled, user])

  useEffect(() => {
    void refresh()
    if (!user || !enabled) return

    const channel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `recipient_id=eq.${user.id}`,
        },
        () => void refresh(),
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [enabled, refresh, user])

  async function markRead(id: string) {
    const readAt = new Date().toISOString()
    setNotifications((current) =>
      current?.map((notification) =>
        notification.id === id && !notification.read_at
          ? { ...notification, read_at: readAt }
          : notification,
      ) ?? [],
    )
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: readAt })
      .eq('id', id)
      .is('read_at', null)
    if (error) void refresh()
  }

  async function markAllRead() {
    if (!user) return
    const readAt = new Date().toISOString()
    setNotifications((current) =>
      current?.map((notification) => ({ ...notification, read_at: notification.read_at ?? readAt })) ?? [],
    )
    const { error } = await supabase
      .from('notifications')
      .update({ read_at: readAt })
      .eq('recipient_id', user.id)
      .is('read_at', null)
    if (error) void refresh()
  }

  const value = {
    notifications,
    unreadCount: notifications?.filter((notification) => !notification.read_at).length ?? 0,
    refresh,
    markRead,
    markAllRead,
  }

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}
