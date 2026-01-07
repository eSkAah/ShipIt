import { User, Organization, OrganizationMember } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      correlationId?: string;
      user?: User;
      currentOrganization?: Organization;
      currentMembership?: OrganizationMember;
    }
  }
}

export {};
