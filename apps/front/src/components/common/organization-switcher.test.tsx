import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { OrganizationSwitcher } from './organization-switcher';
import { OrganizationWithMembership } from '../../services/organizations.service';

const mockNavigate = vi.fn();

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('./create-organization-dialog', () => ({
  CreateOrganizationDialog: ({
    isOpen,
    onClose,
    onCreated,
  }: {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (org: OrganizationWithMembership) => void;
  }) =>
    isOpen ? (
      <div data-testid="create-dialog">
        <button onClick={onClose}>Cancel</button>
        <button
          onClick={() =>
            onCreated({
              id: 'new-org',
              name: 'New Org',
              slug: 'new-org',
              role: 'admin',
              membershipId: 'm-new',
              stripeCustomerId: null,
              subscriptionTier: 'free',
              subscriptionStatus: 'active',
              trialEndsAt: null,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
        >
          Create
        </button>
      </div>
    ) : null,
}));

describe('OrganizationSwitcher', () => {
  const mockOrganizations: OrganizationWithMembership[] = [
    {
      id: 'org-1',
      name: 'Organization One',
      slug: 'org-one',
      role: 'admin',
      membershipId: 'm-1',
      stripeCustomerId: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      trialEndsAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'org-2',
      name: 'Organization Two',
      slug: 'org-two',
      role: 'member',
      membershipId: 'm-2',
      stripeCustomerId: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      trialEndsAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  const mockOnSwitch = vi.fn();
  let queryClient: QueryClient;

  const renderComponent = (
    currentOrganization: OrganizationWithMembership | null = mockOrganizations[0],
    organizations: OrganizationWithMembership[] = mockOrganizations,
  ) => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });

    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <OrganizationSwitcher
            organizations={organizations}
            currentOrganization={currentOrganization}
            onSwitch={mockOnSwitch}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render nothing if currentOrganization is null', () => {
    renderComponent(null);
    expect(screen.queryByText('Organization One')).not.toBeInTheDocument();
  });

  it('should display current organization name', () => {
    renderComponent();
    expect(screen.getByText('Organization One')).toBeInTheDocument();
  });

  it('should display first letter of organization as avatar', () => {
    renderComponent();
    expect(screen.getByText('O')).toBeInTheDocument();
  });

  it('should open dropdown when clicked', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    expect(screen.getByText('common.organizations')).toBeInTheDocument();
  });

  it('should list all organizations in dropdown', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    // Organization One appears twice: in the main button and in the dropdown
    expect(screen.getAllByText('Organization One')).toHaveLength(2);
    expect(screen.getByText('Organization Two')).toBeInTheDocument();
  });

  it('should display user role for each organization', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    expect(screen.getByText('settings.team.role.admin')).toBeInTheDocument();
    expect(screen.getByText('settings.team.role.member')).toBeInTheDocument();
  });

  it('should call onSwitch when selecting an organization', async () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    const orgTwo = screen.getByText('Organization Two');
    fireEvent.click(orgTwo.closest('button')!);

    expect(mockOnSwitch).toHaveBeenCalledWith(mockOrganizations[1]);
  });

  it('should close dropdown after selecting an organization', async () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    const orgTwo = screen.getByText('Organization Two');
    fireEvent.click(orgTwo.closest('button')!);

    await waitFor(() => {
      expect(screen.queryByText('common.organizations')).not.toBeInTheDocument();
    });
  });

  it('should show create organization button', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    expect(screen.getByText('settings.organization.createNew')).toBeInTheDocument();
  });

  it('should open create dialog and close dropdown when clicking create button', async () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    const createButton = screen.getByText('settings.organization.createNew');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-dialog')).toBeInTheDocument();
    });
    expect(screen.queryByText('common.organizations')).not.toBeInTheDocument();
  });

  it('should navigate to settings when clicking settings button', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    const settingsButton = screen.getByText('settings.organization.title');
    fireEvent.click(settingsButton);

    expect(mockNavigate).toHaveBeenCalledWith('/settings/organization');
  });

  it('should close dropdown when clicking outside', async () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    expect(screen.getByText('common.organizations')).toBeInTheDocument();

    // Click on backdrop
    const backdrop = document.querySelector('.fixed.inset-0.z-40');
    if (backdrop) {
      fireEvent.click(backdrop);
    }

    await waitFor(() => {
      expect(screen.queryByText('common.organizations')).not.toBeInTheDocument();
    });
  });

  it('should show checkmark for current organization', () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    const orgOneButton = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent?.includes('Organization One') && btn.querySelector('svg'));
    expect(orgOneButton?.querySelector('svg')).toBeInTheDocument();
  });

  it('should handle organization creation', async () => {
    renderComponent();

    const button = screen.getByRole('button', { name: /organization one/i });
    fireEvent.click(button);

    const createButton = screen.getByText('settings.organization.createNew');
    fireEvent.click(createButton);

    await waitFor(() => {
      expect(screen.getByTestId('create-dialog')).toBeInTheDocument();
    });

    const createDialogButton = screen.getByText('Create');
    fireEvent.click(createDialogButton);

    await waitFor(() => {
      expect(mockOnSwitch).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'new-org',
          name: 'New Org',
        }),
      );
    });

    expect(mockNavigate).toHaveBeenCalledWith('/settings/organization');
  });
});
