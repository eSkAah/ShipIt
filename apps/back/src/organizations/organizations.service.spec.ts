import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import { PrismaService } from '../database/prisma.service';
import { User, Role } from '@prisma/client';

describe('OrganizationsService', () => {
  let service: OrganizationsService;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    organization: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    organizationMember: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockUser: User = {
    id: 'user-123',
    email: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    avatarUrl: null,
    language: 'en',
    theme: 'system',
    isSuperAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrganizationsService>(OrganizationsService);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserOrganizations', () => {
    it('should return user organizations with roles', async () => {
      const mockMemberships = [
        {
          id: 'membership-1',
          userId: 'user-123',
          organizationId: 'org-1',
          role: 'admin',
          organization: {
            id: 'org-1',
            name: 'Org 1',
            slug: 'org-1',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
        {
          id: 'membership-2',
          userId: 'user-123',
          organizationId: 'org-2',
          role: 'member',
          organization: {
            id: 'org-2',
            name: 'Org 2',
            slug: 'org-2',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      ];

      mockPrismaService.organizationMember.findMany.mockResolvedValue(mockMemberships);

      const result = await service.getUserOrganizations('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        ...mockMemberships[0].organization,
        role: 'admin',
        membershipId: 'membership-1',
      });
      expect(result[1]).toEqual({
        ...mockMemberships[1].organization,
        role: 'member',
        membershipId: 'membership-2',
      });
    });

    it('should return empty array if user has no organizations', async () => {
      mockPrismaService.organizationMember.findMany.mockResolvedValue([]);

      const result = await service.getUserOrganizations('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('create', () => {
    it('should create organization with admin membership', async () => {
      const createdOrg = {
        id: 'org-123',
        name: 'New Org',
        slug: 'new-org',
        members: [
          {
            id: 'membership-123',
            userId: 'user-123',
            role: 'admin',
            user: {
              id: 'user-123',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              avatarUrl: null,
            },
          },
        ],
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(null);
      mockPrismaService.organization.create.mockResolvedValue(createdOrg);

      const result = await service.create({ name: 'New Org' }, mockUser);

      expect(result).toEqual(createdOrg);
      expect(mockPrismaService.organization.create).toHaveBeenCalledWith({
        data: {
          name: 'New Org',
          slug: 'new-org',
          members: {
            create: {
              userId: 'user-123',
              role: 'admin',
            },
          },
        },
        include: {
          members: {
            include: {
              user: {
                select: {
                  id: true,
                  email: true,
                  firstName: true,
                  lastName: true,
                  avatarUrl: true,
                },
              },
            },
          },
        },
      });
    });

    it('should generate unique slug if slug already exists', async () => {
      mockPrismaService.organization.findUnique
        .mockResolvedValueOnce({ id: 'existing-org', slug: 'test-org' })
        .mockResolvedValueOnce(null);

      mockPrismaService.organization.create.mockResolvedValue({
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org-1',
        members: [],
      });

      await service.create({ name: 'Test Org' }, mockUser);

      expect(mockPrismaService.organization.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            slug: 'test-org-1',
          }),
        }),
      );
    });
  });

  describe('findById', () => {
    it('should return organization with members', async () => {
      const mockOrg = {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        members: [
          {
            id: 'membership-1',
            user: {
              id: 'user-123',
              email: 'test@example.com',
              firstName: 'Test',
              lastName: 'User',
              avatarUrl: null,
            },
          },
        ],
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);

      const result = await service.findById('org-123');

      expect(result).toEqual(mockOrg);
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.findById('non-existent')).rejects.toThrow(NotFoundException);
      await expect(service.findById('non-existent')).rejects.toThrow('Organization not found');
    });
  });

  describe('update', () => {
    it('should update organization name and slug', async () => {
      const existingOrg = {
        id: 'org-123',
        name: 'Old Name',
        slug: 'old-name',
      };

      mockPrismaService.organization.findUnique
        .mockResolvedValueOnce(existingOrg)
        .mockResolvedValueOnce(null);

      mockPrismaService.organization.update.mockResolvedValue({
        id: 'org-123',
        name: 'New Name',
        slug: 'new-name',
      });

      const result = await service.update('org-123', { name: 'New Name' });

      expect(result.name).toBe('New Name');
      expect(result.slug).toBe('new-name');
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.update('non-existent', { name: 'Test' })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('delete', () => {
    it('should delete organization and all members', async () => {
      const mockOrg = {
        id: 'org-123',
        name: 'Test Org',
        members: [{ id: 'member-1' }],
      };

      mockPrismaService.organization.findUnique.mockResolvedValue(mockOrg);
      mockPrismaService.organizationMember.findMany.mockResolvedValue([
        { id: 'membership-1', organizationId: 'org-123' },
        { id: 'membership-2', organizationId: 'org-456' },
      ]);
      mockPrismaService.organization.delete.mockResolvedValue(mockOrg);

      await service.delete('org-123', 'user-123');

      expect(mockPrismaService.organization.delete).toHaveBeenCalledWith({
        where: { id: 'org-123' },
      });
    });

    it('should throw NotFoundException if organization not found', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue(null);

      await expect(service.delete('non-existent', 'user-123')).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if trying to delete only organization', async () => {
      mockPrismaService.organization.findUnique.mockResolvedValue({
        id: 'org-123',
        members: [],
      });
      mockPrismaService.organizationMember.findMany.mockResolvedValue([
        { id: 'membership-1', organizationId: 'org-123' },
      ]);

      await expect(service.delete('org-123', 'user-123')).rejects.toThrow(ForbiddenException);
      await expect(service.delete('org-123', 'user-123')).rejects.toThrow(
        'Cannot delete your only organization',
      );
    });
  });

  describe('getMembers', () => {
    it('should return list of members with user info', async () => {
      const mockMembers = [
        {
          id: 'membership-1',
          userId: 'user-1',
          role: 'admin',
          user: {
            id: 'user-1',
            email: 'admin@example.com',
            firstName: 'Admin',
            lastName: 'User',
            avatarUrl: null,
          },
        },
        {
          id: 'membership-2',
          userId: 'user-2',
          role: 'member',
          user: {
            id: 'user-2',
            email: 'member@example.com',
            firstName: 'Member',
            lastName: 'User',
            avatarUrl: null,
          },
        },
      ];

      mockPrismaService.organizationMember.findMany.mockResolvedValue(mockMembers);

      const result = await service.getMembers('org-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 'membership-1',
        userId: 'user-1',
        role: 'admin',
        user: mockMembers[0].user,
      });
    });
  });

  describe('updateMemberRole', () => {
    it('should update member role', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId: 'user-2',
        organizationId: 'org-123',
        role: 'member',
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.organizationMember.count.mockResolvedValue(2);
      mockPrismaService.organizationMember.update.mockResolvedValue({
        ...mockMembership,
        role: 'admin',
        user: {
          id: 'user-2',
          email: 'test@example.com',
          firstName: 'Test',
          lastName: 'User',
          avatarUrl: null,
        },
      });

      const result = await service.updateMemberRole('org-123', 'user-2', 'admin' as Role, 'user-1');

      expect(result.role).toBe('admin');
    });

    it('should throw ForbiddenException when trying to change own role', async () => {
      await expect(
        service.updateMemberRole('org-123', 'user-1', 'member' as Role, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateMemberRole('org-123', 'user-1', 'member' as Role, 'user-1'),
      ).rejects.toThrow('Cannot change your own role');
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.organizationMember.findUnique.mockResolvedValue(null);

      await expect(
        service.updateMemberRole('org-123', 'user-2', 'admin' as Role, 'user-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when demoting last admin', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId: 'user-2',
        organizationId: 'org-123',
        role: 'admin',
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.organizationMember.count.mockResolvedValue(1);

      await expect(
        service.updateMemberRole('org-123', 'user-2', 'member' as Role, 'user-1'),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        service.updateMemberRole('org-123', 'user-2', 'member' as Role, 'user-1'),
      ).rejects.toThrow('Organization must have at least one admin');
    });
  });

  describe('removeMember', () => {
    it('should remove member from organization', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId: 'user-2',
        organizationId: 'org-123',
        role: 'member',
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.organizationMember.delete.mockResolvedValue(mockMembership);

      const result = await service.removeMember('org-123', 'user-2', 'user-1');

      expect(result).toEqual({ success: true });
    });

    it('should throw ForbiddenException when trying to remove yourself', async () => {
      await expect(service.removeMember('org-123', 'user-1', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.removeMember('org-123', 'user-1', 'user-1')).rejects.toThrow(
        'Cannot remove yourself',
      );
    });

    it('should throw NotFoundException if member not found', async () => {
      mockPrismaService.organizationMember.findUnique.mockResolvedValue(null);

      await expect(service.removeMember('org-123', 'user-2', 'user-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException when removing last admin', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId: 'user-2',
        organizationId: 'org-123',
        role: 'admin',
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.organizationMember.count.mockResolvedValue(1);

      await expect(service.removeMember('org-123', 'user-2', 'user-1')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.removeMember('org-123', 'user-2', 'user-1')).rejects.toThrow(
        'Cannot remove the last admin',
      );
    });
  });

  describe('leaveOrganization', () => {
    it('should allow user to leave organization', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId: 'user-123',
        organizationId: 'org-123',
        role: 'member',
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.organizationMember.findMany.mockResolvedValue([
        { id: 'membership-1', organizationId: 'org-123' },
        { id: 'membership-2', organizationId: 'org-456' },
      ]);
      mockPrismaService.organizationMember.delete.mockResolvedValue(mockMembership);

      const result = await service.leaveOrganization('org-123', 'user-123');

      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if user is not a member', async () => {
      mockPrismaService.organizationMember.findUnique.mockResolvedValue(null);

      await expect(service.leaveOrganization('org-123', 'user-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ForbiddenException if leaving only organization', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId: 'user-123',
        organizationId: 'org-123',
        role: 'member',
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.organizationMember.findMany.mockResolvedValue([
        { id: 'membership-1', organizationId: 'org-123' },
      ]);

      await expect(service.leaveOrganization('org-123', 'user-123')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.leaveOrganization('org-123', 'user-123')).rejects.toThrow(
        'Cannot leave your only organization',
      );
    });

    it('should throw ForbiddenException if leaving as last admin', async () => {
      const mockMembership = {
        id: 'membership-1',
        userId: 'user-123',
        organizationId: 'org-123',
        role: 'admin',
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);
      mockPrismaService.organizationMember.findMany.mockResolvedValue([
        { id: 'membership-1', organizationId: 'org-123' },
        { id: 'membership-2', organizationId: 'org-456' },
      ]);
      mockPrismaService.organizationMember.count.mockResolvedValue(1);

      await expect(service.leaveOrganization('org-123', 'user-123')).rejects.toThrow(
        ForbiddenException,
      );
      await expect(service.leaveOrganization('org-123', 'user-123')).rejects.toThrow(
        'Cannot leave as the last admin',
      );
    });
  });
});
