import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CreateOrganizationDialog } from './create-organization-dialog';
import {
  organizationsService,
  OrganizationWithMembership,
} from '../../services/organizations.service';
import { toast } from 'sonner';

vi.mock('../../services/organizations.service', () => ({
  organizationsService: {
    createOrganization: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('CreateOrganizationDialog', () => {
  const mockOnClose = vi.fn();
  const mockOnCreated = vi.fn();
  let queryClient: QueryClient;

  const mockCreatedOrg: OrganizationWithMembership = {
    id: 'new-org-123',
    name: 'New Organization',
    slug: 'new-organization',
    role: 'admin',
    membershipId: 'm-new',
    stripeCustomerId: null,
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    trialEndsAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const renderComponent = (isOpen: boolean = true) => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <CreateOrganizationDialog isOpen={isOpen} onClose={mockOnClose} onCreated={mockOnCreated} />
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should not render when isOpen is false', () => {
    renderComponent(false);
    expect(screen.queryByText('settings.organization.createNew')).not.toBeInTheDocument();
  });

  it('should render form when isOpen is true', () => {
    renderComponent(true);
    expect(screen.getByText('settings.organization.createNew')).toBeInTheDocument();
    expect(screen.getByLabelText('settings.organization.newName')).toBeInTheDocument();
  });

  it('should display cancel and create buttons', () => {
    renderComponent();
    expect(screen.getByText('common.cancel')).toBeInTheDocument();
    expect(screen.getByText('settings.organization.create')).toBeInTheDocument();
  });

  it('should close dialog when clicking cancel', () => {
    renderComponent();

    const cancelButton = screen.getByText('common.cancel');
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close dialog when clicking backdrop', () => {
    renderComponent();

    const backdrop = document.querySelector('.bg-black\\/50');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should close dialog when clicking close button', () => {
    renderComponent();

    const buttons = screen.getAllByRole('button');
    const closeBtn = buttons.find((btn) => btn.querySelector('svg') && !btn.textContent);
    if (closeBtn) {
      fireEvent.click(closeBtn);
    }

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should show validation error when name is empty', async () => {
    renderComponent();

    const createButton = screen.getByText('settings.organization.create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/required|name/i)).toBeInTheDocument();
    });
  });

  it('should call createOrganization on valid submit', async () => {
    vi.mocked(organizationsService.createOrganization).mockResolvedValue(mockCreatedOrg);

    renderComponent();

    const input = screen.getByLabelText('settings.organization.newName');
    await userEvent.type(input, 'New Organization');

    const createButton = screen.getByText('settings.organization.create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(organizationsService.createOrganization).toHaveBeenCalledWith('New Organization');
    });
  });

  it('should show success toast and call onCreated on successful creation', async () => {
    vi.mocked(organizationsService.createOrganization).mockResolvedValue(mockCreatedOrg);

    renderComponent();

    const input = screen.getByLabelText('settings.organization.newName');
    await userEvent.type(input, 'New Organization');

    const createButton = screen.getByText('settings.organization.create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('settings.organization.createSuccess');
    });

    expect(mockOnCreated).toHaveBeenCalledWith(mockCreatedOrg);
  });

  it('should show error toast on creation failure', async () => {
    vi.mocked(organizationsService.createOrganization).mockRejectedValue(
      new Error('Creation failed'),
    );

    renderComponent();

    const input = screen.getByLabelText('settings.organization.newName');
    await userEvent.type(input, 'New Organization');

    const createButton = screen.getByText('settings.organization.create');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('settings.organization.createError');
    });
  });

  it('should reset form when dialog closes', async () => {
    renderComponent();

    const input = screen.getByLabelText('settings.organization.newName') as HTMLInputElement;
    await userEvent.type(input, 'Test Organization');

    expect(input.value).toBe('Test Organization');

    const cancelButton = screen.getByText('common.cancel');
    fireEvent.click(cancelButton);

    // Re-render to simulate reopening
    renderComponent();

    const newInput = screen.getByLabelText('settings.organization.newName') as HTMLInputElement;
    expect(newInput.value).toBe('');
  });

  it('should show loading state while creating', async () => {
    let resolvePromise: (value: OrganizationWithMembership) => void;
    const promise = new Promise<OrganizationWithMembership>((resolve) => {
      resolvePromise = resolve;
    });
    vi.mocked(organizationsService.createOrganization).mockReturnValue(promise);

    renderComponent();

    const input = screen.getByLabelText('settings.organization.newName');
    await userEvent.type(input, 'New Organization');

    const createButton = screen.getByText('settings.organization.create');
    fireEvent.click(createButton);

    await waitFor(() => {
      const button = screen.getByRole('button', { name: /settings.organization.create/i });
      expect(button).toBeDisabled();
    });

    // Resolve the promise to clean up
    resolvePromise!(mockCreatedOrg);
  });
});
