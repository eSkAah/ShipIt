import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Organization } from '@prisma/client';

export const SUBSCRIPTION_TIER_KEY = 'requiredTier';

@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredTier = this.reflector.getAllAndOverride<string | undefined>(
      SUBSCRIPTION_TIER_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If no tier requirement is set, allow access
    if (!requiredTier) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const organization: Organization | undefined = request.currentOrganization;

    if (!organization) {
      throw new ForbiddenException('Organization context required for subscription check');
    }

    // Check subscription status
    if (
      organization.subscriptionStatus !== 'active' &&
      organization.subscriptionStatus !== 'trialing'
    ) {
      throw new ForbiddenException(
        'This feature requires an active subscription. Please upgrade your plan.',
      );
    }

    // Check tier if premium is required
    if (requiredTier === 'premium' && organization.subscriptionTier !== 'premium') {
      throw new ForbiddenException(
        'This feature requires a Premium subscription. Please upgrade your plan.',
      );
    }

    return true;
  }
}
