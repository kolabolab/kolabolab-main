import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChakraProvider } from '@chakra-ui/react'
import { ErrorState } from './ErrorState'

function renderWithChakra(ui: React.ReactElement) {
  return render(<ChakraProvider>{ui}</ChakraProvider>)
}

describe('ErrorState', () => {
  it('displays the error message', () => {
    renderWithChakra(<ErrorState error="Network error occurred" onRetry={() => {}} />)

    expect(screen.getByText('Failed to load data')).toBeInTheDocument()
    expect(screen.getByText('Network error occurred')).toBeInTheDocument()
  })

  it('renders a Retry button', () => {
    renderWithChakra(<ErrorState error="Something went wrong" onRetry={() => {}} />)

    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument()
  })

  it('calls onRetry when the Retry button is clicked', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()

    renderWithChakra(<ErrorState error="Failed to fetch" onRetry={onRetry} />)

    await user.click(screen.getByRole('button', { name: /retry/i }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('renders with error alert status', () => {
    renderWithChakra(<ErrorState error="Server error" onRetry={() => {}} />)

    const alert = screen.getByRole('alert')
    expect(alert).toBeInTheDocument()
  })
})
