import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { Resend } from 'resend';
import { ConfigService } from '../config/config.service';
import { EmailJob } from './mail.service';
import { renderVerificationEmail } from './templates/verification-email';
import { renderResetPasswordEmail } from './templates/reset-password-email';
import { renderWelcomeEmail } from './templates/welcome-email';
import { renderInvitationEmail } from './templates/invitation-email';

@Processor('email')
export class MailProcessor extends WorkerHost {
  private readonly logger = new Logger(MailProcessor.name);
  private resend: Resend;
  private fromEmail: string;

  constructor(private configService: ConfigService) {
    super();
    this.resend = new Resend(this.configService.resendApiKey);
    this.fromEmail = this.configService.fromEmail;
  }

  async process(job: Job<EmailJob>): Promise<void> {
    const { type, to, data, language } = job.data;

    this.logger.log(`Processing ${type} email for ${to}`);

    try {
      let html: string;
      let subject: string;

      switch (type) {
        case 'verification':
          html = renderVerificationEmail(data.verificationUrl, language);
          subject =
            language === 'fr' ? 'Vérifiez votre adresse email' : 'Verify your email address';
          break;

        case 'reset-password':
          html = renderResetPasswordEmail(data.resetUrl, language);
          subject = language === 'fr' ? 'Réinitialisez votre mot de passe' : 'Reset your password';
          break;

        case 'welcome':
          html = renderWelcomeEmail(data.firstName, language);
          subject = language === 'fr' ? 'Bienvenue sur ShipIt!' : 'Welcome to ShipIt!';
          break;

        case 'invitation':
          html = renderInvitationEmail(
            data.invitationUrl,
            data.organizationName,
            data.role,
            language,
          );
          subject =
            language === 'fr'
              ? `Invitation à rejoindre ${data.organizationName}`
              : `Invitation to join ${data.organizationName}`;
          break;

        default:
          throw new Error(`Unknown email type: ${type}`);
      }

      await this.resend.emails.send({
        from: this.fromEmail,
        to,
        subject,
        html,
      });

      this.logger.log(`Successfully sent ${type} email to ${to}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Failed to send ${type} email to ${to}: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
