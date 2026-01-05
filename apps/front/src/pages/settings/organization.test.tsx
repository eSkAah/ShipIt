/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrganizationSettingsPage } from './organization';
import { organizationsService } from '../../services/organizations.service';
import { toast } from 'sonner';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../services/organizations.service', () => ({
  organizationsService: {
    updateOrganization: vi.fn(),
    deleteOrganization: vi.fn(),
    leaveOrganization: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const mockSetCurrentOrganization = vi.fn();
const mockOrganizationsAdmin = [
  {
    id: 'org-1',
    name: 'Organization One',
    slug: 'org-one',
    role: 'admin',
    membershipId: 'm-1',
  },
  {
    id: 'org-2',
    name: 'Organization Two',
    slug: 'org-two',
    role: 'member',
    membershipId: 'm-2',
  },
];

const mockOrganizationsMember = [
  {
    id: 'org-1',
    name: 'Organization One',
    slug: 'org-one',
    role: 'member',
    membershipId: 'm-1',
  },
  {
    id: 'org-2',
    name: 'Organization Two',
    slug: 'org-two',
    role: 'admin',
    membershipId: 'm-2',
  },
];

vi.mock('../../contexts/auth-context', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../components/layouts/dashboard-layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

import { useAuth } from '../../contexts/auth-context';

describe('OrganizationSettingsPage', () => {
  let queryClient: QueryClient;

  const renderComponent = () => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <OrganizationSettingsPage />
        </BrowserRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue({
      currentOrganization: mockOrganizationsAdmin[0],
      organizations: mockOrganizationsAdmin,
      setCurrentOrganization: mockSetCurrentOrganization,
      user: { id: 'user-1', email: 'test@test.com', firstName: 'Test', lastName: 'User' },
      isAuthenticated: true,
      isLoading: false,
      login: vi.fn(),
      logout: vi.fn(),
      refetchUser: vi.fn(),
    } as any);
  });

  describe('Admin view', () => {
    it('should display page title and description', () => {
      renderComponent();
      expect(screen.getByText('settings.organization.title')).toBeInTheDocument();
      expect(screen.getByText('settings.organization.description')).toBeInTheDocument();
    });

    it('should display update form for admin users', () => {
      renderComponent();
      expect(screen.getByText('settings.organization.general')).toBeInTheDocument();
      expect(screen.getByLabelText('settings.organization.name')).toBeInTheDocument();
    });

    it('should populate form with current organization name', () => {
      renderComponent();
      const input = screen.getByLabelText('settings.organization.name') as HTMLInputElement;
      expect(input.value).toBe('Organization One');
    });

    it('should disable save button when form is not dirty', () => {
      renderComponent();
      const saveButton = screen.getByText('common.save');
      expect(saveButton).toBeDisabled();
    });

    it('should enable save button when form is dirty', async () => {
      renderComponent();
      const input = screen.getByLabelText('settings.organization.name');
      await userEvent.clear(input);
      await userEvent.type(input, 'New Name');

      const saveButton = screen.getByText('common.save');
      expect(saveButton).not.toBeDisabled();
    });

    it('should call updateOrganization on valid submit', async () => {
      vi.mocked(organizationsService.updateOrganization).mockResolvedValue({
        id: 'org-1',
        name: 'New Name',
        slug: 'new-name',
      } as any);

      renderComponent();
      const input = screen.getByLabelText('settings.organization.name');
      await userEvent.clear(input);
      await userEvent.type(input, 'New Name');

      const saveButton = screen.getByText('common.save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(organizationsService.updateOrganization).toHaveBeenCalledWith('org-1', {
          name: 'New Name',
        });
      });
    });

    it('should show success toast on successful update', async () => {
      vi.mocked(organizationsService.updateOrganization).mockResolvedValue({
        id: 'org-1',
        name: 'New Name',
        slug: 'new-name',
      } as any);

      renderComponent();
      const input = screen.getByLabelText('settings.organization.name');
      await userEvent.clear(input);
      await userEvent.type(input, 'New Name');

      const saveButton = screen.getByText('common.save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('settings.organization.updateSuccess');
      });
    });

    it('should show error toast on update failure', async () => {
      vi.mocked(organizationsService.updateOrganization).mockRejectedValue(
        new Error('Update failed'),
      );

      renderComponent();
      const input = screen.getByLabelText('settings.organization.name');
      await userEvent.clear(input);
      await userEvent.type(input, 'New Name');

      const saveButton = screen.getByText('common.save');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('settings.organization.updateError');
      });
    });
  });

  describe('Non-admin view', () => {
    beforeEach(() => {
      vi.mocked(useAuth).mockReturnValue({
        currentOrganization: mockOrganizationsMember[0],
        organizations: mockOrganizationsMember,
        setCurrentOrganization: mockSetCurrentOrganization,
        user: { id: 'user-1', email: 'test@test.com', firstName: 'Test', lastName: 'User' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
      } as any);
    });

    it('should hide update form for non-admin users', () => {
      renderComponent();
      expect(screen.queryByText('settings.organization.general')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('settings.organization.name')).not.toBeInTheDocument();
    });
  });

  describe('Danger Zone', () => {
    it('should display danger zone section', () => {
      renderComponent();
      expect(screen.getByText('settings.organization.dangerZone')).toBeInTheDocument();
    });

    it('should show delete option when user is admin and has multiple orgs', () => {
      renderComponent();
      expect(screen.getByText('settings.organization.deleteTitle')).toBeInTheDocument();
    });

    it('should show leave option when user is not admin and has multiple orgs', () => {
      vi.mocked(useAuth).mockReturnValue({
        currentOrganization: mockOrganizationsMember[0],
        organizations: mockOrganizationsMember,
        setCurrentOrganization: mockSetCurrentOrganization,
        user: { id: 'user-1' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
      } as any);

      renderComponent();
      expect(screen.getByText('settings.organization.leaveTitle')).toBeInTheDocument();
    });

    it('should show message when cannot delete or leave (only one org)', () => {
      vi.mocked(useAuth).mockReturnValue({
        currentOrganization: mockOrganizationsAdmin[0],
        organizations: [mockOrganizationsAdmin[0]],
        setCurrentOrganization: mockSetCurrentOrganization,
        user: { id: 'user-1' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
      } as any);

      renderComponent();
      expect(screen.getByText('settings.organization.cannotDelete')).toBeInTheDocument();
    });

    it('should show confirmation buttons when clicking delete', async () => {
      renderComponent();

      const deleteButton = screen.getByText('settings.organization.delete');
      fireEvent.click(deleteButton);

      expect(screen.getByText('common.cancel')).toBeInTheDocument();
      expect(screen.getByText('settings.organization.confirmDelete')).toBeInTheDocument();
    });

    it('should hide confirmation when clicking cancel', async () => {
      renderComponent();

      const deleteButton = screen.getByText('settings.organization.delete');
      fireEvent.click(deleteButton);

      const cancelButton = screen.getByText('common.cancel');
      fireEvent.click(cancelButton);

      expect(screen.queryByText('settings.organization.confirmDelete')).not.toBeInTheDocument();
    });

    it('should call deleteOrganization when confirming delete', async () => {
      vi.mocked(organizationsService.deleteOrganization).mockResolvedValue(undefined);

      renderComponent();

      const deleteButton = screen.getByText('settings.organization.delete');
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText('settings.organization.confirmDelete');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(organizationsService.deleteOrganization).toHaveBeenCalledWith('org-1');
      });
    });

    it('should navigate to dashboard after successful delete', async () => {
      vi.mocked(organizationsService.deleteOrganization).mockResolvedValue(undefined);

      renderComponent();

      const deleteButton = screen.getByText('settings.organization.delete');
      fireEvent.click(deleteButton);

      const confirmButton = screen.getByText('settings.organization.confirmDelete');
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
      });
    });
  });

  describe('Organization switch reset', () => {
    it('should reset form when organization changes', async () => {
      const { rerender } = renderComponent();

      const input = screen.getByLabelText('settings.organization.name') as HTMLInputElement;
      expect(input.value).toBe('Organization One');

      // Simulate organization change
      vi.mocked(useAuth).mockReturnValue({
        currentOrganization: {
          ...mockOrganizationsAdmin[1],
          role: 'admin',
        },
        organizations: mockOrganizationsAdmin,
        setCurrentOrganization: mockSetCurrentOrganization,
        user: { id: 'user-1' },
        isAuthenticated: true,
        isLoading: false,
        login: vi.fn(),
        logout: vi.fn(),
        refetchUser: vi.fn(),
      } as any);

      rerender(
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <OrganizationSettingsPage />
          </BrowserRouter>
        </QueryClientProvider>,
      );

      await waitFor(() => {
        const updatedInput = screen.getByLabelText(
          'settings.organization.name',
        ) as HTMLInputElement;
        expect(updatedInput.value).toBe('Organization Two');
      });
    });
  });
});
