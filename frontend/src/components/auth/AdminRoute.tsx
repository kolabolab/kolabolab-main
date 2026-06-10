import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'

interface AdminRouteProps {
  children: React.ReactNode
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth()

  if (!user?.roles?.includes('admin')) {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
