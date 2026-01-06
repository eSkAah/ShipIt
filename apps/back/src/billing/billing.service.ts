import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { ConfigService } from '../config/config.service';
import { Organization, SubscriptionStatus, SubscriptionTier } from '@prisma/client';
import Stripe from 'stripe';

export interface SubscriptionInfo {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodEnd?: Date;
  cancelAtPeriodEnd?: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface CheckoutSessionResult {
  url: string;
  sessionId: string;
}

export interface PortalSessionResult {
  url: string;
}

@Injectable()
export class BillingService {
  private readonly logger = new Logger(BillingService.name);
  private stripe: Stripe | null = null;

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {
    const stripeSecretKey = this.configService.stripeSecretKey;
    if (stripeSecretKey) {
      this.stripe = new Stripe(stripeSecretKey);
    } else {
      this.logger.warn('Stripe secret key not configured. Billing features will be disabled.');
    }
  }

  private ensureStripeConfigured(): Stripe {
    if (!this.stripe) {
      throw new BadRequestException(
        'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.',
      );
    }
    return this.stripe;
  }

  async getSubscriptionInfo(organizationId: string): Promise<SubscriptionInfo> {
    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const subscriptionInfo: SubscriptionInfo = {
      tier: organization.subscriptionTier,
      status: organization.subscriptionStatus,
      stripeCustomerId: organization.stripeCustomerId || undefined,
      stripeSubscriptionId: organization.stripeSubscriptionId || undefined,
    };

    // If there's a Stripe subscription, fetch additional details
    if (organization.stripeSubscriptionId && this.stripe) {
      try {
        const subscription = await this.stripe.subscriptions.retrieve(
          organization.stripeSubscriptionId,
        );
        // Get billing period from subscription items
        const firstItem = subscription.items?.data?.[0];
        if (firstItem?.current_period_end) {
          subscriptionInfo.currentPeriodEnd = new Date(firstItem.current_period_end * 1000);
        }
        subscriptionInfo.cancelAtPeriodEnd = subscription.cancel_at_period_end;
      } catch (error) {
        this.logger.warn(
          `Failed to fetch subscription details for org ${organizationId}: ${error}`,
        );
      }
    }

    return subscriptionInfo;
  }

  async createCheckoutSession(
    organization: Organization,
    priceId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<CheckoutSessionResult> {
    const stripe = this.ensureStripeConfigured();

    // Ensure the organization has a Stripe customer
    let customerId = organization.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        metadata: {
          organizationId: organization.id,
          organizationName: organization.name,
        },
      });
      customerId = customer.id;

      // Update organization with the new customer ID
      await this.prisma.organization.update({
        where: { id: organization.id },
        data: { stripeCustomerId: customerId },
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        organizationId: organization.id,
      },
    });

    if (!session.url) {
      throw new BadRequestException('Failed to create checkout session');
    }

