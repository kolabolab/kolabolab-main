import React, { createContext, useContext, ReactNode } from 'react'

interface AuthContextType {
  // Context can be used for additional auth-related functions
  // that need to be shared across components
}

const AuthContext = createContext<AuthContextType>({})

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Interceptors are now handled in apiClient.ts directly
  // No need to duplicate them here
  
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