import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { ChakraProvider } from '@chakra-ui/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import StartupDetailPage from './StartupDetailPage'

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

// Ensure matchMedia is properly mocked for Chakra UI's useMediaQuery
beforeEach(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  })
})

function createStartupResponse(lookingFor: unknown[], compensationType = 'equity') {
  return {
    startup: {
      id: 'test-startup-1',
      name: 'Test Startup',
      description: 'A test startup description',
      pitch: 'Our pitch for the startup',
      stage: 'seed',
      industry: 'Technology',
      location: 'San Francisco',
      website: 'https://example.com',
      createdAt: '2024-01-01T00:00:00Z',
      teamSize: 3,
      tags: ['React', 'AI'],
      lookingFor,
      compensationType,
      socialImpact: 'Helping communities',
      founder: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        avatar: '',
      },
      founderLinkedin: '',
      fundingAmount: 10000000,
    },
  }
}

function renderStartupDetailPage(startupId = 'test-startup-1') {
  return render(
    <MemoryRouter initialEntries={[`/startups/${startupId}`]}>
      <ChakraProvider>
        <HelmetProvider>
          <Routes>
            <Route path="/startups/:id" element={<StartupDetailPage />} />
          </Routes>
        </HelmetProvider>
      </ChakraProvider>
    </MemoryRouter>
  )
}

describe('StartupDetailPage - Role Display', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Rich role details rendering', () => {
    it('displays description from a rich role object', async () => {
      const lookingFor = [
        { title: 'CTO', description: 'Lead our technical vision and architecture', skills: ['React', 'Node.js'], commitment: 'Full-time' },
      ]

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse(lookingFor),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      // The role title should be displayed
      expect(screen.getByText('CTO')).toBeInTheDocument()
      // The rich description should be displayed (not the placeholder)
      expect(screen.getByText('Lead our technical vision and architecture')).toBeInTheDocument()
    })

    it('displays skills as badges for a rich role', async () => {
      const lookingFor = [
        { title: 'Frontend Developer', description: 'Build UI components', skills: ['Vue.js', 'GraphQL', 'Tailwind'], commitment: 'Part-time' },
      ]

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse(lookingFor),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      // Skills should be rendered as badges
      expect(screen.getByText('Vue.js')).toBeInTheDocument()
      expect(screen.getByText('GraphQL')).toBeInTheDocument()
      expect(screen.getByText('Tailwind')).toBeInTheDocument()
    })

    it('displays commitment level for a rich role', async () => {
      const lookingFor = [
        { title: 'Designer', description: 'Design the product', skills: ['Figma'], commitment: 'Contract' },
      ]

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse(lookingFor),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      // Commitment should be displayed
      expect(screen.getByText('Contract')).toBeInTheDocument()
    })
  })

  describe('Fallback to placeholder for plain string roles', () => {
    it('displays generic placeholder description for plain string roles', async () => {
      const lookingFor = ['Designer']

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse(lookingFor),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      // Plain string role should show placeholder description
      expect(screen.getByText('Looking for a Designer to join the team')).toBeInTheDocument()
    })

    it('displays fallback commitment based on compensationType for plain string roles', async () => {
      const lookingFor = ['Marketing Lead']

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse(lookingFor, 'paid'),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      // Should show compensation-based fallback
      expect(screen.getByText('Paid (Salary)')).toBeInTheDocument()
    })

    it('uses italic styling for placeholder descriptions (plain string roles)', async () => {
      const lookingFor = ['Backend Engineer']

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse(lookingFor),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      const placeholderText = screen.getByText('Looking for a Backend Engineer to join the team')
      expect(placeholderText).toHaveStyle({ fontStyle: 'italic' })
    })
  })

  describe('Mixed arrays handling', () => {
    it('renders both rich and plain roles correctly in a mixed array', async () => {
      const lookingFor = [
        'Designer',
        { title: 'CTO', description: 'Technical leadership role', skills: ['Python', 'AWS'], commitment: 'Full-time' },
        'Marketing Lead',
      ]

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse(lookingFor),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      // Plain string role gets placeholder
      expect(screen.getByText('Looking for a Designer to join the team')).toBeInTheDocument()
      // Rich role gets its actual description
      expect(screen.getByText('Technical leadership role')).toBeInTheDocument()
      // Another plain string role gets placeholder
      expect(screen.getByText('Looking for a Marketing Lead to join the team')).toBeInTheDocument()
      // Rich role skills are displayed
      expect(screen.getByText('Python')).toBeInTheDocument()
      expect(screen.getByText('AWS')).toBeInTheDocument()
    })

    it('visually distinguishes rich roles from plain roles', async () => {
      const lookingFor = [
        'Designer',
        { title: 'CTO', description: 'Lead tech', skills: ['Go'], commitment: 'Full-time' },
      ]

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse(lookingFor),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      // Rich role shows its actual description (not italic/placeholder)
      const richDescription = screen.getByText('Lead tech')
      expect(richDescription).not.toHaveStyle({ fontStyle: 'italic' })

      // Plain role shows placeholder in italic
      const plainDescription = screen.getByText('Looking for a Designer to join the team')
      expect(plainDescription).toHaveStyle({ fontStyle: 'italic' })
    })
  })

  describe('Null/invalid lookingFor data handling', () => {
    it('renders no open positions when lookingFor is null', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse(null as unknown as unknown[]),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      // Should not crash and should not render any position cards
      // The "Open Positions" heading should still be in the Opportunities tab
      expect(screen.queryByText(/Looking for a .* to join the team/)).not.toBeInTheDocument()
    })

    it('renders no open positions when lookingFor is an empty array', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => createStartupResponse([]),
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      // No position descriptions should be rendered
      expect(screen.queryByText(/Looking for a .* to join the team/)).not.toBeInTheDocument()
    })

    it('renders no open positions when lookingFor is undefined', async () => {
      const response = createStartupResponse([])
      // @ts-expect-error - testing undefined case
      delete response.startup.lookingFor

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: async () => response,
      } as Response)

      renderStartupDetailPage()

      await waitFor(() => {
        expect(screen.getByText('Test Startup')).toBeInTheDocument()
      })

      expect(screen.queryByText(/Looking for a .* to join the team/)).not.toBeInTheDocument()
    })
  })
})
