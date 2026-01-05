import { Organization, OrganizationMember } from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

export interface OrganizationWithMembership extends Organization {
  membership: OrganizationMember;
}

export const organizationsService = {
  async getMyOrganizations(): Promise<OrganizationWithMembership[]> {
    const response = await apiClient.get<OrganizationWithMembership[]>('/organizations');
    return response.data;
  },

  async getOrganization(id: string): Promise<Organization> {
    const response = await apiClient.get<Organization>(`/organizations/${id}`);
    return response.data;
  },
};
