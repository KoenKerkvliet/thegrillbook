import { createContext } from 'react'

export type NotificationKind =
  | 'follow'
  | 'recipe_like'
  | 'moment_like'
  | 'video_like'
  | 'recipe_shared'
  | 'moment_shared'
  | 'video_shared'

export type ActivityNotification = {
  id: string
  recipient_id: string
  actor_id: string
  kind: NotificationKind
  entity_id: string | null
  subject: string | null
  created_at: string
  read_at: string | null
  actor: {
    username: string
    display_name: string | null
    avatar_url: string | null
  } | null
}

export type NotificationContextValue = {
  notifications: ActivityNotification[] | null
  unreadCount: number
  refresh: () => Promise<void>
  markRead: (id: string) => Promise<void>
  markAllRead: () => Promise<void>
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)
