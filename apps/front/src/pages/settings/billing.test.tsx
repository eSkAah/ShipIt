/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BillingSettingsPage } from './billing';
import { billingService } from '../../services/billing.service';
import { toast } from 'sonner';

vi.mock('../../services/billing.service', () => ({
  billingService: {
    getSubscriptionInfo: vi.fn(),
    createCheckoutSession: vi.fn(),
    createPortalSession: vi.fn(),
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock('../../contexts/organization-context', () => ({
  useOrganization: vi.fn(),
}));

vi.mock('../../components/layouts/dashboard-layout', () => ({
  DashboardLayout: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-layout">{children}</div>
  ),
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'settings.billing.title': 'Billing & Subscription',
        'settings.billing.description': 'Manage your subscription',
        'settings.billing.currentPlan': 'Current Plan',
        'settings.billing.organization': 'Organization',
        'settings.billing.checkoutSuccess': 'Payment successful!',
        'settings.billing.checkoutCanceled': 'Checkout canceled.',
        'settings.billing.checkoutError': 'Failed to start checkout.',
        'settings.billing.portalError': 'Failed to open portal.',
        'settings.billing.status.active': 'Active',
        'settings.billing.status.trialing': 'Trial',
        'settings.billing.status.pastDue': 'Past Due',
        'settings.billing.status.canceled': 'Canceled',
        'settings.billing.status.incomplete': 'Incomplete',
        'settings.billing.plans.free': 'Free Plan',
        'settings.billing.plans.freeDescription': 'Basic features',
        'settings.billing.plans.premium': 'Premium Plan',
        'settings.billing.plans.premiumDescription': 'Full access',
        'settings.billing.renewsOn': 'Renews on',
        'settings.billing.endsOn': 'Ends on',
        'settings.billing.cancelScheduled': 'Subscription will be canceled',
        'settings.billing.pastDueWarning.title': 'Payment Failed',
        'settings.billing.pastDueWarning.description': 'Update payment method',
        'settings.billing.actions': 'Billing Actions',
        'settings.billing.upgrade.title': 'Upgrade to Premium',
        'settings.billing.upgrade.description': 'Unlock all features',
        'settings.billing.upgrade.button': 'Upgrade',
        'settings.billing.manageSubscription.title': 'Manage Subscription',
        'settings.billing.manageSubscription.description': 'Update payment method',
        'settings.billing.manageSubscription.button': 'Manage',
        'settings.billing.stripeNotConfigured': 'Billing is not configured.',
        'settings.billing.adminOnly.title': 'Admin Access Required',
        'settings.billing.adminOnly.description': 'Only admins can manage billing.',
        'settings.billing.features.title': 'Premium Features',
        'settings.billing.features.feature1': 'Unlimited team members',
        'settings.billing.features.feature2': 'Advanced analytics',
        'settings.billing.features.feature3': 'Priority support',
        'settings.billing.features.feature4': 'Custom integrations',
        'settings.billing.error.title': 'Unable to Load Billing',
        'settings.billing.error.description': 'Could not load billing info.',
        'common.retry': 'Try again',
      };
      return translations[key] || key;
    },
    i18n: { changeLanguage: vi.fn() },
  }),
}));

import { useOrganization } from '../../contexts/organization-context';

