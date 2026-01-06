import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { User, Organization } from '@prisma/client';
import { SessionGuard } from '../common/guards/session.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../common/decorators/current-organization.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto, createOrganizationSchema } from './dto/create-organization.dto';
import { UpdateOrganizationDto, updateOrganizationSchema } from './dto/update-organization.dto';
import { UpdateMemberRoleDto, updateMemberRoleSchema } from './dto/update-member-role.dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';

@Controller('organizations')
export class OrganizationsController {
  constructor(private organizationsService: OrganizationsService) {}

  @Get()
  @UseGuards(SessionGuard)
  async getMyOrganizations(@CurrentUser() user: User) {
    const organizations = await this.organizationsService.getUserOrganizations(user.id);
    return { success: true, data: organizations };
  }

  @Post()
  @UseGuards(SessionGuard)
  async create(
    @Body(new ZodValidationPipe(createOrganizationSchema)) dto: CreateOrganizationDto,
    @CurrentUser() user: User,
  ) {
    const organization = await this.organizationsService.create(dto, user);
    return { success: true, data: organization };
  }

  @Get(':id')
  @UseGuards(SessionGuard, TenantGuard)
  async findOne(@CurrentOrganization() organization: Organization) {
    const fullOrg = await this.organizationsService.findById(organization.id);
    return { success: true, data: fullOrg };
  }

  @Patch(':id')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  async update(
    @CurrentOrganization() organization: Organization,
    @Body(new ZodValidationPipe(updateOrganizationSchema)) dto: UpdateOrganizationDto,
  ) {
    const updated = await this.organizationsService.update(organization.id, dto);
    return { success: true, data: updated };
  }

  @Delete(':id')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentOrganization() organization: Organization, @CurrentUser() user: User) {
    await this.organizationsService.delete(organization.id, user.id);
  }

  @Get(':id/members')
  @UseGuards(SessionGuard, TenantGuard)
  async getMembers(@CurrentOrganization() organization: Organization) {
    const members = await this.organizationsService.getMembers(organization.id);
    return { success: true, data: members };
  }

  @Patch(':id/members/:userId')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  async updateMemberRole(
    @CurrentOrganization() organization: Organization,
    @Param('userId') targetUserId: string,
    @Body(new ZodValidationPipe(updateMemberRoleSchema)) dto: UpdateMemberRoleDto,
    @CurrentUser() user: User,
  ) {
    const member = await this.organizationsService.updateMemberRole(
      organization.id,
      targetUserId,
      dto.role,
      user.id,
    );
    return { success: true, data: member };
  }

  @Delete(':id/members/:userId')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.OK)
  async removeMember(
    @CurrentOrganization() organization: Organization,
    @Param('userId') targetUserId: string,
    @CurrentUser() user: User,
  ) {
    await this.organizationsService.removeMember(organization.id, targetUserId, user.id);
    return { success: true };
  }

  @Post(':id/leave')
  @UseGuards(SessionGuard, TenantGuard)
  @HttpCode(HttpStatus.OK)
  async leaveOrganization(
    @CurrentOrganization() organization: Organization,
    @CurrentUser() user: User,
  ) {
    await this.organizationsService.leaveOrganization(organization.id, user.id);
    return { success: true };
  }

  @Post(':id/logo')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  @UseInterceptors(FileInterceptor('logo'))
  async uploadLogo(
    @CurrentOrganization() organization: Organization,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
  ) {
    const result = await this.organizationsService.uploadLogo(organization.id, file);
    return { success: true, data: result };
  }

  @Delete(':id/logo')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLogo(@CurrentOrganization() organization: Organization) {
    await this.organizationsService.deleteLogo(organization.id);
  }
}
