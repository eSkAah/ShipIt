import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { User, Organization } from '@prisma/client';
import { SessionGuard } from '../common/guards/session.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CurrentOrganization } from '../common/decorators/current-organization.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { SupportService } from './support.service';
import {
  CreateSupportRequestDto,
  createSupportRequestSchema,
} from './dto/create-support-request.dto';

@ApiTags('support')
@Controller('support')
@UseGuards(SessionGuard, TenantGuard)
export class SupportController {
  constructor(private supportService: SupportService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new support request' })
  @ApiHeader({
    name: 'X-Organization-Id',
    description: 'Current organization ID',
    required: true,
  })
  @ApiResponse({ status: 201, description: 'Support request created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createSupportRequest(
    @CurrentUser() user: User,
    @CurrentOrganization() organization: Organization,
    @Body(new ZodValidationPipe(createSupportRequestSchema)) dto: CreateSupportRequestDto,
  ) {
    const supportRequest = await this.supportService.createSupportRequest(user, organization, dto);
    return {
      success: true,
      data: supportRequest,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Get user support request history' })
  @ApiHeader({
    name: 'X-Organization-Id',
    description: 'Current organization ID',
    required: true,
  })
  @ApiResponse({ status: 200, description: 'Support requests retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getSupportRequests(
    @CurrentUser() user: User,
    @CurrentOrganization() organization: Organization,
  ) {
    const requests = await this.supportService.getUserSupportRequests(user.id, organization.id);
    return {
      success: true,
      data: requests,
    };
  }
}