describe('BillingSettingsPage', () => {
  let queryClient: QueryClient;

  const mockOrganization = {
    id: 'org-1',
    name: 'Test Organization',
    slug: 'test-org',
    subscriptionTier: 'free' as const,
    subscriptionStatus: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockMembership = {
    id: 'membership-1',
    role: 'admin' as const,
    userId: 'user-1',
    organizationId: 'org-1',
  };

  const mockFreeSubscription = {
    tier: 'free' as const,
    status: 'active' as const,
  };

  const mockPremiumSubscription = {
    tier: 'premium' as const,
    status: 'active' as const,
    stripeCustomerId: 'cus_123',
    stripeSubscriptionId: 'sub_123',
    currentPeriodEnd: new Date('2025-02-01'),
    cancelAtPeriodEnd: false,
  };

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });

    vi.clearAllMocks();

    (useOrganization as any).mockReturnValue({
      currentOrganization: mockOrganization,
      currentMembership: mockMembership,
    });
  });

  const renderComponent = () => {
    return render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <BillingSettingsPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  };

  describe('Loading state', () => {
    it('should show loading skeleton initially', () => {
      (billingService.getSubscriptionInfo as any).mockReturnValue(new Promise(() => {}));

      renderComponent();

      expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    });
  });

  describe('Free plan display', () => {
    it('should display free plan information', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockFreeSubscription);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Free Plan/i)).toBeInTheDocument();
      });
    });

    it('should show upgrade button for free plan', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockFreeSubscription);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Upgrade/i })).toBeInTheDocument();
      });
    });
  });

  describe('Premium plan display', () => {
    it('should display premium plan information', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockPremiumSubscription);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Premium Plan/i)).toBeInTheDocument();
      });
    });

    it('should show manage subscription button for premium plan', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockPremiumSubscription);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Manage/i })).toBeInTheDocument();
      });
    });

    it('should show renewal date for premium plan', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockPremiumSubscription);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Renews on/i)).toBeInTheDocument();
      });
    });
  });

  describe('Checkout flow', () => {
    it('should redirect to checkout when upgrade button clicked', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockFreeSubscription);
      (billingService.createCheckoutSession as any).mockResolvedValue({
        url: 'https://checkout.stripe.com/test',
        sessionId: 'cs_test',
      });

      // Mock window.location
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as any;

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Upgrade/i })).toBeInTheDocument();
      });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(billingService.createCheckoutSession).toHaveBeenCalled();
      });

      // Restore window.location
      window.location = originalLocation;
    });

    it('should show error toast if checkout fails', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockFreeSubscription);
      (billingService.createCheckoutSession as any).mockRejectedValue(new Error('Checkout failed'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Upgrade/i })).toBeInTheDocument();
      });

      const upgradeButton = screen.getByRole('button', { name: /Upgrade/i });
      fireEvent.click(upgradeButton);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalled();
      });
    });
  });

  describe('Portal flow', () => {
    it('should redirect to portal when manage button clicked', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockPremiumSubscription);
      (billingService.createPortalSession as any).mockResolvedValue({
        url: 'https://billing.stripe.com/portal/test',
      });

      // Mock window.location
      const originalLocation = window.location;
      delete (window as any).location;
      window.location = { ...originalLocation, href: '' } as any;

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Manage/i })).toBeInTheDocument();
      });

      const manageButton = screen.getByRole('button', { name: /Manage/i });
      fireEvent.click(manageButton);

      await waitFor(() => {
        expect(billingService.createPortalSession).toHaveBeenCalled();
      });

      // Restore window.location
      window.location = originalLocation;
    });
  });

  describe('Non-admin user', () => {
    it('should show admin-only message for non-admin users', async () => {
      (useOrganization as any).mockReturnValue({
        currentOrganization: mockOrganization,
        currentMembership: { ...mockMembership, role: 'member' },
      });
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockFreeSubscription);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Admin Access Required/i)).toBeInTheDocument();
      });
    });

    it('should not show upgrade button for non-admin users', async () => {
      (useOrganization as any).mockReturnValue({
        currentOrganization: mockOrganization,
        currentMembership: { ...mockMembership, role: 'viewer' },
      });
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockFreeSubscription);

      renderComponent();

      await waitFor(() => {
        expect(screen.queryByRole('button', { name: /Upgrade/i })).not.toBeInTheDocument();
      });
    });
  });

  describe('Subscription status badges', () => {
    it('should show Active badge for active subscription', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockPremiumSubscription);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Active/i)).toBeInTheDocument();
      });
    });

    it('should show Past Due badge and warning for past_due subscription', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue({
        ...mockPremiumSubscription,
        status: 'past_due',
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Past Due/i)).toBeInTheDocument();
        expect(screen.getByText(/Payment Failed/i)).toBeInTheDocument();
      });
    });

    it('should show Canceled badge for canceled subscription', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue({
        ...mockPremiumSubscription,
        status: 'canceled',
        tier: 'free',
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Canceled/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error handling', () => {
    it('should show error state when API fails', async () => {
      (billingService.getSubscriptionInfo as any).mockRejectedValue(new Error('API Error'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Unable to Load Billing/i)).toBeInTheDocument();
      });
    });

    it('should have retry button on error state', async () => {
      (billingService.getSubscriptionInfo as any).mockRejectedValue(new Error('API Error'));

      renderComponent();

      await waitFor(() => {
        expect(screen.getByRole('button', { name: /Try again/i })).toBeInTheDocument();
      });
    });
  });

  describe('Premium features list', () => {
    it('should display premium features', async () => {
      (billingService.getSubscriptionInfo as any).mockResolvedValue(mockFreeSubscription);

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText(/Premium Features/i)).toBeInTheDocument();
        expect(screen.getByText(/Unlimited team members/i)).toBeInTheDocument();
      });
    });
  });
});
