import { Injectable, Logger } from '@nestjs/common';
import { FeedbackType, User } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';

export interface CreateFeedbackInput {
  type: FeedbackType;
  subject: string;
  message: string;
}

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async createFeedback(user: User, input: CreateFeedbackInput, organizationId?: string) {
    this.logger.log(`Creating feedback from user ${user.id}: ${input.type} - ${input.subject}`);

    const feedback = await this.prisma.feedback.create({
      data: {
        type: input.type,
        subject: input.subject,
        message: input.message,
        userId: user.id,
        organizationId: organizationId || null,
      },
    });

    await this.mailService.sendFeedbackNotificationEmail(
      user.email,
      `${user.firstName} ${user.lastName}`,
      input.type,
      input.subject,
      input.message,
      organizationId,
    );

    this.logger.log(`Feedback created with id ${feedback.id}`);

    return feedback;
  }
}
