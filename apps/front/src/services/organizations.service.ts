import { Organization, ApiResponse } from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

export interface OrganizationWithMembership extends Organization {
  role: 'admin' | 'member' | 'viewer';
  membershipId: string;
}

export interface Member {
  id: string;
  userId: string;
  role: 'admin' | 'member' | 'viewer';
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  };
}

export const organizationsService = {
  async getMyOrganizations(): Promise<OrganizationWithMembership[]> {
    const response =
      await apiClient.get<ApiResponse<OrganizationWithMembership[]>>('/organizations');
    return response.data.data || [];
  },

  async getOrganization(id: string): Promise<Organization> {
    const response = await apiClient.get<ApiResponse<Organization>>(`/organizations/${id}`);
    return response.data.data!;
  },

  async createOrganization(name: string): Promise<Organization> {
    const response = await apiClient.post<ApiResponse<Organization>>('/organizations', { name });
    return response.data.data!;
  },

  async updateOrganization(id: string, data: { name?: string }): Promise<Organization> {
    const response = await apiClient.patch<ApiResponse<Organization>>(`/organizations/${id}`, data);
    return response.data.data!;
  },

  async deleteOrganization(id: string): Promise<void> {
    await apiClient.delete(`/organizations/${id}`);
  },

  async getMembers(organizationId: string): Promise<Member[]> {
    const response = await apiClient.get<ApiResponse<Member[]>>(
      `/organizations/${organizationId}/members`,
    );
    return response.data.data || [];
  },

  async updateMemberRole(
    organizationId: string,
    userId: string,
    role: 'admin' | 'member' | 'viewer',
  ): Promise<Member> {
    const response = await apiClient.patch<ApiResponse<Member>>(
      `/organizations/${organizationId}/members/${userId}`,
      { role },
    );
    return response.data.data!;
  },

  async removeMember(organizationId: string, userId: string): Promise<void> {
    await apiClient.delete(`/organizations/${organizationId}/members/${userId}`);
  },

  async leaveOrganization(organizationId: string): Promise<void> {
    await apiClient.post(`/organizations/${organizationId}/leave`);
  },
};
