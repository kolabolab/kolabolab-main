import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { theme } from '../theme';
import { useAuthStore } from '../hooks/useAuth';
import OnboardingPage from './OnboardingPage';

/**
 * Unit tests for OnboardingPage
 *
 * **Validates: Requirements 1.4, 1.5, 3.4, 5.1**
 */

// Mock apiClient
vi.mock('../services/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

import { apiClient } from '../services/apiClient';

const mockTokens = {
  accessToken: 'mock-access-token',
  refreshToken: 'mock-refresh-token',
};

const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
  username: 'testuser',
  firstName: 'Test',
  lastName: 'User',
  roles: [],
  isEmailVerified: true,
  onboardingCompleted: false,
};

function renderOnboardingPage() {
  return render(
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <MemoryRouter initialEntries={['/onboarding']}>
          <Routes>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/dashboard" element={<div data-testid="dashboard-page">Dashboard</div>} />
          </Routes>
        </MemoryRouter>
      </ChakraProvider>
    </HelmetProvider>
  );
}

describe('OnboardingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setAuth(mockUser as any, mockTokens);
  });

  describe('Rendering (Req 1.4, 1.5)', () => {
    it('displays the heading "What brings you to KolaboLab?"', () => {
      renderOnboardingPage();

      expect(
        screen.getByRole('heading', { name: /what brings you to kolabolab/i })
      ).toBeInTheDocument();
    });

    it('renders three role cards with titles and descriptions', () => {
      renderOnboardingPage();

      expect(screen.getByText('Entrepreneur')).toBeInTheDocument();
      expect(screen.getByText('I want to create and grow a startup')).toBeInTheDocument();

      expect(screen.getByText('Collaborator')).toBeInTheDocument();
      expect(screen.getByText('I have skills and want to join a startup team')).toBeInTheDocument();

      expect(screen.getByText('Investor')).toBeInTheDocument();
      expect(screen.getByText('I want to discover and invest in startups')).toBeInTheDocument();
    });

    it('renders a Continue button that is initially disabled', () => {
      renderOnboardingPage();

      const button = screen.getByRole('button', { name: /continue/i });
      expect(button).toBeInTheDocument();
      expect(button).toBeDisabled();
    });
  });

  describe('Error handling (Req 3.4)', () => {
    it('displays error message on API failure with retry button', async () => {
      const user = userEvent.setup();
      const mockPost = vi.mocked(apiClient.post);
      mockPost.mockRejectedValueOnce(new Error('Network error'));

      renderOnboardingPage();

      // Select a role to enable the Continue button
      await user.click(screen.getByText('Entrepreneur'));

      // Click Continue
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Wait for error to appear
      await waitFor(() => {
        expect(screen.getByText('Network error')).toBeInTheDocument();
      });

      // Verify retry button is present
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    });

    it('retries the API call when clicking Try Again', async () => {
      const user = userEvent.setup();
      const mockPost = vi.mocked(apiClient.post);
      mockPost.mockRejectedValueOnce(new Error('Network error'));
      mockPost.mockResolvedValueOnce({
        data: {
          user: {
            ...mockUser,
            roles: ['entrepreneur'],
            onboardingCompleted: true,
          },
        },
      });

      renderOnboardingPage();

      // Select a role and submit
      await user.click(screen.getByText('Entrepreneur'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Wait for error
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      });

      // Click retry
      await user.click(screen.getByRole('button', { name: /try again/i }));

      // Should navigate to dashboard on success
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });
  });

  describe('Successful submission (Req 5.1)', () => {
    it('navigates to /dashboard on successful submission', async () => {
      const user = userEvent.setup();
      const mockPost = vi.mocked(apiClient.post);
      mockPost.mockResolvedValueOnce({
        data: {
          user: {
            ...mockUser,
            roles: ['collaborator'],
            onboardingCompleted: true,
          },
        },
      });

      renderOnboardingPage();

      // Select a role
      await user.click(screen.getByText('Collaborator'));

      // Click Continue
      await user.click(screen.getByRole('button', { name: /continue/i }));

      // Should navigate to /dashboard
      await waitFor(() => {
        expect(screen.getByTestId('dashboard-page')).toBeInTheDocument();
      });
    });

    it('calls the API with selected roles', async () => {
      const user = userEvent.setup();
      const mockPost = vi.mocked(apiClient.post);
      mockPost.mockResolvedValueOnce({
        data: {
          user: {
            ...mockUser,
            roles: ['entrepreneur', 'investor'],
            onboardingCompleted: true,
          },
        },
      });

      renderOnboardingPage();

      // Select multiple roles
      await user.click(screen.getByText('Entrepreneur'));
      await user.click(screen.getByText('Investor'));

      // Click Continue
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        expect(mockPost).toHaveBeenCalledWith('/api/onboarding/complete', {
          roles: ['entrepreneur', 'investor'],
        });
      });
    });

    it('updates the auth store with new roles and onboardingCompleted', async () => {
      const user = userEvent.setup();
      const mockPost = vi.mocked(apiClient.post);
      mockPost.mockResolvedValueOnce({
        data: {
          user: {
            ...mockUser,
            roles: ['entrepreneur'],
            onboardingCompleted: true,
          },
        },
      });

      renderOnboardingPage();

      await user.click(screen.getByText('Entrepreneur'));
      await user.click(screen.getByRole('button', { name: /continue/i }));

      await waitFor(() => {
        const storeUser = useAuthStore.getState().user;
        expect(storeUser?.roles).toEqual(['entrepreneur']);
        expect(storeUser?.onboardingCompleted).toBe(true);
      });
    });
  });
});
