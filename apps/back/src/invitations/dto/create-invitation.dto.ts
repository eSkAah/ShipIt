import { inviteMemberSchema, InviteMemberDto } from '@shipit/validators';

export class CreateInvitationDto implements InviteMemberDto {
  email!: string;
  role!: 'admin' | 'member' | 'viewer';
}

export { inviteMemberSchema };
