import {
  SubscriptionInfo,
  ApiResponse,
  CheckoutSessionResult,
  PortalSessionResult,
} from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

export const billingService = {
  async getSubscriptionInfo(): Promise<SubscriptionInfo> {
    const response = await apiClient.get<ApiResponse<SubscriptionInfo>>('/billing');
    if (!response.data.data) {
      throw new Error('Failed to fetch subscription info');
    }
    return response.data.data;
  },

  async createCheckoutSession(priceId: string): Promise<CheckoutSessionResult> {
    const response = await apiClient.post<ApiResponse<CheckoutSessionResult>>('/billing/checkout', {
      priceId,
    });
    if (!response.data.data) {
      throw new Error('Failed to create checkout session');
    }
    return response.data.data;
  },

  async createPortalSession(): Promise<PortalSessionResult> {
    const response = await apiClient.post<ApiResponse<PortalSessionResult>>('/billing/portal');
    if (!response.data.data) {
      throw new Error('Failed to create portal session');
    }
    return response.data.data;
  },
};
