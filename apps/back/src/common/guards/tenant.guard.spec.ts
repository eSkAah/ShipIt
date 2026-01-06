import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, BadRequestException, ForbiddenException } from '@nestjs/common';
import { TenantGuard } from './tenant.guard';
import { PrismaService } from '../../database/prisma.service';

describe('TenantGuard', () => {
  let guard: TenantGuard;
  let _prismaService: PrismaService;

  const mockPrismaService = {
    organizationMember: {
      findUnique: jest.fn(),
    },
  };

  const createMockExecutionContext = (request: Record<string, unknown>): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => request,
      }),
      getHandler: () => jest.fn(),
      getClass: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TenantGuard,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    guard = module.get<TenantGuard>(TenantGuard);
    _prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should throw ForbiddenException if user is not authenticated', async () => {
      const context = createMockExecutionContext({
        user: null,
        headers: { 'x-organization-id': 'org-123' },
        params: {},
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow('User not authenticated');
    });

    it('should throw BadRequestException if X-Organization-Id header is missing', async () => {
      const context = createMockExecutionContext({
        user: { id: 'user-123' },
        headers: {},
        params: {},
      });

      await expect(guard.canActivate(context)).rejects.toThrow(BadRequestException);
      await expect(guard.canActivate(context)).rejects.toThrow('Organization ID is required');
    });

    it('should accept organization ID from X-Organization-Id header', async () => {
      const mockMembership = {
        id: 'membership-123',
        userId: 'user-123',
        organizationId: 'org-123',
        role: 'admin',
        organization: {
          id: 'org-123',
          name: 'Test Org',
          slug: 'test-org',
        },
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);

      const request: Record<string, unknown> = {
        user: { id: 'user-123' },
        headers: { 'x-organization-id': 'org-123' },
        params: {},
      };
      const context = createMockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(request.currentOrganization).toEqual(mockMembership.organization);
      expect(request.currentMembership).toEqual(mockMembership);
    });

    it('should accept organization ID from route params (organizationId in params)', async () => {
      const mockMembership = {
        id: 'membership-123',
        userId: 'user-123',
        organizationId: 'org-456',
        role: 'member',
        organization: {
          id: 'org-456',
          name: 'Another Org',
          slug: 'another-org',
        },
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);

      const request: Record<string, unknown> = {
        user: { id: 'user-123' },
        headers: {},
        params: { organizationId: 'org-456' },
      };
      const context = createMockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      expect(mockPrismaService.organizationMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_organizationId: {
            userId: 'user-123',
            organizationId: 'org-456',
          },
        },
        include: {
          organization: true,
        },
      });
    });

    it('should accept organization ID from route params (organizationId)', async () => {
      const mockMembership = {
        id: 'membership-123',
        userId: 'user-123',
        organizationId: 'org-789',
        role: 'viewer',
        organization: {
          id: 'org-789',
          name: 'Third Org',
          slug: 'third-org',
        },
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);

      const request: Record<string, unknown> = {
        user: { id: 'user-123' },
        headers: {},
        params: { organizationId: 'org-789' },
      };
      const context = createMockExecutionContext(request);

      const result = await guard.canActivate(context);

      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user is not a member of the organization', async () => {
      mockPrismaService.organizationMember.findUnique.mockResolvedValue(null);

      const context = createMockExecutionContext({
        user: { id: 'user-123' },
        headers: { 'x-organization-id': 'org-123' },
        params: {},
      });

      await expect(guard.canActivate(context)).rejects.toThrow(ForbiddenException);
      await expect(guard.canActivate(context)).rejects.toThrow(
        'You are not a member of this organization',
      );
    });

    it('should attach organization and membership to request when valid', async () => {
      const mockOrganization = {
        id: 'org-123',
        name: 'Test Org',
        slug: 'test-org',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockMembership = {
        id: 'membership-123',
        userId: 'user-123',
        organizationId: 'org-123',
        role: 'admin',
        organization: mockOrganization,
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);

      const request: Record<string, unknown> = {
        user: { id: 'user-123' },
        headers: { 'x-organization-id': 'org-123' },
        params: {},
      };
      const context = createMockExecutionContext(request);

      await guard.canActivate(context);

      expect(request.currentOrganization).toEqual(mockOrganization);
      expect(request.currentMembership).toEqual(mockMembership);
    });

    it('should prioritize X-Organization-Id header over route params', async () => {
      const mockMembership = {
        id: 'membership-123',
        userId: 'user-123',
        organizationId: 'header-org',
        role: 'admin',
        organization: {
          id: 'header-org',
          name: 'Header Org',
          slug: 'header-org',
        },
      };

      mockPrismaService.organizationMember.findUnique.mockResolvedValue(mockMembership);

      const request: Record<string, unknown> = {
        user: { id: 'user-123' },
        headers: { 'x-organization-id': 'header-org' },
        params: { id: 'params-org' },
      };
      const context = createMockExecutionContext(request);

      await guard.canActivate(context);

      expect(mockPrismaService.organizationMember.findUnique).toHaveBeenCalledWith({
        where: {
          userId_organizationId: {
            userId: 'user-123',
            organizationId: 'header-org',
          },
        },
        include: {
          organization: true,
        },
      });
    });
  });
});
