import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { applicationsAPI } from '../services/apiClient'
import type {
  ReceivedApplicationsResponse,
  MyApplicationsResponse,
  ApplicationSubmission,
  ApplicationWithDetails,
} from '../types/applications'

/**
 * Fetches received applications for the authenticated startup creator.
 * Supports pagination and filtering by role title and status.
 */
export function useReceivedApplications(
  page?: number,
  roleTitle?: string,
  status?: string
) {
  return useQuery<ReceivedApplicationsResponse>({
    queryKey: ['applications', 'received', page, roleTitle, status],
    queryFn: () =>
      applicationsAPI.getReceivedApplications({ page, roleTitle, status }),
  })
}

/**
 * Fetches the authenticated user's submitted applications.
 */
export function useMyApplications() {
  return useQuery<MyApplicationsResponse>({
    queryKey: ['applications', 'mine'],
    queryFn: () => applicationsAPI.getMyApplications(),
  })
}

/**
 * Mutation hook for submitting a new application.
 * Invalidates both 'mine' and 'received' queries on success.
 */
export function useSubmitApplication() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApplicationSubmission) =>
      applicationsAPI.submitApplication(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'mine'] })
      queryClient.invalidateQueries({ queryKey: ['applications', 'received'] })
    },
  })
}

/**
 * Mutation hook for updating an application's status (accept/reject).
 * Invalidates both 'received' and 'mine' queries on success.
 */
export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient()

  return useMutation<
    { message: string; application: ApplicationWithDetails },
    Error,
    { id: string; status: 'accepted' | 'rejected' }
  >({
    mutationFn: ({ id, status }) =>
      applicationsAPI.updateApplicationStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', 'received'] })
      queryClient.invalidateQueries({ queryKey: ['applications', 'mine'] })
    },
  })
}
