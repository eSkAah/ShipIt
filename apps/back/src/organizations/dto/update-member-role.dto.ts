import {
  updateMemberRoleSchema,
  UpdateMemberRoleDto as UpdateMemberRoleDtoType,
} from '@shipit/validators';
import { Role } from '@prisma/client';

export class UpdateMemberRoleDto implements UpdateMemberRoleDtoType {
  role!: Role;
}

export { updateMemberRoleSchema };
