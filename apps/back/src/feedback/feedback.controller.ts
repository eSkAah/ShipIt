import { Controller, Post, Body, UseGuards, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { User } from '@prisma/client';
import { createFeedbackSchema } from '@shipit/validators';
import { SessionGuard } from '../common/guards/session.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto';

@ApiTags('Feedback')
@ApiBearerAuth()
@Controller('feedback')
@UseGuards(SessionGuard)
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({ summary: 'Submit feedback (bug report or help request)' })
  @ApiResponse({ status: 201, description: 'Feedback submitted successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createFeedback(
    @CurrentUser() user: User,
    @Body(new ZodValidationPipe(createFeedbackSchema)) dto: CreateFeedbackDto,
    @Headers('x-organization-id') organizationId?: string,
  ) {
    const feedback = await this.feedbackService.createFeedback(user, dto, organizationId);
    return {
      success: true,
      data: feedback,
    };
  }
}
