import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Language } from '@prisma/client';
import { ConfigService } from '../config/config.service';

interface VerificationEmailData {
  token: string;
  verificationUrl: string;
}

interface ResetPasswordEmailData {
  token: string;
  resetUrl: string;
}

interface WelcomeEmailData {
  firstName: string;
}

interface InvitationEmailData {
  token: string;
  invitationUrl: string;
  organizationName: string;
  role: string;
}

export type EmailJobData =
  | { type: 'verification'; data: VerificationEmailData }
  | { type: 'reset-password'; data: ResetPasswordEmailData }
  | { type: 'welcome'; data: WelcomeEmailData }
  | { type: 'invitation'; data: InvitationEmailData };

export interface EmailJob {
  type: 'verification' | 'reset-password' | 'welcome' | 'invitation';
  to: string;
  data: VerificationEmailData | ResetPasswordEmailData | WelcomeEmailData | InvitationEmailData;
  language: Language;
}

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    private readonly configService: ConfigService,
  ) {}

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
        verificationUrl: `${this.configService.frontendUrl}/verify-email?token=${token}`,
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
        resetUrl: `${this.configService.frontendUrl}/reset-password?token=${token}`,
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
        invitationUrl: `${this.configService.frontendUrl}/invitations/${token}/accept`,
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
