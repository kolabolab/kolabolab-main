import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { updatesAPI } from '../services/apiClient'
import type { UpdatesResponse, DashboardFeedResponse } from '../types/startupUpdates'

/**
 * Fetches paginated updates for a specific startup.
 */
export function useStartupUpdates(startupId: string, page = 1, limit = 20) {
  return useQuery<UpdatesResponse>({
    queryKey: ['startup-updates', startupId, page, limit],
    queryFn: () => updatesAPI.getStartupUpdates(startupId, page, limit),
    enabled: !!startupId,
  })
}

/**
 * Fetches the authenticated user's dashboard feed (updates from their startups).
 */
export function useDashboardFeed(page = 1, limit = 20) {
  return useQuery<DashboardFeedResponse>({
    queryKey: ['dashboard-feed', page, limit],
    queryFn: () => updatesAPI.getDashboardFeed(page, limit),
  })
}

/**
 * Mutation hook for creating a new startup update.
 * Invalidates the startup updates and dashboard feed queries on success.
 */
export function useCreateUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ startupId, content }: { startupId: string; content: string }) =>
      updatesAPI.createUpdate(startupId, content),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup-updates', variables.startupId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-feed'] })
    },
  })
}

/**
 * Mutation hook for deleting a startup update.
 * Invalidates the startup updates and dashboard feed queries on success.
 */
export function useDeleteUpdate() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ startupId, updateId }: { startupId: string; updateId: string }) =>
      updatesAPI.deleteUpdate(startupId, updateId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['startup-updates', variables.startupId] })
      queryClient.invalidateQueries({ queryKey: ['dashboard-feed'] })
    },
  })
}
