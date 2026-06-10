import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { messagesAPI } from '../services/apiClient'
import type {
  SendMessageRequest,
  ConversationsListResponse,
  ConversationMessagesResponse,
  UnreadMessageCountResponse,
} from '../types/messages'

/**
 * Fetches the authenticated user's conversations list with 30-second polling.
 * Returns conversations ordered by last activity (most recent first).
 */
export function useConversations() {
  return useQuery<ConversationsListResponse>({
    queryKey: ['messages', 'conversations'],
    queryFn: () => messagesAPI.getConversations(),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
  })
}

/**
 * Fetches messages for a specific conversation with 30-second polling.
 * Only enabled when a valid conversationId is provided.
 */
export function useConversationMessages(conversationId: string) {
  return useQuery<ConversationMessagesResponse>({
    queryKey: ['messages', 'conversation', conversationId],
    queryFn: () => messagesAPI.getConversationMessages(conversationId),
    refetchInterval: 30000,
    enabled: !!conversationId,
  })
}

/**
 * Mutation hook for sending a new message.
 * Invalidates the conversations list and the specific conversation query on success.
 */
export function useSendMessage() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SendMessageRequest) => messagesAPI.sendMessage(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] })
      // Invalidate all conversation message queries since we may not know the conversationId upfront
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversation'] })
    },
  })
}

/**
 * Mutation hook for marking all messages in a conversation as read.
 * Invalidates the conversations list and unread count queries on success.
 */
export function useMarkConversationAsRead(conversationId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => messagesAPI.markConversationAsRead(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages', 'conversations'] })
      queryClient.invalidateQueries({ queryKey: ['messages', 'unread-count'] })
    },
  })
}

/**
 * Fetches the total unread message count with 30-second polling.
 * Pauses polling when the browser tab is hidden and refetches immediately
 * when the tab becomes visible again.
 */
export function useMessageUnreadCount() {
  return useQuery<UnreadMessageCountResponse>({
    queryKey: ['messages', 'unread-count'],
    queryFn: () => messagesAPI.getUnreadCount(),
    refetchInterval: 30000,
    refetchIntervalInBackground: false,
    refetchOnWindowFocus: true,
  })
}
