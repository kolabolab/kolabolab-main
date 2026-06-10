import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChakraProvider } from '@chakra-ui/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { theme } from '../../theme';
import { useAuthStore } from '../../hooks/useAuth';
import ProfilePage from './ProfilePage';

/**
 * Unit tests for ProfilePage role editing
 *
 * **Validates: Requirements 6.1, 6.2, 6.3**
 */

// Mock apiClient
vi.mock('../../services/apiClient', () => ({
  apiClient: {
    put: vi.fn(),
  },
}));

import { apiClient } from '../../services/apiClient';

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
  roles: ['entrepreneur', 'collaborator'],
  avatar: '',
  bio: '',
  company: '',
  location: '',
  isEmailVerified: true,
  onboardingCompleted: true,
};

function renderProfilePage() {
  return render(
    <HelmetProvider>
      <ChakraProvider theme={theme}>
        <MemoryRouter initialEntries={['/profile']}>
          <ProfilePage />
        </MemoryRouter>
      </ChakraProvider>
    </HelmetProvider>
  );
}

describe('ProfilePage - Role Editing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().setAuth(mockUser as any, mockTokens);
  });

  describe('Current roles are displayed and editable (Req 6.1)', () => {
    it('displays the "Your Roles" section heading', () => {
      renderProfilePage();

      expect(screen.getByText('Your Roles')).toBeInTheDocument();
    });

    it('displays the RoleSelector with current user roles pre-selected', () => {
      renderProfilePage();

      // The role cards should be rendered with aria-pressed for selected roles
      const entrepreneurButton = screen.getByRole('button', {
        name: /entrepreneur/i,
      });
      const collaboratorButton = screen.getByRole('button', {
        name: /collaborator/i,
      });
      const investorButton = screen.getByRole('button', {
        name: /investor/i,
      });

      expect(entrepreneurButton).toHaveAttribute('aria-pressed', 'true');
      expect(collaboratorButton).toHaveAttribute('aria-pressed', 'true');
      expect(investorButton).toHaveAttribute('aria-pressed', 'false');
    });

    it('allows toggling a role selection', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      const investorButton = screen.getByRole('button', {
        name: /investor/i,
      });

      // Initially not selected
      expect(investorButton).toHaveAttribute('aria-pressed', 'false');

      // Click to select
      await user.click(investorButton);

      // Now selected
      expect(investorButton).toHaveAttribute('aria-pressed', 'true');
    });

    it('disables the Save button when roles have not changed', () => {
      renderProfilePage();

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).toBeDisabled();
    });

    it('enables the Save button when roles have changed', async () => {
      const user = userEvent.setup();
      renderProfilePage();

      // Toggle investor to change roles
      await user.click(
        screen.getByRole('button', { name: /investor/i })
      );

      const saveButton = screen.getByRole('button', { name: /save/i });
      expect(saveButton).not.toBeDisabled();
    });
  });

  describe('Save triggers API call and updates store (Req 6.2, 6.3)', () => {
    it('calls PUT /api/user/roles with updated roles on save', async () => {
      const user = userEvent.setup();
      const mockPut = vi.mocked(apiClient.put);
      mockPut.mockResolvedValueOnce({
        data: {
          message: 'Roles updated',
          roles: ['entrepreneur', 'collaborator', 'investor'],
        },
      });

      renderProfilePage();

      // Add investor role
      await user.click(
        screen.getByRole('button', { name: /investor/i })
      );

      // Click Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(mockPut).toHaveBeenCalledWith('/api/user/roles', {
          roles: expect.arrayContaining(['entrepreneur', 'collaborator', 'investor']),
        });
      });
    });

    it('updates the auth store with new roles after successful save', async () => {
      const user = userEvent.setup();
      const mockPut = vi.mocked(apiClient.put);
      mockPut.mockResolvedValueOnce({
        data: {
          message: 'Roles updated',
          roles: ['entrepreneur', 'collaborator', 'investor'],
        },
      });

      renderProfilePage();

      // Add investor role
      await user.click(
        screen.getByRole('button', { name: /investor/i })
      );

      // Click Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        const storeUser = useAuthStore.getState().user;
        expect(storeUser?.roles).toEqual(['entrepreneur', 'collaborator', 'investor']);
      });
    });

    it('shows a success toast after successful save', async () => {
      const user = userEvent.setup();
      const mockPut = vi.mocked(apiClient.put);
      mockPut.mockResolvedValueOnce({
        data: {
          message: 'Roles updated',
          roles: ['entrepreneur', 'investor'],
        },
      });

      renderProfilePage();

      // Remove collaborator role
      await user.click(
        screen.getByRole('button', { name: /collaborator/i })
      );

      // Click Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText('Roles Updated')).toBeInTheDocument();
      });
    });
  });

  describe('Error handling reverts UI state (Req 6.1, 6.2)', () => {
    it('reverts selectedRoles to previous state on API error', async () => {
      const user = userEvent.setup();
      const mockPut = vi.mocked(apiClient.put);
      mockPut.mockRejectedValueOnce(new Error('Network error'));

      renderProfilePage();

      // Add investor role
      const investorButton = screen.getByRole('button', {
        name: /investor/i,
      });
      await user.click(investorButton);

      // Verify investor is now selected
      expect(investorButton).toHaveAttribute('aria-pressed', 'true');

      // Click Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      // After error, investor should be reverted to unselected
      await waitFor(() => {
        expect(investorButton).toHaveAttribute('aria-pressed', 'false');
      });
    });

    it('shows an error toast on API failure', async () => {
      const user = userEvent.setup();
      const mockPut = vi.mocked(apiClient.put);
      mockPut.mockRejectedValueOnce(new Error('Server error'));

      renderProfilePage();

      // Change roles
      await user.click(
        screen.getByRole('button', { name: /investor/i })
      );

      // Click Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        expect(screen.getByText('Update Failed')).toBeInTheDocument();
      });
    });

    it('does not update the auth store on API error', async () => {
      const user = userEvent.setup();
      const mockPut = vi.mocked(apiClient.put);
      mockPut.mockRejectedValueOnce(new Error('Network error'));

      renderProfilePage();

      // Add investor role
      await user.click(
        screen.getByRole('button', { name: /investor/i })
      );

      // Click Save
      await user.click(screen.getByRole('button', { name: /save/i }));

      await waitFor(() => {
        const storeUser = useAuthStore.getState().user;
        // Should still have original roles
        expect(storeUser?.roles).toEqual(['entrepreneur', 'collaborator']);
      });
    });
  });
});
