import { Test, TestingModule } from '@nestjs/testing';
import { getQueueToken } from '@nestjs/bullmq';
import { MailService, EmailJob } from './mail.service';
import { ConfigService } from '../config/config.service';
import { Language } from '@prisma/client';

describe('MailService', () => {
  let service: MailService;

  const mockEmailQueue = {
    add: jest.fn(),
  };

  const mockConfigService = {
    frontendUrl: 'http://localhost:3000',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: getQueueToken('email'),
          useValue: mockEmailQueue,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<MailService>(MailService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendVerificationEmail', () => {
    it('should queue a verification email with French language by default', async () => {
      const email = 'test@example.com';
      const token = 'verification-token-123';

      await service.sendVerificationEmail(email, token);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          type: 'verification',
          to: email,
          data: {
            token,
            verificationUrl: `http://localhost:3000/verify-email?token=${token}`,
          },
          language: Language.fr,
        }),
        expect.objectContaining({
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }),
      );
    });

    it('should queue a verification email with specified language', async () => {
      const email = 'test@example.com';
      const token = 'verification-token-123';

      await service.sendVerificationEmail(email, token, Language.en);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          type: 'verification',
          to: email,
          language: Language.en,
        }),
        expect.any(Object),
      );
    });

    it('should construct correct verification URL', async () => {
      const email = 'test@example.com';
      const token = 'special-token';

      await service.sendVerificationEmail(email, token);

      const addCall = mockEmailQueue.add.mock.calls[0];
      const jobData = addCall[1] as EmailJob;

      expect((jobData.data as { verificationUrl: string }).verificationUrl).toBe(
        'http://localhost:3000/verify-email?token=special-token',
      );
    });
  });

  describe('sendPasswordResetEmail', () => {
    it('should queue a password reset email with French language by default', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';

      await service.sendPasswordResetEmail(email, token);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          type: 'reset-password',
          to: email,
          data: {
            token,
            resetUrl: `http://localhost:3000/reset-password?token=${token}`,
          },
          language: Language.fr,
        }),
        expect.objectContaining({
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }),
      );
    });

    it('should queue a password reset email with specified language', async () => {
      const email = 'test@example.com';
      const token = 'reset-token-123';

      await service.sendPasswordResetEmail(email, token, Language.en);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          type: 'reset-password',
          to: email,
          language: Language.en,
        }),
        expect.any(Object),
      );
    });

    it('should construct correct reset URL', async () => {
      const email = 'test@example.com';
      const token = 'my-reset-token';

      await service.sendPasswordResetEmail(email, token);

      const addCall = mockEmailQueue.add.mock.calls[0];
      const jobData = addCall[1] as EmailJob;

      expect((jobData.data as { resetUrl: string }).resetUrl).toBe(
        'http://localhost:3000/reset-password?token=my-reset-token',
      );
    });
  });

  describe('sendWelcomeEmail', () => {
    it('should queue a welcome email with French language by default', async () => {
      const email = 'test@example.com';
      const firstName = 'John';

      await service.sendWelcomeEmail(email, firstName);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          type: 'welcome',
          to: email,
          data: {
            firstName,
          },
          language: Language.fr,
        }),
        expect.objectContaining({
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }),
      );
    });

    it('should queue a welcome email with specified language', async () => {
      const email = 'test@example.com';
      const firstName = 'John';

      await service.sendWelcomeEmail(email, firstName, Language.en);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          type: 'welcome',
          to: email,
          language: Language.en,
        }),
        expect.any(Object),
      );
    });
  });

  describe('sendInvitationEmail', () => {
    it('should queue an invitation email with French language by default', async () => {
      const email = 'invited@example.com';
      const token = 'invitation-token-123';
      const organizationName = 'Test Org';
      const role = 'member';

      await service.sendInvitationEmail(email, token, organizationName, role);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          type: 'invitation',
          to: email,
          data: {
            token,
            invitationUrl: `http://localhost:3000/invitations/${token}/accept`,
            organizationName,
            role,
          },
          language: Language.fr,
        }),
        expect.objectContaining({
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        }),
      );
    });

    it('should queue an invitation email with specified language', async () => {
      const email = 'invited@example.com';
      const token = 'invitation-token-123';
      const organizationName = 'Test Org';
      const role = 'admin';

      await service.sendInvitationEmail(email, token, organizationName, role, Language.en);

      expect(mockEmailQueue.add).toHaveBeenCalledWith(
        'send-email',
        expect.objectContaining({
          type: 'invitation',
          to: email,
          language: Language.en,
        }),
        expect.any(Object),
      );
    });

    it('should construct correct invitation URL', async () => {
      const email = 'invited@example.com';
      const token = 'my-invitation-token';
      const organizationName = 'My Company';
      const role = 'viewer';

      await service.sendInvitationEmail(email, token, organizationName, role);

      const addCall = mockEmailQueue.add.mock.calls[0];
      const jobData = addCall[1] as EmailJob;

      expect((jobData.data as { invitationUrl: string }).invitationUrl).toBe(
        'http://localhost:3000/invitations/my-invitation-token/accept',
      );
    });
  });

  describe('queue configuration', () => {
    it('should use exponential backoff with 3 attempts and 2000ms delay', async () => {
      await service.sendVerificationEmail('test@example.com', 'token');

      const addCall = mockEmailQueue.add.mock.calls[0];
      const options = addCall[2];

      expect(options.attempts).toBe(3);
      expect(options.backoff.type).toBe('exponential');
      expect(options.backoff.delay).toBe(2000);
    });
  });
});
