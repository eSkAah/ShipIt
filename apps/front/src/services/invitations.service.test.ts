import { describe, it, expect, vi, beforeEach } from 'vitest';
import { invitationsService } from './invitations.service';
import { apiClient } from '../lib/axios';

vi.mock('../lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('invitationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInvitation', () => {
    it('should call POST /organizations/:id/invitations with email and role', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'newuser@example.com',
        role: 'member',
        status: 'pending',
        token: 'random-token',
        organizationId: 'org-123',
        expiresAt: new Date().toISOString(),
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: mockInvitation },
      });

      const result = await invitationsService.createInvitation(
        'org-123',
        'newuser@example.com',
        'member',
      );

      expect(apiClient.post).toHaveBeenCalledWith('/organizations/org-123/invitations', {
        email: 'newuser@example.com',
        role: 'member',
      });
      expect(result).toEqual(mockInvitation);
    });

    it('should default role to member if not provided', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'newuser@example.com',
        role: 'member',
        status: 'pending',
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: mockInvitation },
      });

      await invitationsService.createInvitation('org-123', 'newuser@example.com');

      expect(apiClient.post).toHaveBeenCalledWith('/organizations/org-123/invitations', {
        email: 'newuser@example.com',
        role: 'member',
      });
    });
  });

  describe('getInvitations', () => {
    it('should call GET /organizations/:id/invitations', async () => {
      const mockInvitations = [
        { id: 'inv-1', email: 'user1@example.com', role: 'member', status: 'pending' },
        { id: 'inv-2', email: 'user2@example.com', role: 'admin', status: 'pending' },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: mockInvitations },
      });

      const result = await invitationsService.getInvitations('org-123');

      expect(apiClient.get).toHaveBeenCalledWith('/organizations/org-123/invitations');
      expect(result).toEqual(mockInvitations);
    });

    it('should return empty array if data is undefined', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: undefined },
      });

      const result = await invitationsService.getInvitations('org-123');

      expect(result).toEqual([]);
    });
  });

  describe('cancelInvitation', () => {
    it('should call DELETE /invitations/:id', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { success: true },
      });

      await invitationsService.cancelInvitation('inv-123');

      expect(apiClient.delete).toHaveBeenCalledWith('/invitations/inv-123');
    });
  });

  describe('getInvitationByToken', () => {
    it('should call GET /invitations/:token and return invitation details', async () => {
      const mockInvitation = {
        id: 'inv-123',
        email: 'invited@example.com',
        role: 'member',
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
        },
        expiresAt: new Date(Date.now() + 86400000),
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: mockInvitation },
      });

      const result = await invitationsService.getInvitationByToken('valid-token');

      expect(apiClient.get).toHaveBeenCalledWith('/invitations/valid-token');
      expect(result).toEqual(mockInvitation);
    });
  });

  describe('acceptInvitation', () => {
    it('should call POST /invitations/:token/accept', async () => {
      const mockResult = {
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
        },
        role: 'member',
      };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: mockResult },
      });

      const result = await invitationsService.acceptInvitation('valid-token');

      expect(apiClient.post).toHaveBeenCalledWith('/invitations/valid-token/accept');
      expect(result).toEqual(mockResult);
    });
  });
});
