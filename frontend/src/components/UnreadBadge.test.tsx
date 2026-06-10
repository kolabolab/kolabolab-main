import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { UnreadBadge } from './UnreadBadge'

vi.mock('../hooks/useMessages', () => ({
  useMessageUnreadCount: vi.fn(),
}))

import { useMessageUnreadCount } from '../hooks/useMessages'
const mockUseMessageUnreadCount = vi.mocked(useMessageUnreadCount)

function createTestWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return ({ children }: { children: React.ReactNode }) => (
    <ChakraProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ChakraProvider>
  )
}

describe('UnreadBadge', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders nothing when unread count is 0', () => {
    mockUseMessageUnreadCount.mockReturnValue({ data: { unreadCount: 0 } } as any)

    render(<UnreadBadge />, { wrapper: createTestWrapper() })

    expect(screen.queryByTestId('unread-badge')).toBeNull()
  })

  it('renders nothing when data is undefined (loading state)', () => {
    mockUseMessageUnreadCount.mockReturnValue({ data: undefined } as any)

    render(<UnreadBadge />, { wrapper: createTestWrapper() })

    expect(screen.queryByTestId('unread-badge')).toBeNull()
  })

  it('renders badge with unread count when count > 0', () => {
    mockUseMessageUnreadCount.mockReturnValue({ data: { unreadCount: 5 } } as any)

    render(<UnreadBadge />, { wrapper: createTestWrapper() })

    const badge = screen.getByTestId('unread-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('5')
  })

  it('displays "99+" when unread count exceeds 99', () => {
    mockUseMessageUnreadCount.mockReturnValue({ data: { unreadCount: 150 } } as any)

    render(<UnreadBadge />, { wrapper: createTestWrapper() })

    const badge = screen.getByTestId('unread-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('99+')
  })

  it('displays exact count of 99', () => {
    mockUseMessageUnreadCount.mockReturnValue({ data: { unreadCount: 99 } } as any)

    render(<UnreadBadge />, { wrapper: createTestWrapper() })

    const badge = screen.getByTestId('unread-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('99')
  })

  it('displays count of 1', () => {
    mockUseMessageUnreadCount.mockReturnValue({ data: { unreadCount: 1 } } as any)

    render(<UnreadBadge />, { wrapper: createTestWrapper() })

    const badge = screen.getByTestId('unread-badge')
    expect(badge).toBeInTheDocument()
    expect(badge).toHaveTextContent('1')
  })

  it('has accessible label with unread count', () => {
    mockUseMessageUnreadCount.mockReturnValue({ data: { unreadCount: 7 } } as any)

    render(<UnreadBadge />, { wrapper: createTestWrapper() })

    const badge = screen.getByLabelText('7 unread messages')
    expect(badge).toBeInTheDocument()
  })
})
