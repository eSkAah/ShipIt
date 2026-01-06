import { describe, it, expect, vi, beforeEach } from 'vitest';
import { organizationsService } from './organizations.service';
import { apiClient } from '../lib/axios';

vi.mock('../lib/axios', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('organizationsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getMyOrganizations', () => {
    it('should call GET /organizations and return data', async () => {
      const mockOrgs = [
        { id: 'org-1', name: 'Org 1', slug: 'org-1', role: 'admin', membershipId: 'm-1' },
        { id: 'org-2', name: 'Org 2', slug: 'org-2', role: 'member', membershipId: 'm-2' },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: mockOrgs },
      });

      const result = await organizationsService.getMyOrganizations();

      expect(apiClient.get).toHaveBeenCalledWith('/organizations');
      expect(result).toEqual(mockOrgs);
    });

    it('should return empty array if data is undefined', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: undefined },
      });

      const result = await organizationsService.getMyOrganizations();

      expect(result).toEqual([]);
    });
  });

  describe('getOrganization', () => {
    it('should call GET /organizations/:id and return data', async () => {
      const mockOrg = { id: 'org-123', name: 'Test Org', slug: 'test-org' };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: mockOrg },
      });

      const result = await organizationsService.getOrganization('org-123');

      expect(apiClient.get).toHaveBeenCalledWith('/organizations/org-123');
      expect(result).toEqual(mockOrg);
    });
  });

  describe('createOrganization', () => {
    it('should call POST /organizations with name', async () => {
      const mockOrg = { id: 'org-123', name: 'New Org', slug: 'new-org' };

      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: mockOrg },
      });

      const result = await organizationsService.createOrganization('New Org');

      expect(apiClient.post).toHaveBeenCalledWith('/organizations', { name: 'New Org' });
      expect(result).toEqual(mockOrg);
    });
  });

  describe('updateOrganization', () => {
    it('should call PATCH /organizations/:id with data', async () => {
      const mockOrg = { id: 'org-123', name: 'Updated Org', slug: 'updated-org' };

      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { success: true, data: mockOrg },
      });

      const result = await organizationsService.updateOrganization('org-123', {
        name: 'Updated Org',
      });

      expect(apiClient.patch).toHaveBeenCalledWith('/organizations/org-123', {
        name: 'Updated Org',
      });
      expect(result).toEqual(mockOrg);
    });
  });

  describe('deleteOrganization', () => {
    it('should call DELETE /organizations/:id', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { success: true },
      });

      await organizationsService.deleteOrganization('org-123');

      expect(apiClient.delete).toHaveBeenCalledWith('/organizations/org-123');
    });
  });

  describe('getMembers', () => {
    it('should call GET /organizations/:id/members and return data', async () => {
      const mockMembers = [
        {
          id: 'm-1',
          userId: 'user-1',
          role: 'admin',
          user: { id: 'user-1', email: 'admin@test.com', firstName: 'Admin', lastName: 'User' },
        },
        {
          id: 'm-2',
          userId: 'user-2',
          role: 'member',
          user: { id: 'user-2', email: 'member@test.com', firstName: 'Member', lastName: 'User' },
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: mockMembers },
      });

      const result = await organizationsService.getMembers('org-123');

      expect(apiClient.get).toHaveBeenCalledWith('/organizations/org-123/members');
      expect(result).toEqual(mockMembers);
    });

    it('should return empty array if data is undefined', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: undefined },
      });

      const result = await organizationsService.getMembers('org-123');

      expect(result).toEqual([]);
    });
  });

  describe('updateMemberRole', () => {
    it('should call PATCH /organizations/:id/members/:userId with new role', async () => {
      const mockMember = {
        id: 'm-1',
        userId: 'user-123',
        role: 'admin',
        user: { id: 'user-123', email: 'test@test.com', firstName: 'Test', lastName: 'User' },
      };

      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { success: true, data: mockMember },
      });

      const result = await organizationsService.updateMemberRole('org-123', 'user-123', 'admin');

      expect(apiClient.patch).toHaveBeenCalledWith('/organizations/org-123/members/user-123', {
        role: 'admin',
      });
      expect(result).toEqual(mockMember);
    });
  });

  describe('removeMember', () => {
    it('should call DELETE /organizations/:id/members/:userId', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({
        data: { success: true },
      });

      await organizationsService.removeMember('org-123', 'user-456');

      expect(apiClient.delete).toHaveBeenCalledWith('/organizations/org-123/members/user-456');
    });
  });

  describe('leaveOrganization', () => {
    it('should call POST /organizations/:id/leave', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true },
      });

      await organizationsService.leaveOrganization('org-123');

      expect(apiClient.post).toHaveBeenCalledWith('/organizations/org-123/leave');
    });
  });
});
