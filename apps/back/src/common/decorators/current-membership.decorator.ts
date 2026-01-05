import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { OrganizationMember } from '@prisma/client';

export const CurrentMembership = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): OrganizationMember => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.currentMembership) {
      throw new ForbiddenException('Membership context not found');
    }
    return request.currentMembership;
  },
);
