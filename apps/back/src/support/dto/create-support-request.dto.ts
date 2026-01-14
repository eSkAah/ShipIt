import { z } from 'zod';
import { ApiProperty } from '@nestjs/swagger';

export const createSupportRequestSchema = z.object({
  subject: z
    .string()
    .min(3, 'Subject must be at least 3 characters')
    .max(200, 'Subject must be at most 200 characters'),
  message: z
    .string()
    .min(10, 'Message must be at least 10 characters')
    .max(5000, 'Message must be at most 5000 characters'),
});

export type CreateSupportRequestDto = z.infer<typeof createSupportRequestSchema>;

export class CreateSupportRequestDtoSwagger {
  @ApiProperty({
    description: 'Subject of the support request',
    minLength: 3,
    maxLength: 200,
    example: 'Issue with billing',
  })
  subject!: string;

  @ApiProperty({
    description: 'Detailed message describing the issue or question',
    minLength: 10,
    maxLength: 5000,
    example: 'I am having trouble accessing my billing settings...',
  })
  message!: string;
}
