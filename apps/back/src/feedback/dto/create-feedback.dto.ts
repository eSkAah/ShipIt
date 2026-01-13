import { ApiProperty } from '@nestjs/swagger';
import { FeedbackType } from '@prisma/client';

export class CreateFeedbackDto {
  @ApiProperty({ enum: ['bug', 'help'], example: 'bug' })
  type: FeedbackType;

  @ApiProperty({ example: 'Button not working on settings page' })
  subject: string;

  @ApiProperty({ example: 'When I click the save button on the settings page, nothing happens...' })
  message: string;
}
