import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationsAPI } from '../services/apiClient'
import type { NotificationListResponse, UnreadCountResponse } from '../types/notifications'

/**
 * Fetches the unread notification count with 30-second polling.
 * Pauses polling when the browser tab is hidden and refetches immediately
 * when the tab becomes visible again.
 */
export function useUnreadCount() {
  return useQuery<UnreadCountResponse>({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => notificationsAPI.getUnreadCount(),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })
}

/**
 * Fetches the paginated notification list with 30-second polling.
 */
export function useNotificationList(page: number) {
  return useQuery<NotificationListResponse>({
    queryKey: ['notifications', 'list', page],
    queryFn: () => notificationsAPI.getNotifications(page),
    refetchInterval: 30000,
  })
}

/**
 * Mutation hook for marking a single notification as read.
 * Invalidates the notification list and unread count queries on success.
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => notificationsAPI.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] })
      queryClient.invalidateQueries({ queryKey: ['notifications', 'unread-count'] })
    },
  })
}

/**
 * Mutation hook for marking all notifications as read.
 * Optimistically sets the unread count to 0 and invalidates the notification list.
 */
export function useMarkAllAsRead() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', 'list'] })
      queryClient.setQueryData<UnreadCountResponse>(
        ['notifications', 'unread-count'],
        { unreadCount: 0 }
      )
    },
  })
}
