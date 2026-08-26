import axios, { AxiosError, AxiosRequestConfig, CancelTokenSource } from 'axios'
import { useAuthStore } from '../hooks/useAuth'
import type { ApplicationSubmission, ReceivedApplicationsResponse, MyApplicationsResponse, ApplicationWithDetails } from '../types/applications'
import type { NotificationListResponse, UnreadCountResponse } from '../types/notifications'
import type { SendMessageRequest, ConversationsListResponse, ConversationMessagesResponse, UnreadMessageCountResponse } from '../types/messages'
import type { UpdatesResponse, DashboardFeedResponse } from '../types/startupUpdates'
import type { ProfileUpdateData, UserProfileResponse } from '../types/profile'

// API URL - runtime hostname detection
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const __PROD_API__ = 'https://kolabolab-api.beryour.workers.dev';
// eslint-disable-next-line @typescript-eslint/no-unused-vars  
const __DEV_API__ = 'https://kolabolab-api-dev.beryour.workers.dev';
const API_BASE_URL = window.location.hostname.includes('localhost') || window.location.hostname.includes('kolabolab-dev') || window.location.hostname.includes('0fc93d16') ? __DEV_API__ : __PROD_API__;

// Fallback mode for when backend is not available
const FALLBACK_MODE = import.meta.env.VITE_FALLBACK_MODE === 'true' || false;

// Request cancellation tracking
const pendingRequests = new Map<string, CancelTokenSource>()

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // Base delay in ms
  retryableStatuses: [408, 429, 500, 502, 503, 504],
}

// Enhanced error types
export interface APIError extends Error {
  status?: number
  code?: string
  details?: any
}

// Create API client with enhanced configuration
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Utility function to create request key for cancellation
const createRequestKey = (config: AxiosRequestConfig): string => {
  return `${config.method?.toUpperCase()}_${config.url}_${JSON.stringify(config.params || {})}`
}

// Utility function for exponential backoff delay
const getRetryDelay = (retryCount: number): number => {
  return RETRY_CONFIG.retryDelay * Math.pow(2, retryCount) + Math.random() * 1000
}

// Enhanced error handler
const handleAPIError = (error: AxiosError): APIError => {
  const apiError: APIError = new Error(error.message) as APIError
  
  if (error.response) {
    // Server responded with error status
    apiError.status = error.response.status
    apiError.code = (error.response.data as any)?.code || `HTTP_${error.response.status}`
    apiError.details = error.response.data
    apiError.message = (error.response.data as any)?.message || (error.response.data as any)?.error || error.message
  } else if (error.request) {
    // Request was made but no response received
    apiError.code = 'NETWORK_ERROR'
    apiError.message = 'Network error - please check your connection'
  } else {
    // Something else happened
    apiError.code = 'REQUEST_ERROR'
    apiError.message = error.message
  }
  
  return apiError
}

// Request interceptor with cancellation support
apiClient.interceptors.request.use(
  (config) => {
    // Add auth token
    const { tokens } = useAuthStore.getState()
    if (tokens?.accessToken) {
      config.headers.Authorization = `Bearer ${tokens.accessToken}`
    }
    
    // Add request cancellation
    const requestKey = createRequestKey(config)
    
    // Only supersede when the caller explicitly opts in (e.g. type-ahead search).
    // Previously EVERY duplicate key cancelled the in-flight request, so React
    // StrictMode's double-invoked effects cancelled their own first request and
    // the dashboard rendered "Failed to load data / Request cancelled".
    const supersede = (config as AxiosRequestConfig & { supersede?: boolean }).supersede === true
    if (supersede && pendingRequests.has(requestKey)) {
      const existingRequest = pendingRequests.get(requestKey)
      existingRequest?.cancel('Request superseded by newer request')
    }
    
    // Create new cancel token
    const cancelTokenSource = axios.CancelToken.source()
    config.cancelToken = cancelTokenSource.token
    pendingRequests.set(requestKey, cancelTokenSource)
    
    return config
  },
  (error) => Promise.reject(handleAPIError(error))
)

