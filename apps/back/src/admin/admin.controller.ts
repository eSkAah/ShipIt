import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { UsersQueryDto, OrganizationsQueryDto, LogsQueryDto } from './dto';
import { SessionGuard, SuperAdminGuard } from '../common/guards';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(SessionGuard, SuperAdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get platform statistics' })
  async getStats() {
    const stats = await this.adminService.getStats();
    return { success: true, data: stats };
  }

  @Get('users')
  @ApiOperation({ summary: 'Get all users with pagination' })
  async getUsers(@Query() query: UsersQueryDto) {
    const result = await this.adminService.getUsers(query);
    return { success: true, ...result };
  }

  @Get('organizations')
  @ApiOperation({ summary: 'Get all organizations with pagination' })
  async getOrganizations(@Query() query: OrganizationsQueryDto) {
    const result = await this.adminService.getOrganizations(query);
    return { success: true, ...result };
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get application logs with pagination' })
  async getLogs(@Query() query: LogsQueryDto) {
    const result = await this.adminService.getLogs(query);
    return { success: true, ...result };
  }
}
