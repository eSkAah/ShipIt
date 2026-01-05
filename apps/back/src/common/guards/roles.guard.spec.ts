import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

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
        RolesGuard,
        {
          provide: Reflector,
          useValue: {
            getAllAndOverride: jest.fn(),
          },
        },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('canActivate', () => {
    it('should return true if no roles are required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

      const context = createMockExecutionContext({
        currentMembership: { role: 'viewer' },
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should return true if roles array is empty', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([]);

      const context = createMockExecutionContext({
        currentMembership: { role: 'viewer' },
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should throw ForbiddenException if membership context is not found', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = createMockExecutionContext({
        currentMembership: null,
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Membership context not found');
    });

    it('should allow admin when admin role is required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'admin' },
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny member when admin role is required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'member' },
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
      expect(() => guard.canActivate(context)).toThrow('Insufficient permissions');
    });

    it('should deny viewer when admin role is required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'viewer' },
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow member when member role is required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['member']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'member' },
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow admin when member role is required (higher privilege)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['member']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'admin' },
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should deny viewer when member role is required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['member']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'viewer' },
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should allow viewer when viewer role is required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['viewer']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'viewer' },
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow member when viewer role is required (higher privilege)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['viewer']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'member' },
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow admin when viewer role is required (higher privilege)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['viewer']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'admin' },
      });

      expect(guard.canActivate(context)).toBe(true);
    });

    it('should allow when user has any of multiple required roles (admin OR member)', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'member']);

      const adminContext = createMockExecutionContext({
        currentMembership: { role: 'admin' },
      });
      expect(guard.canActivate(adminContext)).toBe(true);

      const memberContext = createMockExecutionContext({
        currentMembership: { role: 'member' },
      });
      expect(guard.canActivate(memberContext)).toBe(true);
    });

    it('should deny viewer when admin OR member is required', () => {
      jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(['admin', 'member']);

      const context = createMockExecutionContext({
        currentMembership: { role: 'viewer' },
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('should use reflector to get roles from ROLES_KEY', () => {
      const getAllAndOverrideSpy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(null);

      const context = createMockExecutionContext({
        currentMembership: { role: 'viewer' },
      });

      guard.canActivate(context);

      expect(getAllAndOverrideSpy).toHaveBeenCalledWith(ROLES_KEY, [
        expect.any(Function),
        expect.any(Function),
      ]);
    });
  });
});
