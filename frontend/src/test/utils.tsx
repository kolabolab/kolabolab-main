import React from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { theme } from '../theme'

// Test wrapper component
const TestProviders = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: 0,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  })

  return (
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </QueryClientProvider>
    </ChakraProvider>
  )
}

// Custom render function with providers
const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: TestProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Test utilities
export const createMockUser = (overrides = {}) => ({
  id: '1',
  firstName: 'Test',
  lastName: 'User',
  email: 'test@example.com',
  username: 'testuser',
  avatar: 'https://example.com/avatar.jpg',
  roles: ['user'],
  isEmailVerified: true,
  onboardingCompleted: true,
  ...overrides,
})

export const createMockTokens = (overrides = {}) => ({
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
  ...overrides,
})

// Mock API responses
export const mockApiResponse = <T,>(data: T, delay = 0) => {
  return new Promise<{ data: T }>((resolve) => {
    setTimeout(() => resolve({ data }), delay)
  })
}

export const mockApiError = (status = 500, message = 'Server Error', delay = 0) => {
  return new Promise((_, reject) => {
    setTimeout(() => {
      const error = new Error(message) as any
      error.response = { status, data: { message } }
      reject(error)
    }, delay)
  })
}

// Accessibility testing utilities
export const axeMatchers = {
  toHaveNoViolations: expect.extend({
    toHaveNoViolations(received) {
      if (received.violations.length === 0) {
        return {
          pass: true,
          message: () => 'Expected accessibility violations, but none were found',
        }
      }
      
      const violationMessages = received.violations.map((violation: any) => 
        `${violation.id}: ${violation.description}`
      ).join('\n')
      
      return {
        pass: false,
        message: () => `Expected no accessibility violations, but found:\n${violationMessages}`,
      }
    },
  }),
}

// Form testing utilities
export const fillForm = async (form: HTMLFormElement, data: Record<string, string>) => {
  const { fireEvent } = await import('@testing-library/react')
  
  Object.entries(data).forEach(([name, value]) => {
    const input = form.querySelector(`[name="${name}"]`) as HTMLInputElement
    if (input) {
      fireEvent.change(input, { target: { value } })
    }
  })
}

export const submitForm = async (form: HTMLFormElement) => {
  const { fireEvent } = await import('@testing-library/react')
  fireEvent.submit(form)
}

// Wait utilities
export const waitForLoadingToFinish = async () => {
  const { waitForElementToBeRemoved, screen } = await import('@testing-library/react')
  
  try {
    await waitForElementToBeRemoved(() => screen.queryByText(/loading/i), {
      timeout: 3000,
    })
  } catch {
    // Loading element might not exist, which is fine
  }
}

// Mock localStorage
export const mockLocalStorage = () => {
  const store: Record<string, string> = {}
  
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value
    },
    removeItem: (key: string) => {
      delete store[key]
    },
    clear: () => {
      Object.keys(store).forEach(key => delete store[key])
    },
  }
}

// Setup mock localStorage
export const setupMockLocalStorage = () => {
  const mockStorage = mockLocalStorage()
  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    writable: true,
  })
  return mockStorage
}