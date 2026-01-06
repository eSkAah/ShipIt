/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AcceptInvitationPage } from './accept';
import { invitationsService } from '../../services/invitations.service';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/invitations.service', () => ({
  invitationsService: {
    getInvitationByToken: vi.fn(),
    acceptInvitation: vi.fn(),
  },
}));

const mockSetCurrentOrganization = vi.fn();

vi.mock('../../contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

import { useAuth } from '../../contexts/auth-context';

describe('AcceptInvitationPage', () => {
  let queryClient: QueryClient;

  const mockInvitation = {
    id: 'inv-123',
    email: 'invited@example.com',
    role: 'member',
    organization: {
      id: 'org-123',
      name: 'Test Organization',
      slug: 'test-org',
    },
    expiresAt: new Date(Date.now() + 86400000),
  };

  const renderComponent = (token: string = 'valid-token') => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={[`/invitations/${token}/accept`]}>
          <Routes>
            <Route path="/invitations/:token/accept" element={<AcceptInvitationPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(invitationsService.getInvitationByToken).mockResolvedValue(mockInvitation);
  });

  describe('Loading state', () => {
    it('should show loading spinner while fetching invitation', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: true,
        setCurrentOrganization: mockSetCurrentOrganization,
        user: null,
        organizations: [],
        currentOrganization: null,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
      } as any);

      renderComponent();
      expect(screen.getByText('common.loading')).toBeInTheDocument();
    });

    it('should show loading spinner while auth is loading', () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: true,
        setCurrentOrganization: mockSetCurrentOrganization,
        user: null,
        organizations: [],
        currentOrganization: null,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
      } as any);

      renderComponent();
      expect(screen.getByText('common.loading')).toBeInTheDocument();
    });
  });

  describe('Invalid invitation', () => {
    it('should show error when token is invalid', async () => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        setCurrentOrganization: mockSetCurrentOrganization,
        user: { id: 'user-1', email: 'test@example.com' },
        organizations: [],
        currentOrganization: null,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
      } as any);

      vi.mocked(invitationsService.getInvitationByToken).mockRejectedValue(new Error('Not found'));

      renderComponent('invalid-token');

      await waitFor(() => {
        expect(screen.getByText('invitation.invalid')).toBeInTheDocument();
      });
      expect(screen.getByText('invitation.invalidDescription')).toBeInTheDocument();
      expect(screen.getByText('common.backToLogin')).toBeInTheDocument();
    });
  });

  describe('Not authenticated', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        isLoading: false,
        setCurrentOrganization: mockSetCurrentOrganization,
        user: null,
        organizations: [],
        currentOrganization: null,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
      } as any);
    });

    it('should show invitation details', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('invitation.title')).toBeInTheDocument();
      });
    });

    it('should show login required message', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('invitation.loginRequired')).toBeInTheDocument();
      });
    });

    it('should show login and signup buttons', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('common.login')).toBeInTheDocument();
        expect(screen.getByText('common.signup')).toBeInTheDocument();
      });
    });

    it('should have correct redirect links', async () => {
      renderComponent();

      await waitFor(() => {
        const loginLink = screen.getByText('common.login').closest('a');
        expect(loginLink).toHaveAttribute(
          'href',
          '/login?redirect=/invitations/valid-token/accept',
        );

        const signupLink = screen.getByText('common.signup').closest('a');
        expect(signupLink).toHaveAttribute(
          'href',
          `/signup?redirect=/invitations/valid-token/accept&email=${encodeURIComponent(mockInvitation.email)}`,
        );
      });
    });
  });

  describe('Authenticated user', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        isLoading: false,
        setCurrentOrganization: mockSetCurrentOrganization,
        user: { id: 'user-1', email: 'invited@example.com' },
        organizations: [],
        currentOrganization: null,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
      } as any);
    });

    it('should show invitation details', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('invitation.title')).toBeInTheDocument();
      });
    });

    it('should show organization initial as avatar', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('T')).toBeInTheDocument();
      });
    });

    it('should show accept and decline buttons', async () => {
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('invitation.accept')).toBeInTheDocument();
        expect(screen.getByText('invitation.decline')).toBeInTheDocument();
      });
    });

    it('should call acceptInvitation when clicking accept', async () => {
      vi.mocked(invitationsService.acceptInvitation).mockResolvedValue({
        organization: mockInvitation.organization,
        role: 'member',
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('invitation.accept')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('invitation.accept'));

      await waitFor(() => {
        expect(invitationsService.acceptInvitation).toHaveBeenCalledWith('valid-token');
      });
    });

    it('should set current organization and navigate after accepting', async () => {
      vi.mocked(invitationsService.acceptInvitation).mockResolvedValue({
        organization: mockInvitation.organization,
        role: 'member',
        membershipId: 'membership-123',
      } as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('invitation.accept')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('invitation.accept'));

      await waitFor(() => {
        expect(mockSetCurrentOrganization).toHaveBeenCalledWith({
          ...mockInvitation.organization,
          role: 'member',
          membershipId: 'membership-123',
        });
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });

    it('should show error message when accept fails', async () => {
      vi.mocked(invitationsService.acceptInvitation).mockRejectedValue(new Error('Accept failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('invitation.accept')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('invitation.accept'));

      await waitFor(() => {
        expect(screen.getByText('Accept failed')).toBeInTheDocument();
      });
    });

    it('should show loading state while accepting', async () => {
      let resolvePromise: (value: any) => void;
      const promise = new Promise((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(invitationsService.acceptInvitation).mockReturnValue(promise as any);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText('invitation.accept')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('invitation.accept'));

      await waitFor(() => {
        const acceptButton = screen.getByRole('button', { name: /invitation.accept/i });
        expect(acceptButton).toBeDisabled();
      });

      // Clean up
      resolvePromise!({
        organization: mockInvitation.organization,
        role: 'member',
        membershipId: 'membership-123',
      });
    });

    it('should have decline link to dashboard', async () => {
      renderComponent();

      await waitFor(() => {
        const declineLink = screen.getByText('invitation.decline').closest('a');
        expect(declineLink).toHaveAttribute('href', '/dashboard');
      });
    });
  });
});
