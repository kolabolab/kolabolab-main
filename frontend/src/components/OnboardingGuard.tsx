import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

interface OnboardingGuardProps {
  children: React.ReactNode
}

export const OnboardingGuard: React.FC<OnboardingGuardProps> = ({ children }) => {
  const { user } = useAuth()
  const location = useLocation()

  // If user is not available, render children (ProtectedRoute handles auth check)
  if (!user) {
    return <>{children}</>
  }

  const isOnOnboardingPage = location.pathname === '/onboarding'

  // If on /onboarding and already completed, redirect to /dashboard
  if (isOnOnboardingPage && user.onboardingCompleted === true) {
    return <Navigate to="/dashboard" replace />
  }

  // If onboarding not completed and not on /onboarding, redirect to /onboarding
  if (!isOnOnboardingPage && user.onboardingCompleted === false) {
    return <Navigate to="/onboarding" replace />
  }

  // Otherwise, render children
  return <>{children}</>
}
