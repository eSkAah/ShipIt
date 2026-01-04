import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Language } from '@prisma/client';

export interface EmailJob {
  type: 'verification' | 'reset-password' | 'welcome' | 'invitation';
  to: string;
  data: Record<string, unknown>;
  language: Language;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendVerificationEmail(
    email: string,
    token: string,
    language: Language = Language.fr,
  ): Promise<void> {
    this.logger.log(`Queuing verification email for ${email}`);

    const job: EmailJob = {
      type: 'verification',
      to: email,
      data: {
        token,
        verificationUrl: `${process.env.FRONTEND_URL}/verify-email?token=${token}`,
      },
      language,
    };

    await this.emailQueue.add('send-email', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async sendPasswordResetEmail(
    email: string,
    token: string,
    language: Language = Language.fr,
  ): Promise<void> {
    this.logger.log(`Queuing password reset email for ${email}`);

    const job: EmailJob = {
      type: 'reset-password',
      to: email,
      data: {
        token,
        resetUrl: `${process.env.FRONTEND_URL}/reset-password?token=${token}`,
      },
      language,
    };

    await this.emailQueue.add('send-email', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async sendWelcomeEmail(
    email: string,
    firstName: string,
    language: Language = Language.fr,
  ): Promise<void> {
    this.logger.log(`Queuing welcome email for ${email}`);

    const job: EmailJob = {
      type: 'welcome',
      to: email,
      data: {
        firstName,
      },
      language,
    };

    await this.emailQueue.add('send-email', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }

  async sendInvitationEmail(
    email: string,
    token: string,
    organizationName: string,
    role: string,
    language: Language = Language.fr,
  ): Promise<void> {
    this.logger.log(`Queuing invitation email for ${email}`);

    const job: EmailJob = {
      type: 'invitation',
      to: email,
      data: {
        token,
        invitationUrl: `${process.env.FRONTEND_URL}/invitations/${token}/accept`,
        organizationName,
        role,
      },
      language,
    };

    await this.emailQueue.add('send-email', job, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
    });
  }
}
