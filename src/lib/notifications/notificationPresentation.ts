import type { ActivityNotification } from './NotificationContext'

export function actorName(notification: ActivityNotification): string {
  return notification.actor?.display_name || notification.actor?.username || 'Een chef'
}

export function notificationMessage(notification: ActivityNotification): string {
  const name = actorName(notification)
  switch (notification.kind) {
    case 'follow':
      return `${name} volgt je nu`
    case 'recipe_like':
      return `${name} vindt je recept lekker`
    case 'moment_like':
      return `${name} vindt je BBQ-moment leuk`
    case 'video_like':
      return `${name} vindt je video leuk`
    case 'recipe_shared':
      return `${name} heeft een recept met je gedeeld`
    case 'moment_shared':
      return `${name} heeft een BBQ-moment met je gedeeld`
    case 'video_shared':
      return `${name} heeft een video met je gedeeld`
  }
}

export function notificationIcon(notification: ActivityNotification): string {
  if (notification.kind === 'follow') return '👤'
  if (notification.kind.endsWith('_like')) return '🔥'
  return '✈️'
}

export function notificationPath(notification: ActivityNotification): string {
  if (notification.kind === 'follow' && notification.actor?.username) {
    return `/app/chefs/${notification.actor.username}`
  }
  if (
    (notification.kind === 'recipe_like' || notification.kind === 'recipe_shared') &&
    notification.entity_id
  ) {
    return `/app/recept/${notification.entity_id}`
  }
  return '/app'
}
