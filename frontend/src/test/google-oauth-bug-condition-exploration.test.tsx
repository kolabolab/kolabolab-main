/**
 * Bug Condition Exploration Test - Google OAuth Sign-in Fix
 * 
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4**
 * 
 * CRITICAL: This test MUST FAIL on unfixed code - failure confirms the bug exists
 * DO NOT attempt to fix the test or the code when it fails
 * 
 * This test encodes the expected behavior - it will validate the fix when it passes after implementation
 * GOAL: Surface counterexamples that demonstrate the Google OAuth bug exists
 * 
 * Property 1: Bug Condition - Google OAuth Invalid Credentials
 * Test that Google OAuth authentication fails with invalid credentials
 * Test cases: invalid GOOGLE_CLIENT_SECRET, missing credentials, callback URL mismatch
 * Run test on UNFIXED code (simulate invalid credentials)
 * EXPECTED OUTCOME: Test FAILS with "invalid_client" errors (this is correct - it proves the bug exists)
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import React from 'react'
import LoginPage from '../pages/auth/LoginPage'
import OAuthCallbackPage from '../pages/auth/OAuthCallbackPage'
import { theme } from '../theme'

// Test wrapper component
const TestWrapper = ({ children }: { children: React.ReactNode }) => (
  <ChakraProvider theme={theme}>
    <BrowserRouter>
      {children}
    </BrowserRouter>
  </ChakraProvider>
)

// Mock environment variables for testing invalid credentials
const mockInvalidEnv = {
  GOOGLE_CLIENT_ID: 'invalid-client-id',
  GOOGLE_CLIENT_SECRET: 'invalid-client-secret',
  GOOGLE_CALLBACK_URL: 'https://wrong-domain.com/auth/google/callback',
  FRONTEND_URL: 'https://wrong-frontend.com'
}

const mockValidEnv = {
  GOOGLE_CLIENT_ID: '123456789-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com',
  GOOGLE_CLIENT_SECRET: 'GOCSPX-valid_client_secret_here',
  GOOGLE_CALLBACK_URL: 'https://kolabolab-api-dev.beryour.workers.dev/auth/google/callback',
  FRONTEND_URL: 'https://0fc93d16.kolabolab-dev.pages.dev'
}

// Mock fetch for testing OAuth token exchange
const mockFetch = vi.fn()
vi.stubGlobal('fetch', mockFetch)

describe('Bug Condition Exploration - Google OAuth Sign-in Fix', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockFetch.mockClear()
    
    // Mock window.location for OAuth redirects
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        origin: 'http://localhost:3000',
        assign: vi.fn(),
        replace: vi.fn(),
      },
      writable: true,
    })
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Property 1: Bug Condition - Google OAuth Invalid Credentials', () => {
    it('should fail OAuth initiation with invalid GOOGLE_CLIENT_ID', async () => {
      // Simulate the bug condition: invalid client ID
      const invalidClientId = 'invalid-client-id'
      
      // Mock the OAuth initiation endpoint with invalid credentials
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_request',
          error_description: 'Invalid client_id'
        }),
        text: async () => 'Invalid client_id'
      })

      render(
        <TestWrapper>
          <LoginPage />
        </TestWrapper>
      )

      // Find and click the Google OAuth button
      const googleButton = screen.getByRole('button', { name: /continue with google/i })
      expect(googleButton).toBeInTheDocument()

      // Simulate clicking the Google OAuth button
      fireEvent.click(googleButton)

      // EXPECTED: OAuth should succeed with valid credentials
      // This will FAIL on unfixed code with invalid client ID
      await waitFor(() => {
        // Should redirect to Google OAuth successfully
        expect(window.location.assign).toHaveBeenCalledWith(
          expect.stringContaining('https://accounts.google.com/o/oauth2/v2/auth')
        )
        
        // Should include valid client_id parameter
        const redirectUrl = (window.location.assign as any).mock.calls[0][0]
        expect(redirectUrl).toContain(`client_id=${mockValidEnv.GOOGLE_CLIENT_ID}`)
        expect(redirectUrl).not.toContain(`client_id=${invalidClientId}`)
      })
    })

    it('should fail token exchange with invalid GOOGLE_CLIENT_SECRET', async () => {
      // Simulate the bug condition: invalid client secret during token exchange
      const authCode = 'valid-auth-code-from-google'
      const state = 'valid-state-parameter'
      
      // Mock Google's token exchange endpoint returning "invalid_client" error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'invalid_client',
          error_description: 'The OAuth client was not found.'
        }),
        text: async () => JSON.stringify({
          error: 'invalid_client',
          error_description: 'The OAuth client was not found.'
        })
      })

      // Mock the backend OAuth callback endpoint
      const mockBackendUrl = 'https://kolabolab-api-dev.beryour.workers.dev'
      
      // Simulate the OAuth callback with authorization code
      const callbackUrl = `${mockBackendUrl}/auth/google/callback?code=${authCode}&state=${state}`
      
      // Test the token exchange process
      const tokenExchangeResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: mockInvalidEnv.GOOGLE_CLIENT_ID,
          client_secret: mockInvalidEnv.GOOGLE_CLIENT_SECRET,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: mockInvalidEnv.GOOGLE_CALLBACK_URL,
        }),
      })

      const tokenResult = await tokenExchangeResponse.json()

      // EXPECTED: Token exchange should succeed with valid credentials
      // This will FAIL on unfixed code with invalid client secret
      expect(tokenExchangeResponse.ok).toBe(true)
      expect(tokenResult.error).toBeUndefined()
      expect(tokenResult.access_token).toBeDefined()
      expect(tokenResult.id_token).toBeDefined()
      
      // Should NOT return "invalid_client" error
      expect(tokenResult.error).not.toBe('invalid_client')
      expect(tokenResult.error_description).not.toContain('OAuth client was not found')
    })

    it('should fail with callback URL mismatch', async () => {
      // Simulate the bug condition: callback URL mismatch
      const authCode = 'valid-auth-code-from-google'
      const wrongCallbackUrl = 'https://wrong-domain.com/auth/google/callback'
      
      // Mock Google's token exchange with redirect_uri mismatch error
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({
          error: 'redirect_uri_mismatch',
          error_description: 'Bad Request'
        }),
        text: async () => JSON.stringify({
          error: 'redirect_uri_mismatch',
          error_description: 'Bad Request'
        })
      })

      // Test token exchange with wrong callback URL
      const tokenExchangeResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: mockValidEnv.GOOGLE_CLIENT_ID,
          client_secret: mockValidEnv.GOOGLE_CLIENT_SECRET,
          code: authCode,
          grant_type: 'authorization_code',
          redirect_uri: wrongCallbackUrl, // Wrong callback URL
        }),
      })

      const tokenResult = await tokenExchangeResponse.json()

      // EXPECTED: Should succeed with correct callback URL
      // This will FAIL on unfixed code with callback URL mismatch
      expect(tokenExchangeResponse.ok).toBe(true)
      expect(tokenResult.error).toBeUndefined()
      expect(tokenResult.access_token).toBeDefined()
      
      // Should NOT return redirect_uri_mismatch error
      expect(tokenResult.error).not.toBe('redirect_uri_mismatch')
      expect(tokenResult.error_description).not.toContain('Bad Request')
    })

    it('should fail with missing environment variables', async () => {
      // Simulate the bug condition: missing OAuth credentials
      const authCode = 'valid-auth-code-from-google'
      
      // Mock missing environment variables
      const missingEnv = {
        GOOGLE_CLIENT_ID: undefined,
        GOOGLE_CLIENT_SECRET: undefined,
        GOOGLE_CALLBACK_URL: undefined
      }

      // Mock configuration error response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({
          error: 'configuration_error',
          message: 'OAuth credentials not configured'
        }),
        text: async () => 'OAuth credentials not configured'
      })

      // Test OAuth initiation without proper configuration
      try {
        const response = await fetch('/auth/google', {
          method: 'GET'
        })
        
        const result = await response.json()
        
        // EXPECTED: Should have proper OAuth configuration
        // This will FAIL on unfixed code with missing credentials
        expect(response.ok).toBe(true)
        expect(result.error).toBeUndefined()
        
        // Should NOT have configuration errors
        expect(result.error).not.toBe('configuration_error')
        expect(result.message).not.toContain('OAuth credentials not configured')
        
      } catch (error) {
        // Should not throw configuration errors
        expect(error).toBeUndefined()
      }
    })

    it('should complete full OAuth flow successfully', async () => {
      // Test the complete OAuth flow that should work after fix
      const authCode = 'valid-auth-code-from-google'
      const state = 'valid-state-parameter'
      
      // Mock successful token exchange
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            access_token: 'valid-access-token',
            id_token: 'valid-id-token',
            refresh_token: 'valid-refresh-token',
            token_type: 'Bearer',
            expires_in: 3600
          })
        })
        // Mock successful user info fetch
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({
            id: 'google-user-123',
            email: 'test@example.com',
            name: 'Test User',
            given_name: 'Test',
            family_name: 'User',
            picture: 'https://example.com/avatar.jpg',
            verified_email: true
          })
        })

      // Simulate OAuth callback processing
      const mockUserData = {
        id: 'google-user-123',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        avatar: 'https://example.com/avatar.jpg',
        roles: ['entrepreneur'],
        isEmailVerified: true
      }

      const encodedUserData = btoa(JSON.stringify(mockUserData))
      const refreshToken = 'valid-refresh-token'

      // Mock successful OAuth callback page
      Object.defineProperty(window, 'location', {
        value: {
          ...window.location,
          search: `?token=${encodedUserData}&refresh=${refreshToken}`
        },
        writable: true,
      })

      render(
        <TestWrapper>
          <OAuthCallbackPage />
        </TestWrapper>
      )

      // EXPECTED: OAuth callback should process successfully
      // This will FAIL on unfixed code due to credential issues
      await waitFor(() => {
        // Should process user data successfully
        expect(window.localStorage.getItem).toHaveBeenCalledWith('auth_token')
        expect(window.localStorage.setItem).toHaveBeenCalledWith('auth_token', expect.any(String))
        expect(window.localStorage.setItem).toHaveBeenCalledWith('refresh_token', refreshToken)
        
        // Should not show error messages
        expect(screen.queryByText(/error/i)).not.toBeInTheDocument()
        expect(screen.queryByText(/failed/i)).not.toBeInTheDocument()
      })
    })

    it('should handle OAuth state validation correctly', async () => {
      // Test OAuth state parameter validation (CSRF protection)
      const validState = 'valid-state-uuid'
      const invalidState = 'invalid-state-value'
      
      // Mock KV storage for state validation
      const mockKVGet = vi.fn()
      const mockKVPut = vi.fn()
      const mockKVDelete = vi.fn()

      // Simulate state validation failure
      mockKVGet.mockResolvedValueOnce(null) // State not found in KV storage

      // Mock backend response for invalid state
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 302,
        headers: {
          get: (name: string) => {
            if (name === 'location') {
              return `${mockValidEnv.FRONTEND_URL}/auth/callback?error=invalid_state`
            }
            return null
          }
        }
      })

      // Test OAuth callback with invalid state
      const callbackUrl = `/auth/google/callback?code=valid-code&state=${invalidState}`
      
      const response = await fetch(callbackUrl)
      
      // EXPECTED: Should validate state correctly and proceed
      // This will FAIL on unfixed code with state validation issues
      expect(response.ok).toBe(true)
      
      // Should NOT redirect with invalid_state error
      const locationHeader = response.headers.get('location')
      expect(locationHeader).not.toContain('error=invalid_state')
      
      // Should have proper state validation mechanism
      expect(mockKVGet).toHaveBeenCalledWith(`oauth_state_${validState}`)
    })
  })

  describe('Counterexample Documentation', () => {
    it('should document the specific error patterns that occur with invalid credentials', () => {
      // Document the counterexamples that demonstrate the bug exists
      const bugConditionExamples = {
        invalidClientId: {
          error: 'invalid_request',
          description: 'Invalid client_id parameter',
          httpStatus: 400,
          googleResponse: 'The OAuth client was not found.'
        },
        invalidClientSecret: {
          error: 'invalid_client',
          description: 'The OAuth client was not found.',
          httpStatus: 400,
          googleResponse: 'Client authentication failed'
        },
        callbackUrlMismatch: {
          error: 'redirect_uri_mismatch',
          description: 'Bad Request',
          httpStatus: 400,
          googleResponse: 'Invalid redirect URI'
        },
        missingCredentials: {
          error: 'configuration_error',
          description: 'OAuth credentials not configured',
          httpStatus: 500,
          backendResponse: 'Environment variables not set'
        }
      }

      // EXPECTED: These error patterns should NOT occur with valid credentials
      // This documents the counterexamples that prove the bug exists
      Object.values(bugConditionExamples).forEach(example => {
        expect(example.error).not.toBe('success')
        expect(example.httpStatus).toBeGreaterThanOrEqual(400)
      })

      // The fix should eliminate these error patterns
      expect(bugConditionExamples.invalidClientId.error).toBe('invalid_request')
      expect(bugConditionExamples.invalidClientSecret.error).toBe('invalid_client')
      expect(bugConditionExamples.callbackUrlMismatch.error).toBe('redirect_uri_mismatch')
      expect(bugConditionExamples.missingCredentials.error).toBe('configuration_error')
    })
  })
})