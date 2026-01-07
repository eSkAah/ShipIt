import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../database/prisma.service';

describe('AdminService', () => {
  let service: AdminService;

  const mockPrismaService = {
    user: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    organization: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    appLog: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  };

  const mockUsers = [
    {
      id: 'user-1',
      email: 'user1@example.com',
      firstName: 'User',
      lastName: 'One',
      avatarUrl: null,
      emailVerified: true,
      isSuperAdmin: false,
      createdAt: new Date('2024-01-01'),
      memberships: [
        {
          id: 'membership-1',
          role: 'admin',
          organization: { id: 'org-1', name: 'Org One' },
        },
      ],
    },
    {
      id: 'user-2',
      email: 'user2@example.com',
      firstName: 'User',
      lastName: 'Two',
      avatarUrl: 'https://example.com/avatar.jpg',
      emailVerified: false,
      isSuperAdmin: true,
      createdAt: new Date('2024-01-02'),
      memberships: [],
    },
  ];

  const mockOrganizations = [
    {
      id: 'org-1',
      name: 'Organization One',
      slug: 'org-one',
      logoUrl: null,
      subscriptionTier: 'free',
      subscriptionStatus: 'active',
      createdAt: new Date('2024-01-01'),
      _count: { members: 5 },
    },
    {
      id: 'org-2',
      name: 'Organization Two',
      slug: 'org-two',
      logoUrl: 'https://example.com/logo.png',
      subscriptionTier: 'premium',
      subscriptionStatus: 'active',
      createdAt: new Date('2024-01-02'),
      _count: { members: 10 },
    },
  ];

  const mockLogs = [
    {
      id: 'log-1',
      level: 'info',
      message: 'User logged in',
      context: { userId: 'user-1' },
      timestamp: new Date('2024-01-01T10:00:00Z'),
      correlationId: 'corr-123',
    },
    {
      id: 'log-2',
      level: 'error',
      message: 'Failed to process request',
      context: { error: 'Connection timeout' },
      timestamp: new Date('2024-01-01T11:00:00Z'),
      correlationId: 'corr-456',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUsers', () => {
    it('should return paginated users list', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.getUsers({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should use default pagination values', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      await service.getUsers({});

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 0,
          take: 10,
        }),
      );
    });

    it('should calculate correct skip value for pagination', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([]);
      mockPrismaService.user.count.mockResolvedValue(25);

      await service.getUsers({ page: 3, limit: 10 });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        }),
      );
    });

    it('should filter users by search term', async () => {
      mockPrismaService.user.findMany.mockResolvedValue([mockUsers[0]]);
      mockPrismaService.user.count.mockResolvedValue(1);

      await service.getUsers({ search: 'user1' });

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { email: { contains: 'user1', mode: 'insensitive' } },
              { firstName: { contains: 'user1', mode: 'insensitive' } },
              { lastName: { contains: 'user1', mode: 'insensitive' } },
            ],
          },
        }),
      );
    });

    it('should return users with memberships and organizations', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      const result = await service.getUsers({});

      expect(result.data[0].memberships).toBeDefined();
      expect(result.data[0].memberships[0].organization).toBeDefined();
    });

    it('should order users by createdAt descending', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(2);

      await service.getUsers({});

      expect(mockPrismaService.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });

    it('should calculate correct totalPages', async () => {
      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(25);

      const result = await service.getUsers({ page: 1, limit: 10 });

      expect(result.pagination.totalPages).toBe(3);
    });
  });

  describe('getOrganizations', () => {
    it('should return paginated organizations list', async () => {
      mockPrismaService.organization.findMany.mockResolvedValue(mockOrganizations);
      mockPrismaService.organization.count.mockResolvedValue(2);

      const result = await service.getOrganizations({ page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
      });
    });

    it('should transform _count to memberCount', async () => {
      mockPrismaService.organization.findMany.mockResolvedValue(mockOrganizations);
      mockPrismaService.organization.count.mockResolvedValue(2);

      const result = await service.getOrganizations({});

      expect(result.data[0].memberCount).toBe(5);
      expect(result.data[0]._count).toBeUndefined();
      expect(result.data[1].memberCount).toBe(10);
    });

    it('should filter organizations by search term', async () => {
      mockPrismaService.organization.findMany.mockResolvedValue([mockOrganizations[0]]);
      mockPrismaService.organization.count.mockResolvedValue(1);

      await service.getOrganizations({ search: 'one' });

      expect(mockPrismaService.organization.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { name: { contains: 'one', mode: 'insensitive' } },
              { slug: { contains: 'one', mode: 'insensitive' } },
            ],
          }),
        }),
      );
    });

    it('should filter organizations by subscription tier', async () => {
      mockPrismaService.organization.findMany.mockResolvedValue([mockOrganizations[1]]);
      mockPrismaService.organization.count.mockResolvedValue(1);

      await service.getOrganizations({ tier: 'premium' });

      expect(mockPrismaService.organization.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            subscriptionTier: 'premium',
          }),
        }),
      );
    });

    it('should combine search and tier filters', async () => {
      mockPrismaService.organization.findMany.mockResolvedValue([]);
      mockPrismaService.organization.count.mockResolvedValue(0);

      await service.getOrganizations({ search: 'test', tier: 'free' });

      expect(mockPrismaService.organization.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.any(Array),
            subscriptionTier: 'free',
          }),
        }),
      );
    });

    it('should order organizations by createdAt descending', async () => {
      mockPrismaService.organization.findMany.mockResolvedValue(mockOrganizations);
      mockPrismaService.organization.count.mockResolvedValue(2);

      await service.getOrganizations({});

      expect(mockPrismaService.organization.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        }),
      );
    });
  });

  describe('getLogs', () => {
    it('should return paginated logs list', async () => {
      mockPrismaService.appLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.appLog.count.mockResolvedValue(2);

      const result = await service.getLogs({ page: 1, limit: 50 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination).toEqual({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should use default limit of 50 for logs', async () => {
      mockPrismaService.appLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.appLog.count.mockResolvedValue(2);

      await service.getLogs({});

      expect(mockPrismaService.appLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 50,
        }),
      );
    });

    it('should filter logs by search term in message', async () => {
      mockPrismaService.appLog.findMany.mockResolvedValue([mockLogs[0]]);
      mockPrismaService.appLog.count.mockResolvedValue(1);

      await service.getLogs({ search: 'logged in' });

      expect(mockPrismaService.appLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            message: { contains: 'logged in', mode: 'insensitive' },
          }),
        }),
      );
    });

    it('should filter logs by level', async () => {
      mockPrismaService.appLog.findMany.mockResolvedValue([mockLogs[1]]);
      mockPrismaService.appLog.count.mockResolvedValue(1);

      await service.getLogs({ level: 'error' });

      expect(mockPrismaService.appLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            level: 'error',
          }),
        }),
      );
    });

    it('should order logs by timestamp descending', async () => {
      mockPrismaService.appLog.findMany.mockResolvedValue(mockLogs);
      mockPrismaService.appLog.count.mockResolvedValue(2);

      await service.getLogs({});

      expect(mockPrismaService.appLog.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { timestamp: 'desc' },
        }),
      );
    });
  });

  describe('getStats', () => {
    it('should return platform statistics', async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(100) // totalUsers
        .mockResolvedValueOnce(85); // verifiedUsers
      mockPrismaService.organization.count
        .mockResolvedValueOnce(50) // totalOrganizations
        .mockResolvedValueOnce(10); // premiumOrgs

      const result = await service.getStats();

      expect(result).toEqual({
        totalUsers: 100,
        totalOrganizations: 50,
        verifiedUsers: 85,
        premiumOrgs: 10,
        freeOrgs: 40,
        unverifiedUsers: 15,
      });
    });

    it('should count verified users correctly', async () => {
      mockPrismaService.user.count.mockResolvedValueOnce(100).mockResolvedValueOnce(85);
      mockPrismaService.organization.count.mockResolvedValueOnce(50).mockResolvedValueOnce(10);

      await service.getStats();

      expect(mockPrismaService.user.count).toHaveBeenNthCalledWith(2, {
        where: { emailVerified: true },
      });
    });

    it('should count premium organizations correctly', async () => {
      mockPrismaService.user.count.mockResolvedValueOnce(100).mockResolvedValueOnce(85);
      mockPrismaService.organization.count.mockResolvedValueOnce(50).mockResolvedValueOnce(10);

      await service.getStats();

      expect(mockPrismaService.organization.count).toHaveBeenNthCalledWith(2, {
        where: { subscriptionTier: 'premium' },
      });
    });

    it('should calculate derived stats correctly', async () => {
      mockPrismaService.user.count
        .mockResolvedValueOnce(200) // totalUsers
        .mockResolvedValueOnce(150); // verifiedUsers
      mockPrismaService.organization.count
        .mockResolvedValueOnce(80) // totalOrganizations
        .mockResolvedValueOnce(25); // premiumOrgs

      const result = await service.getStats();

      expect(result.freeOrgs).toBe(55); // 80 - 25
      expect(result.unverifiedUsers).toBe(50); // 200 - 150
    });

    it('should handle zero counts', async () => {
      mockPrismaService.user.count.mockResolvedValue(0);
      mockPrismaService.organization.count.mockResolvedValue(0);

      const result = await service.getStats();

      expect(result).toEqual({
        totalUsers: 0,
        totalOrganizations: 0,
        verifiedUsers: 0,
        premiumOrgs: 0,
        freeOrgs: 0,
        unverifiedUsers: 0,
      });
    });
  });
});
