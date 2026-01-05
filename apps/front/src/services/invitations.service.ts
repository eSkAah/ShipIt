import { Invitation, ApiResponse, Organization } from '@shipit/shared-types';
import { apiClient } from '../lib/axios';

export interface InvitationDetails {
  id: string;
  email: string;
  role: 'admin' | 'member' | 'viewer';
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  expiresAt: Date;
}

export interface AcceptInvitationResult {
  organization: Organization;
  role: 'admin' | 'member' | 'viewer';
}

export const invitationsService = {
  async createInvitation(
    organizationId: string,
    email: string,
    role: 'admin' | 'member' | 'viewer' = 'member',
  ): Promise<Invitation> {
    const response = await apiClient.post<ApiResponse<Invitation>>(
      `/organizations/${organizationId}/invitations`,
      { email, role },
    );
    return response.data.data!;
  },

  async getInvitations(organizationId: string): Promise<Invitation[]> {
    const response = await apiClient.get<ApiResponse<Invitation[]>>(
      `/organizations/${organizationId}/invitations`,
    );
    return response.data.data || [];
  },

  async cancelInvitation(invitationId: string): Promise<void> {
    await apiClient.delete(`/invitations/${invitationId}`);
  },

  async getInvitationByToken(token: string): Promise<InvitationDetails> {
    const response = await apiClient.get<ApiResponse<InvitationDetails>>(`/invitations/${token}`);
    return response.data.data!;
  },

  async acceptInvitation(token: string): Promise<AcceptInvitationResult> {
    const response = await apiClient.post<ApiResponse<AcceptInvitationResult>>(
      `/invitations/${token}/accept`,
    );
    return response.data.data!;
  },
};
