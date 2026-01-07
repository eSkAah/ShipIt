import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '../config/config.service';
import { Role } from '@prisma/client';

// Mock argon2
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  verify: jest.fn(),
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('mocked-nanoid-123'),
}));

import * as argon2 from 'argon2';

describe('AuthService', () => {
  let service: AuthService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      findUnique: jest.fn(),
    },
    organization: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
    organizationMember: {
      create: jest.fn(),
    },
    verificationToken: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn(),
    sendWelcomeEmail: jest.fn(),
    sendPasswordResetEmail: jest.fn(),
  };

  const mockConfigService = {
    sessionExpiryDays: 7,
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    phone: null,
    address: null,
    emailVerified: true,
    avatarUrl: null,
    language: 'en',
    theme: 'system',
    notificationsEnabled: true,
    isSuperAdmin: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('signup', () => {
    const signupDto = {
      email: 'new@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
    };

    it('should create a new user successfully', async () => {
      const createdUser = {
        ...mockUser,
        id: 'new-user-123',
        email: signupDto.email,
        firstName: signupDto.firstName,
        lastName: signupDto.lastName,
        emailVerified: false,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockPrismaService.organization.findUnique.mockResolvedValue(null);
      mockPrismaService.organization.create.mockResolvedValue({
        id: 'org-123',
        name: 'Personal',
        slug: 'new',
      });
      mockPrismaService.organizationMember.create.mockResolvedValue({});
      mockPrismaService.verificationToken.create.mockResolvedValue({});
      mockMailService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await service.signup(signupDto);

      expect(result).not.toHaveProperty('passwordHash');
      expect(result.email).toBe(signupDto.email);
      expect(result.firstName).toBe(signupDto.firstName);
      expect(mockPrismaService.user.create).toHaveBeenCalled();
      expect(mockPrismaService.organization.create).toHaveBeenCalledWith({
        data: { name: 'Personal', slug: expect.any(String) },
      });
      expect(mockPrismaService.organizationMember.create).toHaveBeenCalledWith({
        data: {
          userId: createdUser.id,
          organizationId: 'org-123',
          role: Role.admin,
        },
      });
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
      await expect(service.signup(signupDto)).rejects.toThrow('Email already in use');
    });

    it('should hash password before storing', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      mockPrismaService.organization.findUnique.mockResolvedValue(null);
      mockPrismaService.organization.create.mockResolvedValue({
        id: 'org-123',
        name: 'Personal',
        slug: 'new',
      });
      mockPrismaService.organizationMember.create.mockResolvedValue({});
      mockPrismaService.verificationToken.create.mockResolvedValue({});

      await service.signup(signupDto);

      expect(argon2.hash).toHaveBeenCalledWith(signupDto.password);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          passwordHash: 'hashed-password',
        }),
      });
    });

    it('should create verification token with 24h expiry', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      mockPrismaService.organization.findUnique.mockResolvedValue(null);
      mockPrismaService.organization.create.mockResolvedValue({
        id: 'org-123',
        name: 'Personal',
        slug: 'new',
      });
      mockPrismaService.organizationMember.create.mockResolvedValue({});
      mockPrismaService.verificationToken.create.mockResolvedValue({});

      await service.signup(signupDto);

      expect(mockPrismaService.verificationToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          token: 'mocked-nanoid-123',
          type: 'email-verification',
          expiresAt: expect.any(Date),
        }),
      });
    });
  });

  describe('login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockPrismaService.session.create.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      });

      const result = await service.login(loginDto);

      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.session.id).toBe('session-123');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if email not verified', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
      await expect(service.login(loginDto)).rejects.toThrow('Email not verified');
    });

    it('should store IP address and user agent in session', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockPrismaService.session.create.mockResolvedValue({
        id: 'session-123',
        userId: mockUser.id,
        expiresAt: new Date(),
      });

      await service.login(loginDto, '192.168.1.1', 'Mozilla/5.0');

      expect(mockPrismaService.session.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
        }),
      });
    });
  });

  describe('logout', () => {
    it('should delete session successfully', async () => {
      mockPrismaService.session.delete.mockResolvedValue({});

      const result = await service.logout('session-123');

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.session.delete).toHaveBeenCalledWith({
        where: { id: 'session-123' },
      });
    });
  });

  describe('getSession', () => {
    const mockSession = {
      id: 'session-123',
      userId: mockUser.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      user: mockUser,
    };

    it('should return session with user data', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

      const result = await service.getSession('session-123');

      expect(result.user).not.toHaveProperty('passwordHash');
      expect(result.user.email).toBe(mockUser.email);
      expect(result.session.id).toBe('session-123');
    });

    it('should throw UnauthorizedException if session not found', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      await expect(service.getSession('invalid-session')).rejects.toThrow(UnauthorizedException);
      await expect(service.getSession('invalid-session')).rejects.toThrow('Invalid session');
    });

    it('should throw UnauthorizedException and delete expired session', async () => {
      const expiredSession = {
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000), // Expired
      };
      mockPrismaService.session.findUnique.mockResolvedValue(expiredSession);
      mockPrismaService.session.delete.mockResolvedValue({});

      await expect(service.getSession('session-123')).rejects.toThrow(UnauthorizedException);
      await expect(service.getSession('session-123')).rejects.toThrow('Session expired');
      expect(mockPrismaService.session.delete).toHaveBeenCalled();
    });
  });

  describe('verifyEmail', () => {
    const mockVerificationToken = {
      token: 'verification-token',
      email: mockUser.email,
      type: 'email-verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    it('should verify email successfully', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(mockVerificationToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        emailVerified: true,
      });
      mockPrismaService.verificationToken.delete.mockResolvedValue({});
      mockMailService.sendWelcomeEmail.mockResolvedValue(undefined);

      const result = await service.verifyEmail('verification-token');

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { emailVerified: true },
      });
      expect(mockMailService.sendWelcomeEmail).toHaveBeenCalledWith(
        mockUser.email,
        mockUser.firstName,
        mockUser.language,
      );
    });

    it('should throw BadRequestException if token not found', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(BadRequestException);
      await expect(service.verifyEmail('invalid-token')).rejects.toThrow(
        'Invalid verification token',
      );
    });

    it('should throw BadRequestException if token type is wrong', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue({
        ...mockVerificationToken,
        type: 'password-reset',
      });

      await expect(service.verifyEmail('wrong-type-token')).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException and delete expired token', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue({
        ...mockVerificationToken,
        expiresAt: new Date(Date.now() - 1000), // Expired
      });
      mockPrismaService.verificationToken.delete.mockResolvedValue({});

      await expect(service.verifyEmail('expired-token')).rejects.toThrow(BadRequestException);
      await expect(service.verifyEmail('expired-token')).rejects.toThrow(
        'Verification token expired',
      );
    });

    it('should throw BadRequestException if user not found', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(mockVerificationToken);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.verifyEmail('verification-token')).rejects.toThrow(BadRequestException);
      await expect(service.verifyEmail('verification-token')).rejects.toThrow('User not found');
    });
  });

  describe('forgotPassword', () => {
    it('should send password reset email if user exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.verificationToken.deleteMany.mockResolvedValue({});
      mockPrismaService.verificationToken.create.mockResolvedValue({});
      mockMailService.sendPasswordResetEmail.mockResolvedValue(undefined);

      const result = await service.forgotPassword(mockUser.email);

      expect(result).toEqual({ success: true });
      expect(mockPrismaService.verificationToken.deleteMany).toHaveBeenCalledWith({
        where: {
          email: mockUser.email,
          type: 'password-reset',
        },
      });
      expect(mockPrismaService.verificationToken.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'password-reset',
          email: mockUser.email,
        }),
      });
      expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalled();
    });

    it('should return success even if user not found (security)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.forgotPassword('nonexistent@example.com');

      expect(result).toEqual({ success: true });
      expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    const resetDto = {
      token: 'reset-token',
      password: 'NewPassword123!',
    };

    const mockResetToken = {
      token: 'reset-token',
      email: mockUser.email,
      type: 'password-reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    it('should reset password successfully', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(mockResetToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({
        ...mockUser,
        passwordHash: 'new-hashed-password',
      });
      mockPrismaService.verificationToken.delete.mockResolvedValue({});
      mockPrismaService.session.deleteMany.mockResolvedValue({});

      const result = await service.resetPassword(resetDto);

      expect(result).toEqual({ success: true });
      expect(argon2.hash).toHaveBeenCalledWith(resetDto.password);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: mockUser.id },
        data: { passwordHash: 'hashed-password' },
      });
      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });

    it('should throw BadRequestException if token not found', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(resetDto)).rejects.toThrow('Invalid reset token');
    });

    it('should throw BadRequestException if token type is wrong', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue({
        ...mockResetToken,
        type: 'email-verification',
      });

      await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException and delete expired token', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue({
        ...mockResetToken,
        expiresAt: new Date(Date.now() - 1000), // Expired
      });
      mockPrismaService.verificationToken.delete.mockResolvedValue({});

      await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(resetDto)).rejects.toThrow('Reset token expired');
    });

    it('should throw BadRequestException if user not found', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(mockResetToken);
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.resetPassword(resetDto)).rejects.toThrow(BadRequestException);
      await expect(service.resetPassword(resetDto)).rejects.toThrow('User not found');
    });

    it('should invalidate all existing sessions after password reset', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(mockResetToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.verificationToken.delete.mockResolvedValue({});
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 3 });

      await service.resetPassword(resetDto);

      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });
  });
});
