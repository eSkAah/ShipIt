import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { User, Organization } from '@prisma/client';
import { SessionGuard } from '../common/guards/session.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../common/decorators/current-organization.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { InvitationsService } from './invitations.service';
import { CreateInvitationDto, inviteMemberSchema } from './dto/create-invitation.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller()
export class InvitationsController {
  constructor(private invitationsService: InvitationsService) {}

  @Post('organizations/:id/invitations')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  async create(
    @Body(new ZodValidationPipe(inviteMemberSchema)) dto: CreateInvitationDto,
    @CurrentOrganization() organization: Organization,
    @CurrentUser() user: User,
  ) {
    const invitation = await this.invitationsService.create(dto, organization, user);
    return { success: true, data: invitation };
  }

  @Get('organizations/:id/invitations')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  async getOrganizationInvitations(@CurrentOrganization() organization: Organization) {
    const invitations = await this.invitationsService.getOrganizationInvitations(organization.id);
    return { success: true, data: invitations };
  }

  @Delete('invitations/:invitationId')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param('invitationId') invitationId: string,
    @CurrentOrganization() organization: Organization,
  ) {
    await this.invitationsService.cancelInvitation(invitationId, organization.id);
    return { success: true };
  }

  @Get('invitations/:token')
  @Public()
  async getByToken(@Param('token') token: string) {
    const invitation = await this.invitationsService.getByToken(token);
    return { success: true, data: invitation };
  }

  @Post('invitations/:token/accept')
  @UseGuards(SessionGuard)
  @HttpCode(HttpStatus.OK)
  async accept(@Param('token') token: string, @CurrentUser() user: User) {
    const result = await this.invitationsService.accept(token, user);
    return { success: true, data: result };
  }
}