// Enhanced response interceptor with retry logic
apiClient.interceptors.response.use(
  (response) => {
    // Remove completed request from pending
    const requestKey = createRequestKey(response.config)
    pendingRequests.delete(requestKey)
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean; _retryCount?: number }
    
    // Remove failed request from pending
    if (originalRequest) {
      const requestKey = createRequestKey(originalRequest)
      pendingRequests.delete(requestKey)
    }
    
    // Handle request cancellation
    if (axios.isCancel(error)) {
      // Flagged so UI can ignore supersede-cancellations instead of rendering
      // them as a hard failure.
      const cancelled = new Error('Request cancelled') as APIError & { isCancelled: boolean }
      cancelled.code = 'ERR_CANCELED'
      cancelled.isCancelled = true
      return Promise.reject(cancelled)
    }
    
    // Handle 401 Unauthorized with token refresh
    // Skip for auth endpoints (login, register) - they should handle their own 401s
    const isAuthEndpoint = originalRequest?.url?.includes('/auth/login') || originalRequest?.url?.includes('/auth/register');
    if ((error as AxiosError).response?.status === 401 && !(originalRequest as any)._retry && !isAuthEndpoint) {
      (originalRequest as any)._retry = true
      
      const { tokens, clearAuth, setAuth } = useAuthStore.getState()
      
      if (tokens?.refreshToken) {
        try {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken: tokens.refreshToken
          })
          
          const newTokens = response.data
          setAuth(newTokens.user, newTokens)
          
          // Retry original request with new token
          originalRequest.headers = originalRequest.headers || {}
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`
          return apiClient(originalRequest)
        } catch (refreshError) {
          // Refresh failed, clear auth and redirect to login
          clearAuth()
          if (typeof window !== 'undefined') {
            window.location.href = '/login'
          }
          return Promise.reject(handleAPIError(refreshError as AxiosError))
        }
      } else {
        // No refresh token, clear auth
        clearAuth()
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }
    }
    
    // Implement retry logic for retryable errors
    const shouldRetry = (
      originalRequest &&
      !(originalRequest as any)._retry &&
      (error as AxiosError).response?.status &&
      RETRY_CONFIG.retryableStatuses.includes((error as AxiosError).response!.status) &&
      ((originalRequest as any)._retryCount || 0) < RETRY_CONFIG.maxRetries
    )
    
    if (shouldRetry) {
      (originalRequest as any)._retryCount = ((originalRequest as any)._retryCount || 0) + 1
      
      // Wait before retrying with exponential backoff
      await new Promise(resolve => 
        setTimeout(resolve, getRetryDelay((originalRequest as any)._retryCount!))
      )
      
      return apiClient(originalRequest)
    }
    
    // Log error for debugging
    if (import.meta.env.DEV) {
      console.error('API Error:', {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: (error as AxiosError).response?.status,
        message: (error as Error).message,
        data: (error as AxiosError).response?.data
      })
    }
    
    return Promise.reject(handleAPIError(error as AxiosError))
  }
)

// Utility function to cancel all pending requests
export const cancelAllRequests = (): void => {
  pendingRequests.forEach((cancelTokenSource, _key) => {
    cancelTokenSource.cancel('All requests cancelled')
  })
  pendingRequests.clear()
}

// Utility function to cancel specific request
export const cancelRequest = (method: string, url: string, params?: any): void => {
  const requestKey = createRequestKey({ method, url, params })
  const cancelTokenSource = pendingRequests.get(requestKey)
  if (cancelTokenSource) {
    cancelTokenSource.cancel('Request cancelled by user')
    pendingRequests.delete(requestKey)
  }
}

// Enhanced auth API functions with better error handling
export const authAPI = {
  login: async (email: string, password: string) => {
    // Fallback mode for demo purposes
    if (FALLBACK_MODE || API_BASE_URL.includes('pages.dev')) {
      // Mock successful login for demo
      if (email === 'test@example.com' && password === 'Test123!@') {
        return {
          message: 'Login successful',
          user: {
            id: 'demo-user-1',
            email: 'test@example.com',
            firstName: 'Test',
            lastName: 'User'
          },
          tokens: {
            accessToken: 'demo-access-token',
            refreshToken: 'demo-refresh-token'
          }
        }
      } else if (email === 'admin@kolabolab.com' && password === 'KolaboLabAdmin2024!') {
        return {
          message: 'Login successful',
          user: {
            id: 'demo-admin-1',
            email: 'admin@kolabolab.com',
            firstName: 'Admin',
            lastName: 'User'
          },
          tokens: {
            accessToken: 'demo-admin-token',
            refreshToken: 'demo-admin-refresh'
          }
        }
      } else {
        throw new Error('Invalid credentials')
      }
    }
    
    try {
      const response = await apiClient.post('/auth/login', { email, password })
      return response.data
    } catch (error) {
      throw handleAPIError(error as AxiosError)
    }
  },
  
  register: async (userData: {
    email: string
    password: string
    firstName: string
    lastName: string
    username?: string
  }) => {
    try {
      const response = await apiClient.post('/auth/register', userData)
      return response.data
    } catch (error) {
      throw handleAPIError(error as AxiosError)
    }
  },
  
  refreshToken: async (refreshToken: string) => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken })
      return response.data
    } catch (error) {
      throw handleAPIError(error as AxiosError)
    }
  },
  
  logout: async () => {
    try {
      const response = await apiClient.post('/auth/logout')
      return response.data
    } catch (error) {
      // Don't throw on logout errors, just log them
      console.warn('Logout error:', error)
      return null
    }
  },
  
  forgotPassword: async (email: string) => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email })
      return response.data
    } catch (error) {
      throw handleAPIError(error as AxiosError)
    }
  },
  
  resetPassword: async (token: string, newPassword: string) => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, newPassword })
      return response.data
    } catch (error) {
      throw handleAPIError(error as AxiosError)
    }
  },
  
  verifyEmail: async (token: string) => {
    try {
      const response = await apiClient.get('/api/auth/verify-email', { params: { token } })
      return response.data
    } catch (error) {
      throw handleAPIError(error as AxiosError)
    }
  },
  
  resendVerification: async () => {
    try {
      const response = await apiClient.post('/api/auth/resend-verification')
      return response.data
    } catch (error) {
      throw handleAPIError(error as AxiosError)
    }
  },

  resendVerificationEmail: async (email: string) => {
    try {
      const response = await apiClient.post('/auth/resend-verification-email', { email })
      return response.data
    } catch (error) {
      throw handleAPIError(error as AxiosError)
    }
  }
}

// Dashboard API functions
export const dashboardAPI = {
  getStats: () => apiClient.get('/api/dashboard/stats').then(r => r.data),
  getActivities: () => apiClient.get('/api/dashboard/activities').then(r => r.data),
  getUserStartups: () => apiClient.get('/api/user/startups').then(r => r.data),
}

// Admin API functions
export const adminAPI = {
  getPendingStartups: () => apiClient.get('/api/admin/pending-startups').then(r => r.data),
  getAllStartups: () => apiClient.get('/api/admin/all-startups').then(r => r.data),
  getUsers: () => apiClient.get('/api/admin/users').then(r => r.data),
  approveStartup: (id: string) => apiClient.post(`/api/admin/approve/${id}`).then(r => r.data),
  rejectStartup: (id: string) => apiClient.post(`/api/admin/reject/${id}`).then(r => r.data),
  deleteStartup: (id: string) => apiClient.delete(`/api/admin/startups/${id}`).then(r => r.data),
  getStats: () => apiClient.get('/api/admin/stats').then(r => r.data),
  getAnalytics: (period?: string) => apiClient.get('/api/admin/analytics', { params: { period } }).then(r => r.data),
}

// Applications API functions
export const applicationsAPI = {
  submitApplication: (data: ApplicationSubmission) =>
    apiClient.post('/api/applications', data).then(r => r.data),

  getReceivedApplications: (params?: { page?: number; roleTitle?: string; status?: string }) =>
    apiClient.get<ReceivedApplicationsResponse>('/api/applications/received', { params }).then(r => r.data),

  getMyApplications: () =>
    apiClient.get<MyApplicationsResponse>('/api/applications/mine').then(r => r.data),

  updateApplicationStatus: (id: string, status: 'accepted' | 'rejected') =>
    apiClient.patch<{ message: string; application: ApplicationWithDetails }>(`/api/applications/${id}/status`, { status }).then(r => r.data),
}

// Notifications API functions
export const notificationsAPI = {
  getNotifications: (page?: number) =>
    apiClient.get<NotificationListResponse>('/api/notifications', { params: page ? { page } : undefined }).then(r => r.data),

  getUnreadCount: () =>
    apiClient.get<UnreadCountResponse>('/api/notifications/unread-count').then(r => r.data),

  markAsRead: (id: string) =>
    apiClient.patch<{ message: string; notification: { id: string; isRead: boolean; updatedAt: string } }>(`/api/notifications/${id}/read`).then(r => r.data),

  markAllAsRead: () =>
    apiClient.post<{ message: string; updatedCount: number }>('/api/notifications/mark-all-read').then(r => r.data),
}

// Messages API functions
export const messagesAPI = {
  sendMessage: (data: SendMessageRequest) =>
    apiClient.post('/api/messages', data).then(r => r.data),

  getConversations: () =>
    apiClient.get<ConversationsListResponse>('/api/messages/conversations').then(r => r.data),

  getConversationMessages: (conversationId: string) =>
    apiClient.get<ConversationMessagesResponse>(`/api/messages/conversations/${conversationId}`).then(r => r.data),

  markConversationAsRead: (conversationId: string) =>
    apiClient.patch<{ message: string; updatedCount: number }>(`/api/messages/conversations/${conversationId}/read`).then(r => r.data),

  getUnreadCount: () =>
    apiClient.get<UnreadMessageCountResponse>('/api/messages/unread-count').then(r => r.data),
}

// Profile API functions
export const profileAPI = {
  getUserProfile: (userId: string) =>
    apiClient.get<UserProfileResponse>(`/api/users/${userId}/profile`).then(r => r.data),

  updateMyProfile: (data: ProfileUpdateData) =>
    apiClient.put<{ message: string; user: UserProfileResponse['user'] }>('/api/users/me/profile', data).then(r => r.data),
}

// Startup Updates API functions
export const updatesAPI = {
  createUpdate: (startupId: string, content: string) =>
    apiClient.post(`/api/startups/${startupId}/updates`, { content }).then(r => r.data),

  getStartupUpdates: (startupId: string, page?: number, limit?: number) =>
    apiClient.get<UpdatesResponse>(`/api/startups/${startupId}/updates`, {
      params: { page, limit },
    }).then(r => r.data),

  deleteUpdate: (startupId: string, updateId: string) =>
    apiClient.delete(`/api/startups/${startupId}/updates/${updateId}`).then(r => r.data),

  getDashboardFeed: (page?: number, limit?: number) =>
    apiClient.get<DashboardFeedResponse>('/api/dashboard/feed', {
      params: { page, limit },
    }).then(r => r.data),
}

export default apiClient
