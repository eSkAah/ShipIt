import { Test, TestingModule } from '@nestjs/testing';
import { Job } from 'bullmq';
import { ConfigService } from '../config/config.service';
import { EmailJob } from './mail.service';
import { Language } from '@prisma/client';

// Create mock functions before imports
const mockResendSend = jest.fn().mockResolvedValue({ id: 'email-id-123' });
const mockRenderVerification = jest.fn().mockResolvedValue('<html>Verification Email</html>');
const mockRenderResetPassword = jest.fn().mockResolvedValue('<html>Reset Password Email</html>');
const mockRenderWelcome = jest.fn().mockResolvedValue('<html>Welcome Email</html>');
const mockRenderInvitation = jest.fn().mockResolvedValue('<html>Invitation Email</html>');

// Mock Resend
jest.mock('resend', () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: {
      send: mockResendSend,
    },
  })),
}));

// Mock React Email render functions
jest.mock('./templates/verification-email', () => ({
  renderVerificationEmailReact: mockRenderVerification,
}));

jest.mock('./templates/reset-password-email', () => ({
  renderResetPasswordEmailReact: mockRenderResetPassword,
}));

jest.mock('./templates/welcome-email', () => ({
  renderWelcomeEmailReact: mockRenderWelcome,
}));

jest.mock('./templates/invitation-email', () => ({
  renderInvitationEmailReact: mockRenderInvitation,
}));

// Import after mocks
import { MailProcessor } from './mail.processor';

describe('MailProcessor', () => {
  let processor: MailProcessor;

  const mockConfigService = {
    resendApiKey: 'test-resend-api-key',
    fromEmail: 'noreply@test.com',
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailProcessor,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    processor = module.get<MailProcessor>(MailProcessor);
  });

  const createMockJob = (data: EmailJob): Job<EmailJob> =>
    ({
      data,
      id: 'job-123',
    }) as Job<EmailJob>;

  describe('verification email', () => {
    it('should process verification email in French', async () => {
      const job = createMockJob({
        type: 'verification',
        to: 'test@example.com',
        data: { verificationUrl: 'http://localhost:3000/verify?token=abc', token: 'abc' },
        language: Language.fr,
      });

      await processor.process(job);

      expect(mockRenderVerification).toHaveBeenCalledWith(
        'http://localhost:3000/verify?token=abc',
        Language.fr,
      );
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'test@example.com',
        subject: 'Vérifiez votre adresse email',
        html: '<html>Verification Email</html>',
      });
    });

    it('should process verification email in English', async () => {
      const job = createMockJob({
        type: 'verification',
        to: 'test@example.com',
        data: { verificationUrl: 'http://localhost:3000/verify?token=abc', token: 'abc' },
        language: Language.en,
      });

      await processor.process(job);

      expect(mockRenderVerification).toHaveBeenCalledWith(
        'http://localhost:3000/verify?token=abc',
        Language.en,
      );
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'test@example.com',
        subject: 'Verify your email address',
        html: '<html>Verification Email</html>',
      });
    });
  });

  describe('reset-password email', () => {
    it('should process reset-password email in French', async () => {
      const job = createMockJob({
        type: 'reset-password',
        to: 'test@example.com',
        data: { resetUrl: 'http://localhost:3000/reset?token=xyz', token: 'xyz' },
        language: Language.fr,
      });

      await processor.process(job);

      expect(mockRenderResetPassword).toHaveBeenCalledWith(
        'http://localhost:3000/reset?token=xyz',
        Language.fr,
      );
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'test@example.com',
        subject: 'Réinitialisez votre mot de passe',
        html: '<html>Reset Password Email</html>',
      });
    });

    it('should process reset-password email in English', async () => {
      const job = createMockJob({
        type: 'reset-password',
        to: 'test@example.com',
        data: { resetUrl: 'http://localhost:3000/reset?token=xyz', token: 'xyz' },
        language: Language.en,
      });

      await processor.process(job);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Reset your password',
        }),
      );
    });
  });

  describe('welcome email', () => {
    it('should process welcome email in French', async () => {
      const job = createMockJob({
        type: 'welcome',
        to: 'test@example.com',
        data: { firstName: 'Jean' },
        language: Language.fr,
      });

      await processor.process(job);

      expect(mockRenderWelcome).toHaveBeenCalledWith('Jean', Language.fr);
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'test@example.com',
        subject: 'Bienvenue sur ShipIt!',
        html: '<html>Welcome Email</html>',
      });
    });

    it('should process welcome email in English', async () => {
      const job = createMockJob({
        type: 'welcome',
        to: 'test@example.com',
        data: { firstName: 'John' },
        language: Language.en,
      });

      await processor.process(job);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Welcome to ShipIt!',
        }),
      );
    });
  });

  describe('invitation email', () => {
    it('should process invitation email in French', async () => {
      const job = createMockJob({
        type: 'invitation',
        to: 'invited@example.com',
        data: {
          invitationUrl: 'http://localhost:3000/invite/token123',
          organizationName: 'Test Org',
          role: 'member',
          token: 'token123',
        },
        language: Language.fr,
      });

      await processor.process(job);

      expect(mockRenderInvitation).toHaveBeenCalledWith(
        'http://localhost:3000/invite/token123',
        'Test Org',
        'member',
        Language.fr,
      );
      expect(mockResendSend).toHaveBeenCalledWith({
        from: 'noreply@test.com',
        to: 'invited@example.com',
        subject: 'Invitation à rejoindre Test Org',
        html: '<html>Invitation Email</html>',
      });
    });

    it('should process invitation email in English', async () => {
      const job = createMockJob({
        type: 'invitation',
        to: 'invited@example.com',
        data: {
          invitationUrl: 'http://localhost:3000/invite/token123',
          organizationName: 'My Company',
          role: 'admin',
          token: 'token123',
        },
        language: Language.en,
      });

      await processor.process(job);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: 'Invitation to join My Company',
        }),
      );
    });
  });

  describe('error handling', () => {
    it('should throw error for unknown email type', async () => {
      const job = createMockJob({
        type: 'unknown' as any,
        to: 'test@example.com',
        data: {} as any,
        language: Language.en,
      });

      await expect(processor.process(job)).rejects.toThrow('Unknown email type: unknown');
    });

    it('should propagate Resend API errors', async () => {
      mockResendSend.mockRejectedValueOnce(new Error('Resend API error'));

      const job = createMockJob({
        type: 'verification',
        to: 'test@example.com',
        data: { verificationUrl: 'http://localhost:3000/verify?token=abc', token: 'abc' },
        language: Language.en,
      });

      await expect(processor.process(job)).rejects.toThrow('Resend API error');
    });
  });

  describe('configuration', () => {
    it('should use correct from email from config', async () => {
      const job = createMockJob({
        type: 'welcome',
        to: 'test@example.com',
        data: { firstName: 'Test' },
        language: Language.en,
      });

      await processor.process(job);

      expect(mockResendSend).toHaveBeenCalledWith(
        expect.objectContaining({
          from: 'noreply@test.com',
        }),
      );
    });
  });
});
