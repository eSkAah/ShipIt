import { ApiResponse, PaginatedResponse } from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

export interface AdminUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  emailVerified: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  memberships: {
    id: string;
    role: 'admin' | 'member' | 'viewer';
    organization: {
      id: string;
      name: string;
    };
  }[];
}

export interface AdminOrganization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  subscriptionTier: 'free' | 'premium';
  subscriptionStatus: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  createdAt: string;
  memberCount: number;
}

export interface AppLog {
  id: string;
  level: string;
  message: string;
  context?: Record<string, unknown>;
  userId?: string;
  orgId?: string;
  requestId?: string;
  timestamp: string;
}

export interface AdminStats {
  totalUsers: number;
  totalOrganizations: number;
  verifiedUsers: number;
  premiumOrgs: number;
  freeOrgs: number;
  unverifiedUsers: number;
}

export interface UsersQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface OrganizationsQuery {
  page?: number;
  limit?: number;
  search?: string;
  tier?: 'free' | 'premium';
}

export interface LogsQuery {
  page?: number;
  limit?: number;
  search?: string;
  level?: string;
}

export interface AdminFeedback {
  id: string;
  type: 'bug' | 'help';
  subject: string;
  message: string;
  userId: string;
  organizationId?: string;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export interface FeedbackQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: 'bug' | 'help';
}

export const adminService = {
  async getStats(): Promise<AdminStats> {
    const response = await apiClient.get<ApiResponse<AdminStats>>('/admin/stats');
    if (!response.data.data) {
      throw new Error('Failed to get stats');
    }
    return response.data.data;
  },

  async getUsers(query: UsersQuery = {}): Promise<PaginatedResponse<AdminUser>> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);

    const response = await apiClient.get<ApiResponse<AdminUser[]> & PaginatedResponse<AdminUser>>(
      `/admin/users?${params.toString()}`,
    );
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  async getOrganizations(
    query: OrganizationsQuery = {},
  ): Promise<PaginatedResponse<AdminOrganization>> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.tier) params.append('tier', query.tier);

    const response = await apiClient.get<
      ApiResponse<AdminOrganization[]> & PaginatedResponse<AdminOrganization>
    >(`/admin/organizations?${params.toString()}`);
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  async getLogs(query: LogsQuery = {}): Promise<PaginatedResponse<AppLog>> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.level) params.append('level', query.level);

    const response = await apiClient.get<ApiResponse<AppLog[]> & PaginatedResponse<AppLog>>(
      `/admin/logs?${params.toString()}`,
    );
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },

  async getFeedback(query: FeedbackQuery = {}): Promise<PaginatedResponse<AdminFeedback>> {
    const params = new URLSearchParams();
    if (query.page) params.append('page', query.page.toString());
    if (query.limit) params.append('limit', query.limit.toString());
    if (query.search) params.append('search', query.search);
    if (query.type) params.append('type', query.type);

    const response = await apiClient.get<
      ApiResponse<AdminFeedback[]> & PaginatedResponse<AdminFeedback>
    >(`/admin/feedback?${params.toString()}`);
    return {
      data: response.data.data || [],
      pagination: response.data.pagination,
    };
  },
};
