/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TeamSettingsPage } from './team';
import { organizationsService } from '../../services/organizations.service';
import { invitationsService } from '../../services/invitations.service';
import { toast } from 'sonner';

vi.mock('../../services/organizations.service', () => ({
  organizationsService: {
    getMembers: vi.fn(),
    updateMemberRole: vi.fn(),
    removeMember: vi.fn(),
  },
}));

vi.mock('../../services/invitations.service', () => ({
  invitationsService: {
    getInvitations: vi.fn(),
    createInvitation: vi.fn(),
    cancelInvitation: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock('../../contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/layouts/dashboard-layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

vi.mock('../../components/settings/member-list', () => ({
  MemberList: ({ members, isLoading }: { members: any[]; isLoading: boolean }) => (
    <div data-testid="member-list">{isLoading ? 'Loading...' : `Members: ${members.length}`}</div>
  ),
}));

vi.mock('../../components/settings/invite-member-dialog', () => ({
  InviteMemberDialog: ({
    isOpen,
    onClose,
    onInvite,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onInvite: (email: string, role: string) => Promise<void>;
  }) =>
    isOpen ? (
      <div data-testid="invite-dialog">
        <button onClick={onClose}>Close</button>
        <button onClick={() => onInvite('test@example.com', 'member').catch(() => {})}>
          Invite
        </button>
      </div>
    ) : null,
}));

import { useAuth } from '../../contexts/auth-context';

describe('TeamSettingsPage', () => {
  let queryClient: QueryClient;

  const mockMembers = [
    {
      id: 'm-1',
      userId: 'user-1',
      role: 'admin',
      user: { id: 'user-1', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' },
    },
    {
      id: 'm-2',
      userId: 'user-2',
      role: 'member',
      user: { id: 'user-2', email: 'member@test.com', firstName: 'Member', lastName: 'User' },
    },
  ];

  const mockInvitations = [
    {
      id: 'inv-1',
      email: 'invited1@test.com',
      role: 'member',
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
    {
      id: 'inv-2',
      email: 'invited2@test.com',
      role: 'admin',
      status: 'pending',
      expiresAt: new Date(Date.now() + 86400000).toISOString(),
    },
  ];

  const renderComponent = () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <TeamSettingsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(organizationsService.getMembers).mockResolvedValue(mockMembers);
    vi.mocked(invitationsService.getInvitations).mockResolvedValue(mockInvitations);
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 'user-1', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' },
      currentOrganization: {
        id: 'org-1',
        name: 'Test Org',
        slug: 'test-org',
        role: 'admin',
        membershipId: 'm-1',
      },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refetchUser: vi.fn(),
      organizations: [],
      setCurrentOrganization: vi.fn(),
    } as any);
  });

  describe('Admin view', () => {
    it('should display page title and description', async () => {
      renderComponent();
      expect(screen.getByText('settings.team.title')).toBeInTheDocument();
      expect(screen.getByText('settings.team.description')).toBeInTheDocument();
    });

    it('should display invite button for admin', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('settings.team.inviteButton')).toBeInTheDocument();
      });
    });

    it('should fetch and display members', async () => {
      renderComponent();
      await waitFor(() => {
        expect(organizationsService.getMembers).toHaveBeenCalledWith('org-1');
      });
      await waitFor(() => {
        expect(screen.getByTestId('member-list')).toHaveTextContent('Members: 2');
      });
    });

    it('should fetch and display pending invitations', async () => {
      renderComponent();
      await waitFor(() => {
        expect(invitationsService.getInvitations).toHaveBeenCalledWith('org-1');
      });
      await waitFor(() => {
        expect(screen.getByText(/settings\.team\.pendingInvitations/)).toBeInTheDocument();
      });
      expect(screen.getByText('invited1@test.com')).toBeInTheDocument();
      expect(screen.getByText('invited2@test.com')).toBeInTheDocument();
    });

    it('should display invitation roles', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText(/settings.team.role.member/)).toBeInTheDocument();
        expect(screen.getByText(/settings.team.role.admin/)).toBeInTheDocument();
      });
    });

    it('should show no invitations message when list is empty', async () => {
      vi.mocked(invitationsService.getInvitations).mockResolvedValue([]);
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('settings.team.noInvitations')).toBeInTheDocument();
      });
    });

    it('should open invite dialog when clicking invite button', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('settings.team.inviteButton')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('settings.team.inviteButton'));

      expect(screen.getByTestId('invite-dialog')).toBeInTheDocument();
    });

    it('should close invite dialog when clicking close', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('settings.team.inviteButton')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('settings.team.inviteButton'));
      expect(screen.getByTestId('invite-dialog')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Close'));
      expect(screen.queryByTestId('invite-dialog')).not.toBeInTheDocument();
    });

    it('should show cancel invitation button', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.getAllByText('settings.team.cancelInvite')).toHaveLength(2);
      });
    });
  });

  describe('Non-admin view', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        user: { id: 'user-2', email: 'member@test.com', firstName: 'Member', lastName: 'User' },
        currentOrganization: {
          id: 'org-1',
          name: 'Test Org',
          slug: 'test-org',
          role: 'member',
          membershipId: 'm-2',
        },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
        organizations: [],
        setCurrentOrganization: vi.fn(),
      } as any);
    });

    it('should hide invite button for non-admin', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.queryByText('settings.team.inviteButton')).not.toBeInTheDocument();
      });
    });

    it('should hide pending invitations section for non-admin', async () => {
      renderComponent();
      await waitFor(() => {
        expect(screen.queryByText('settings.team.pendingInvitations')).not.toBeInTheDocument();
      });
    });

    it('should still fetch and display members', async () => {
      renderComponent();
      await waitFor(() => {
        expect(organizationsService.getMembers).toHaveBeenCalledWith('org-1');
      });
      await waitFor(() => {
        expect(screen.getByTestId('member-list')).toHaveTextContent('Members: 2');
      });
    });
  });

  describe('Mutations', () => {
    it('should show success toast when invite is sent', async () => {
      vi.mocked(invitationsService.createInvitation).mockResolvedValue({
        id: 'new-inv',
        email: 'test@example.com',
        role: 'member',
      } as any);

      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('settings.team.inviteButton')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('settings.team.inviteButton'));
      fireEvent.click(screen.getByText('Invite'));

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('settings.team.inviteSent');
      });
    });

    it('should show error toast when invite fails', async () => {
      vi.mocked(invitationsService.createInvitation).mockRejectedValue(new Error('Failed'));

      renderComponent();
      await waitFor(() => {
        expect(screen.getByText('settings.team.inviteButton')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('settings.team.inviteButton'));
      fireEvent.click(screen.getByText('Invite'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('settings.team.inviteError');
      });
    });
  });
});
