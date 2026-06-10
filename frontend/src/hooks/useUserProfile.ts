import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { profileAPI } from '../services/apiClient'
import type { UserProfileResponse, ProfileUpdateData } from '../types/profile'

/**
 * Fetches a user's public profile by ID.
 */
export function useUserProfile(userId: string | undefined) {
  return useQuery<UserProfileResponse>({
    queryKey: ['userProfile', userId],
    queryFn: () => profileAPI.getUserProfile(userId!),
    enabled: !!userId,
  })
}

/**
 * Mutation hook for updating the authenticated user's profile.
 * Invalidates the profile query cache on success.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ProfileUpdateData) => profileAPI.updateMyProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile'] })
    },
  })
}
