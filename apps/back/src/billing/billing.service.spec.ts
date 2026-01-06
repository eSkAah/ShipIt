import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BillingService } from './billing.service';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '../config/config.service';
import { Organization } from '@prisma/client';

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    customers: {
      create: jest.fn(),
    },
    subscriptions: {
      retrieve: jest.fn(),
    },
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    billingPortal: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }));
});

describe('BillingService', () => {
  let service: BillingService;

  const mockPrismaService = {
    organization: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockConfigService = {
    stripeSecretKey: 'sk_test_mock_key',
    stripeWebhookSecret: 'whsec_mock_secret',
  };

  const mockOrganization: Organization = {
    id: 'org-123',
    name: 'Test Organization',
    slug: 'test-organization',
    stripeCustomerId: null,
    stripeSubscriptionId: null,
    subscriptionTier: 'free',
    subscriptionStatus: 'active',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPremiumOrganization: Organization = {
    ...mockOrganization,
    id: 'org-premium',
    stripeCustomerId: 'cus_mock123',
    stripeSubscriptionId: 'sub_mock123',
    subscriptionTier: 'premium',
    subscriptionStatus: 'active',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSubscriptionInfo', () => {
    it('should return subscription info for free organization', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);

      const result = await service.getSubscriptionInfo('org-123');

      expect(result.tier).toBe('free');
      expect(result.status).toBe('active');
      expect(result.stripeCustomerId).toBeUndefined();
      expect(result.stripeSubscriptionId).toBeUndefined();
    });

    it('should return subscription info for premium organization', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(mockPremiumOrganization);

      const result = await service.getSubscriptionInfo('org-premium');

      expect(result.tier).toBe('premium');
      expect(result.status).toBe('active');
      expect(result.stripeCustomerId).toBe('cus_mock123');
      expect(result.stripeSubscriptionId).toBe('sub_mock123');
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.getSubscriptionInfo('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createCheckoutSession', () => {
    it('should create checkout session for organization without customer', async () => {
      const mockStripe = (
        service as unknown as {
          stripe: {
            customers: { create: jest.Mock };
            checkout: { sessions: { create: jest.Mock } };
          };
        }
      ).stripe;

      mockStripe.customers.create.mockResolvedValue({ id: 'cus_new123' });
      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_mock123',
        url: 'https://checkout.stripe.com/mock',
      });
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrganization,
        stripeCustomerId: 'cus_new123',
      });

      const result = await service.createCheckoutSession(
        mockOrganization,
        'price_mock123',
        'https://example.com/success',
        'https://example.com/cancel',
      );

      expect(result.url).toBe('https://checkout.stripe.com/mock');
      expect(result.sessionId).toBe('cs_mock123');
      expect(mockStripe.customers.create).toHaveBeenCalled();
      expect(mockPrismaService.organization.update).toHaveBeenCalled();
    });

    it('should create checkout session for organization with existing customer', async () => {
      const mockStripe = (
        service as unknown as { stripe: { checkout: { sessions: { create: jest.Mock } } } }
      ).stripe;

      mockStripe.checkout.sessions.create.mockResolvedValue({
        id: 'cs_mock123',
        url: 'https://checkout.stripe.com/mock',
      });

      const result = await service.createCheckoutSession(
        mockPremiumOrganization,
        'price_mock123',
        'https://example.com/success',
        'https://example.com/cancel',
      );

      expect(result.url).toBe('https://checkout.stripe.com/mock');
      expect(result.sessionId).toBe('cs_mock123');
    });
  });

  describe('createPortalSession', () => {
    it('should create portal session for organization with customer', async () => {
      const mockStripe = (
        service as unknown as { stripe: { billingPortal: { sessions: { create: jest.Mock } } } }
      ).stripe;

      mockStripe.billingPortal.sessions.create.mockResolvedValue({
        url: 'https://billing.stripe.com/portal/mock',
      });

      const result = await service.createPortalSession(
        mockPremiumOrganization,
        'https://example.com/billing',
      );

      expect(result.url).toBe('https://billing.stripe.com/portal/mock');
    });

    it('should throw BadRequestException if organization has no customer', async () => {
      await expect(
        service.createPortalSession(mockOrganization, 'https://example.com/billing'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('createStripeCustomer', () => {
    it('should create Stripe customer for organization', async () => {
      const mockStripe = (service as unknown as { stripe: { customers: { create: jest.Mock } } })
        .stripe;

      mockStripe.customers.create.mockResolvedValue({ id: 'cus_new123' });
      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrganization);
      mockPrismaService.organization.update.mockResolvedValue({
        ...mockOrganization,
        stripeCustomerId: 'cus_new123',
      });

      const result = await service.createStripeCustomer('org-123');

      expect(result).toBe('cus_new123');
      expect(mockStripe.customers.create).toHaveBeenCalledWith({
        metadata: {
          organizationId: 'org-123',
          organizationName: 'Test Organization',
        },
      });
    });

    it('should return existing customer ID if already exists', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(mockPremiumOrganization);

      const result = await service.createStripeCustomer('org-premium');

      expect(result).toBe('cus_mock123');
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.createStripeCustomer('nonexistent')).rejects.toThrow(NotFoundException);
    });
  });
});

describe('BillingService without Stripe configured', () => {
  let service: BillingService;

  const mockPrismaService = {
    organization: {
      findUnique: jest.fn(),
    },
  };

  const mockConfigServiceNoStripe = {
    stripeSecretKey: '',
    stripeWebhookSecret: '',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BillingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigServiceNoStripe,
        },
      ],
    }).compile();

    service = module.get<BillingService>(BillingService);
  });

  it('should throw BadRequestException when trying to create checkout without Stripe', async () => {
    const mockOrganization: Organization = {
      id: 'org-123',
      name: 'Test Organization',
      slug: 'test-organization',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await expect(
      service.createCheckoutSession(
        mockOrganization,
        'price_mock123',
        'https://example.com/success',
        'https://example.com/cancel',
      ),
    ).rejects.toThrow(BadRequestException);
  });

  it('should return null when creating customer without Stripe configured', async () => {
    mockPrismaService.organization.findUnique.mockResolvedValue({
      id: 'org-123',
      name: 'Test Organization',
      slug: 'test-organization',
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await service.createStripeCustomer('org-123');

    expect(result).toBeNull();
  });
});
