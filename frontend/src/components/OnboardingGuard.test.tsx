/**
 * Property-Based Tests for OnboardingGuard routing logic
 *
 * Feature: post-signup-onboarding, Property 1: Onboarding guard routes correctly based on completion flag
 *
 * **Validates: Requirements 1.1, 1.2, 1.3**
 *
 * Property: For any authenticated user and any protected route path, the OnboardingGuard
 * SHALL redirect to /onboarding if and only if onboardingCompleted is false;
 * when onboardingCompleted is true, the guard SHALL render the requested route without redirection.
 * Additionally, if on /onboarding with onboardingCompleted=true, redirect to /dashboard.
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ChakraProvider } from '@chakra-ui/react'
import React from 'react'
import * as fc from 'fast-check'
import { OnboardingGuard } from './OnboardingGuard'
import { useAuthStore } from '../hooks/useAuth'
import { theme } from '../theme'

// Protected route paths that the guard would wrap (excluding /onboarding itself)
const PROTECTED_ROUTES = [
  '/dashboard',
  '/profile',
  '/create-startup',
  '/collaborations',
  '/investments',
]

// All routes the guard could encounter
const ALL_GUARD_ROUTES = [...PROTECTED_ROUTES, '/onboarding']

/**
 * Arbitrary for generating a valid authenticated user with a specific onboardingCompleted flag
 */
const userArbitrary = (onboardingCompleted: boolean) =>
  fc.record({
    id: fc.uuid(),
    email: fc.emailAddress(),
    username: fc.string({ minLength: 3, maxLength: 20 }).map((s) => s.replace(/[^a-z0-9]/gi, 'a')),
    firstName: fc.string({ minLength: 1, maxLength: 30 }).map((s) => s.replace(/[^a-zA-Z]/g, 'A') || 'User'),
    lastName: fc.string({ minLength: 1, maxLength: 30 }).map((s) => s.replace(/[^a-zA-Z]/g, 'B') || 'Test'),
    roles: fc.subarray(['entrepreneur', 'collaborator', 'investor'], { minLength: 0, maxLength: 3 }),
    isEmailVerified: fc.boolean(),
    onboardingCompleted: fc.constant(onboardingCompleted),
  })

/**
 * Arbitrary for generating a protected route path (not /onboarding)
 */
const protectedRouteArbitrary = fc.constantFrom(...PROTECTED_ROUTES)

/**
 * Arbitrary for generating any route the guard could encounter
 */
const anyGuardRouteArbitrary = fc.constantFrom(...ALL_GUARD_ROUTES)

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
}

/**
 * Helper to render OnboardingGuard at a specific route and capture navigation result
 */
function renderGuardAtRoute(initialPath: string) {
  const result = render(
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="*"
            element={
              <OnboardingGuard>
                <div data-testid="guarded-content">Protected Content</div>
              </OnboardingGuard>
            }
          />
        </Routes>
        {/* Capture navigation targets */}
        <CaptureLocation />
      </MemoryRouter>
    </ChakraProvider>
  )
  return result
}

/**
 * Helper to render with separate route handlers to detect redirects
 */
function renderGuardWithRoutes(initialPath: string) {
  render(
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route
            path="/onboarding"
            element={
              <OnboardingGuard>
                <div data-testid="onboarding-content">Onboarding Page</div>
              </OnboardingGuard>
            }
          />
          <Route
            path="/dashboard"
            element={<div data-testid="dashboard-redirect">Dashboard</div>}
          />
          {PROTECTED_ROUTES.filter((r) => r !== '/dashboard').map((route) => (
            <Route
              key={route}
              path={route}
              element={
                <OnboardingGuard>
                  <div data-testid="guarded-content">Protected Content at {route}</div>
                </OnboardingGuard>
              }
            />
          ))}
          <Route
            path="/dashboard"
            element={
              <OnboardingGuard>
                <div data-testid="guarded-content">Dashboard Content</div>
              </OnboardingGuard>
            }
          />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>
  )
}

// Location capture component
let capturedLocation = ''
function CaptureLocation() {
  const { useLocation } = require('react-router-dom')
  const location = useLocation()
  capturedLocation = location.pathname
  return null
}

