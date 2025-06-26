import React, { createContext, useContext, useEffect, ReactNode } from 'react'
import { useAuth } from '../hooks/useAuth'
import { apiClient } from '../services/apiClient'

interface AuthContextType {
  // Context can be used for additional auth-related functions
  // that need to be shared across components
}

const AuthContext = createContext<AuthContextType>({})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const { tokens, setLoading, clearAuth } = useAuth()

  useEffect(() => {
    // Set up axios interceptors for authentication
    const requestInterceptor = apiClient.interceptors.request.use(
      (config) => {
        if (tokens?.accessToken) {
          config.headers.Authorization = `Bearer ${tokens.accessToken}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    const responseInterceptor = apiClient.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Token expired or invalid
          clearAuth()
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
    )

    // Cleanup interceptors on unmount
    return () => {
      apiClient.interceptors.request.eject(requestInterceptor)
      apiClient.interceptors.response.eject(responseInterceptor)
    }
  }, [tokens, clearAuth])

  return (
    <AuthContext.Provider value={{}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return context
}