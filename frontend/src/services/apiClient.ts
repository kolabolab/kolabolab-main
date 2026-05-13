import axios, { AxiosError, AxiosRequestConfig, CancelTokenSource } from 'axios'
import { useAuthStore } from '../hooks/useAuth'

// Use environment variable or fallback to local development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://test-api.beryour.workers.dev';

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
    apiError.message = (error.response.data as any)?.message || error.message
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
    
    // Cancel previous request with same key if exists
    if (pendingRequests.has(requestKey)) {
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
      return Promise.reject(new Error('Request cancelled'))
    }
    
    // Handle 401 Unauthorized with token refresh
    if ((error as AxiosError).response?.status === 401 && !(originalRequest as any)._retry) {
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
      const response = await apiClient.post('/auth/verify-email', { token })
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

export default apiClient
