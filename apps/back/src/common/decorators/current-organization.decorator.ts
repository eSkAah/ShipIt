import { createParamDecorator, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Organization } from '@prisma/client';

export const CurrentOrganization = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): Organization => {
    const request = ctx.switchToHttp().getRequest();
    if (!request.currentOrganization) {
      throw new ForbiddenException('Organization context not found');
    }
    return request.currentOrganization;
  },
);
