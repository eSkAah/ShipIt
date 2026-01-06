import { SetMetadata } from '@nestjs/common';
import { SUBSCRIPTION_TIER_KEY } from '../guards/subscription.guard';

export const RequireSubscription = (tier: 'free' | 'premium' = 'premium') =>
  SetMetadata(SUBSCRIPTION_TIER_KEY, tier);