describe('Feature: post-signup-onboarding, Property 1: Onboarding guard routes correctly based on completion flag', () => {
  beforeEach(() => {
    useAuthStore.getState().clearAuth()
    capturedLocation = ''
  })

  it('redirects to /onboarding when onboardingCompleted is false and not on /onboarding', () => {
    fc.assert(
      fc.property(
        userArbitrary(false),
        protectedRouteArbitrary,
        (user, route) => {
          // Setup: authenticated user with onboardingCompleted=false
          useAuthStore.getState().setAuth(user as any, mockTokens)

          const { unmount } = render(
            <ChakraProvider theme={theme}>
              <MemoryRouter initialEntries={[route]}>
                <Routes>
                  <Route
                    path={route}
                    element={
                      <OnboardingGuard>
                        <div data-testid="guarded-content">Should not render</div>
                      </OnboardingGuard>
                    }
                  />
                  <Route path="/onboarding" element={<div data-testid="onboarding-redirect">Onboarding</div>} />
                </Routes>
              </MemoryRouter>
            </ChakraProvider>
          )

          // Assert: should redirect to /onboarding, not render children
          expect(screen.queryByTestId('guarded-content')).not.toBeInTheDocument()
          expect(screen.getByTestId('onboarding-redirect')).toBeInTheDocument()

          unmount()
          useAuthStore.getState().clearAuth()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('renders children when onboardingCompleted is true and not on /onboarding', () => {
    fc.assert(
      fc.property(
        userArbitrary(true),
        protectedRouteArbitrary,
        (user, route) => {
          // Setup: authenticated user with onboardingCompleted=true
          useAuthStore.getState().setAuth(user as any, mockTokens)

          const { unmount } = render(
            <ChakraProvider theme={theme}>
              <MemoryRouter initialEntries={[route]}>
                <Routes>
                  <Route
                    path={route}
                    element={
                      <OnboardingGuard>
                        <div data-testid="guarded-content">Protected Content</div>
                      </OnboardingGuard>
                    }
                  />
                  <Route path="/onboarding" element={<div data-testid="onboarding-redirect">Onboarding</div>} />
                </Routes>
              </MemoryRouter>
            </ChakraProvider>
          )

          // Assert: should render children, not redirect
          expect(screen.getByTestId('guarded-content')).toBeInTheDocument()
          expect(screen.queryByTestId('onboarding-redirect')).not.toBeInTheDocument()

          unmount()
          useAuthStore.getState().clearAuth()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('redirects to /dashboard when on /onboarding and onboardingCompleted is true', () => {
    fc.assert(
      fc.property(
        userArbitrary(true),
        (user) => {
          // Setup: authenticated user with onboardingCompleted=true, on /onboarding
          useAuthStore.getState().setAuth(user as any, mockTokens)

          const { unmount } = render(
            <ChakraProvider theme={theme}>
              <MemoryRouter initialEntries={['/onboarding']}>
                <Routes>
                  <Route
                    path="/onboarding"
                    element={
                      <OnboardingGuard>
                        <div data-testid="onboarding-content">Onboarding Page</div>
                      </OnboardingGuard>
                    }
                  />
                  <Route path="/dashboard" element={<div data-testid="dashboard-redirect">Dashboard</div>} />
                </Routes>
              </MemoryRouter>
            </ChakraProvider>
          )

          // Assert: should redirect to /dashboard, not render onboarding content
          expect(screen.queryByTestId('onboarding-content')).not.toBeInTheDocument()
          expect(screen.getByTestId('dashboard-redirect')).toBeInTheDocument()

          unmount()
          useAuthStore.getState().clearAuth()
        }
      ),
      { numRuns: 100 }
    )
  })

  it('renders children when on /onboarding and onboardingCompleted is false', () => {
    fc.assert(
      fc.property(
        userArbitrary(false),
        (user) => {
          // Setup: authenticated user with onboardingCompleted=false, on /onboarding
          useAuthStore.getState().setAuth(user as any, mockTokens)

          const { unmount } = render(
            <ChakraProvider theme={theme}>
              <MemoryRouter initialEntries={['/onboarding']}>
                <Routes>
                  <Route
                    path="/onboarding"
                    element={
                      <OnboardingGuard>
                        <div data-testid="onboarding-content">Onboarding Page</div>
                      </OnboardingGuard>
                    }
                  />
                  <Route path="/dashboard" element={<div data-testid="dashboard-redirect">Dashboard</div>} />
                </Routes>
              </MemoryRouter>
            </ChakraProvider>
          )

          // Assert: should render onboarding content, not redirect
          expect(screen.getByTestId('onboarding-content')).toBeInTheDocument()
          expect(screen.queryByTestId('dashboard-redirect')).not.toBeInTheDocument()

          unmount()
          useAuthStore.getState().clearAuth()
        }
      ),
      { numRuns: 100 }
    )
  })
})
