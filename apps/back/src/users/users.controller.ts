import {
  Controller,
  Get,
  Patch,
  Post,
  Delete,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { SessionGuard } from '../common/guards/session.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';
import { UpdateProfileDto, updateProfileSchema } from './dto/update-profile.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(SessionGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.usersService.getProfile(user.id);
    return {
      success: true,
      data: profile,
    };
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiResponse({ status: 200, description: 'Profile updated successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(updateProfileSchema)) dto: UpdateProfileDto,
  ) {
    const updatedUser = await this.usersService.updateProfile(user.id, dto);
    return {
      success: true,
      data: updatedUser,
    };
  }

  @Post('me/avatar')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar uploaded successfully' })
  @ApiResponse({ status: 400, description: 'Invalid file type or size' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async uploadAvatar(@CurrentUser() user: User, @UploadedFile() file: Express.Multer.File) {
    const result = await this.usersService.uploadAvatar(user.id, file);
    return {
      success: true,
      data: result,
    };
  }

  @Delete('me/avatar')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user avatar' })
  @ApiResponse({ status: 200, description: 'Avatar deleted successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async deleteAvatar(@CurrentUser() user: User) {
    await this.usersService.deleteAvatar(user.id);
    return {
      success: true,
      message: 'Avatar deleted successfully',
    };
  }
}
