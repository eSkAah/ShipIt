import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

const ROLE_HIERARCHY: Record<Role, number> = {
  admin: 3,
  member: 2,
  viewer: 1,
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const membership = request.currentMembership;

    if (!membership) {
      throw new ForbiddenException('Membership context not found');
    }

    const userRoleLevel = ROLE_HIERARCHY[membership.role as Role];
    const minRequiredLevel = Math.min(...requiredRoles.map((role) => ROLE_HIERARCHY[role]));

    if (userRoleLevel < minRequiredLevel) {
      throw new ForbiddenException('Insufficient permissions');
    }

    return true;
  }
}