    return {
      url: session.url,
      sessionId: session.id,
    };
  }

  async createPortalSession(
    organization: Organization,
    returnUrl: string,
  ): Promise<PortalSessionResult> {
    const stripe = this.ensureStripeConfigured();

    if (!organization.stripeCustomerId) {
      throw new BadRequestException(
        'No Stripe customer found for this organization. Please subscribe first.',
      );
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: organization.stripeCustomerId,
      return_url: returnUrl,
    });

    return {
      url: session.url,
    };
  }

  async handleWebhookEvent(payload: Buffer, signature: string): Promise<void> {
    const stripe = this.ensureStripeConfigured();
    const webhookSecret = this.configService.stripeWebhookSecret;

    if (!webhookSecret) {
      throw new BadRequestException('Stripe webhook secret not configured');
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      this.logger.error(`Webhook signature verification failed: ${errorMessage}`);
      throw new BadRequestException(`Webhook signature verification failed: ${errorMessage}`);
    }

    this.logger.log(`Processing Stripe webhook event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object as Stripe.Invoice);
        break;

      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const organizationId = session.metadata?.organizationId;

    if (!organizationId) {
      this.logger.warn('No organizationId in checkout session metadata');
      return;
    }

    if (session.subscription && typeof session.subscription === 'string') {
      await this.prisma.organization.update({
        where: { id: organizationId },
        data: {
          stripeSubscriptionId: session.subscription,
          subscriptionTier: 'premium',
          subscriptionStatus: 'active',
        },
      });

      this.logger.log(`Organization ${organizationId} upgraded to premium via checkout`);
    }
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

    const organization = await this.prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!organization) {
      this.logger.warn(`No organization found for Stripe customer ${customerId}`);
      return;
    }

    const status = this.mapStripeStatus(subscription.status);
    const tier =
      subscription.status === 'active' || subscription.status === 'trialing'
        ? 'premium'
        : organization.subscriptionTier;

    await this.prisma.organization.update({
      where: { id: organization.id },
      data: {
        stripeSubscriptionId: subscription.id,
        subscriptionStatus: status,
        subscriptionTier: tier,
      },
    });

    this.logger.log(`Organization ${organization.id} subscription updated: ${status}`);
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    const customerId =
      typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

    const organization = await this.prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!organization) {
      this.logger.warn(`No organization found for Stripe customer ${customerId}`);
      return;
    }

    await this.prisma.organization.update({
      where: { id: organization.id },
      data: {
        subscriptionStatus: 'canceled',
        subscriptionTier: 'free',
        stripeSubscriptionId: null,
      },
    });

    this.logger.log(`Organization ${organization.id} subscription canceled`);
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    const customerId =
      typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    if (!customerId) {
      this.logger.warn('No customer ID in invoice');
      return;
    }

    const organization = await this.prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!organization) {
      this.logger.warn(`No organization found for Stripe customer ${customerId}`);
      return;
    }

    await this.prisma.organization.update({
      where: { id: organization.id },
      data: {
        subscriptionStatus: 'past_due',
      },
    });

    this.logger.log(`Organization ${organization.id} payment failed, set to past_due`);
  }

  private async handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
    const customerId =
      typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

    if (!customerId) {
      this.logger.warn('No customer ID in invoice');
      return;
    }

    const organization = await this.prisma.organization.findFirst({
      where: { stripeCustomerId: customerId },
    });

    if (!organization) {
      this.logger.warn(`No organization found for Stripe customer ${customerId}`);
      return;
    }

    // Only update if currently past_due
    if (organization.subscriptionStatus === 'past_due') {
      await this.prisma.organization.update({
        where: { id: organization.id },
        data: {
          subscriptionStatus: 'active',
        },
      });

      this.logger.log(`Organization ${organization.id} payment successful, reactivated`);
    }
  }

  private mapStripeStatus(stripeStatus: Stripe.Subscription.Status): SubscriptionStatus {
    const statusMap: Record<Stripe.Subscription.Status, SubscriptionStatus> = {
      active: 'active',
      past_due: 'past_due',
      canceled: 'canceled',
      trialing: 'trialing',
      incomplete: 'incomplete',
      incomplete_expired: 'canceled',
      unpaid: 'past_due',
      paused: 'canceled',
    };

    return statusMap[stripeStatus] || 'incomplete';
  }

  async createStripeCustomer(organizationId: string): Promise<string | null> {
    if (!this.stripe) {
      this.logger.warn('Stripe not configured, skipping customer creation');
      return null;
    }

    const organization = await this.prisma.organization.findUnique({
      where: { id: organizationId },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    if (organization.stripeCustomerId) {
      return organization.stripeCustomerId;
    }

    const customer = await this.stripe.customers.create({
      metadata: {
        organizationId: organization.id,
        organizationName: organization.name,
      },
    });

    await this.prisma.organization.update({
      where: { id: organizationId },
      data: { stripeCustomerId: customer.id },
    });

    this.logger.log(`Created Stripe customer ${customer.id} for organization ${organizationId}`);

    return customer.id;
  }
}
