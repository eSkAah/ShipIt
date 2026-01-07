import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AuthModule } from '../src/auth/auth.module';
import { PrismaService } from '../src/database/prisma.service';
import { MailService } from '../src/mail/mail.service';
import { ConfigModule } from '../src/config/config.module';
import { LoggerModule } from '../src/logger';

// Mock argon2
jest.mock('argon2', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  verify: jest.fn(),
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn().mockReturnValue('mocked-token-123'),
}));

import * as argon2 from 'argon2';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    passwordHash: 'hashed-password',
    firstName: 'Test',
    lastName: 'User',
    emailVerified: true,
    language: 'en',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockSession = {
    id: 'session-123',
    userId: 'user-123',
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    user: mockUser,
  };

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    session: {
      create: jest.fn(),
      findUnique: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
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
    appLog: {
      create: jest.fn().mockResolvedValue({}),
    },
  };

  const mockMailService = {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendWelcomeEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule, AuthModule, LoggerModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideProvider(MailService)
      .useValue(mockMailService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /auth/signup', () => {
    const signupDto = {
      email: 'new@example.com',
      password: 'Password123!',
      firstName: 'New',
      lastName: 'User',
    };

    it('should create a new user successfully', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue({
        ...mockUser,
        id: 'new-user-123',
        email: signupDto.email,
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

      const response = await request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(201);

      expect(response.body).not.toHaveProperty('passwordHash');
      expect(response.body.email).toBe(signupDto.email);
      expect(mockMailService.sendVerificationEmail).toHaveBeenCalled();
    });

    it('should return 409 if email already exists', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      return request(app.getHttpServer())
        .post('/auth/signup')
        .send(signupDto)
        .expect(409)
        .expect((res) => {
          expect(res.body.message).toBe('Email already in use');
        });
    });

    it('should return 400 for invalid email format', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...signupDto, email: 'invalid-email' })
        .expect(400);
    });

    it('should return 400 for missing required fields', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ email: 'test@example.com' })
        .expect(400);
    });

    it('should return 400 for weak password', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({ ...signupDto, password: '123' })
        .expect(400);
    });
  });

  describe('POST /auth/login', () => {
    const loginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should login successfully with valid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      mockPrismaService.session.create.mockResolvedValue(mockSession);

      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(201);

      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body.user.email).toBe(mockUser.email);
      expect(response.body.session).toHaveProperty('id');
      expect(response.headers['set-cookie']).toBeDefined();
    });

    it('should return 401 for invalid credentials', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      (argon2.verify as jest.Mock).mockResolvedValue(false);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('should return 401 for non-existent user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Invalid credentials');
        });
    });

    it('should return 401 for unverified email', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue({
        ...mockUser,
        emailVerified: false,
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);

      return request(app.getHttpServer())
        .post('/auth/login')
        .send(loginDto)
        .expect(401)
        .expect((res) => {
          expect(res.body.message).toBe('Email not verified');
        });
    });
  });

  describe('POST /auth/logout', () => {
    it('should logout successfully with valid session', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);
      mockPrismaService.session.delete.mockResolvedValue({});

      return request(app.getHttpServer())
        .post('/auth/logout')
        .set('Cookie', [`session_id=${mockSession.id}`])
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });
  });

  describe('GET /auth/session', () => {
    it('should return session with valid cookie', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(mockSession);

      const response = await request(app.getHttpServer())
        .get('/auth/session')
        .set('Cookie', [`session_id=${mockSession.id}`])
        .expect(200);

      expect(response.body.user).not.toHaveProperty('passwordHash');
      expect(response.body.user.email).toBe(mockUser.email);
    });

    it('should return 401 for expired session', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue({
        ...mockSession,
        expiresAt: new Date(Date.now() - 1000),
      });
      mockPrismaService.session.delete.mockResolvedValue({});

      return request(app.getHttpServer())
        .get('/auth/session')
        .set('Cookie', [`session_id=${mockSession.id}`])
        .expect(401);
    });

    it('should return 401 for invalid session', async () => {
      mockPrismaService.session.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer())
        .get('/auth/session')
        .set('Cookie', ['session_id=invalid-session'])
        .expect(401);
    });
  });

  describe('POST /auth/verify-email', () => {
    const mockVerificationToken = {
      token: 'verification-token',
      email: mockUser.email,
      type: 'email-verification',
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };

    it('should verify email successfully', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(mockVerificationToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue({ ...mockUser, emailVerified: true });
      mockPrismaService.verificationToken.delete.mockResolvedValue({});

      return request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: 'verification-token' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(mockMailService.sendWelcomeEmail).toHaveBeenCalled();
        });
    });

    it('should return 400 for invalid token', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: 'invalid-token' })
        .expect(400);
    });

    it('should return 400 for expired token', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue({
        ...mockVerificationToken,
        expiresAt: new Date(Date.now() - 1000),
      });
      mockPrismaService.verificationToken.delete.mockResolvedValue({});

      return request(app.getHttpServer())
        .post('/auth/verify-email')
        .send({ token: 'expired-token' })
        .expect(400);
    });
  });

  describe('POST /auth/forgot-password', () => {
    it('should send password reset email for existing user', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.verificationToken.deleteMany.mockResolvedValue({});
      mockPrismaService.verificationToken.create.mockResolvedValue({});

      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: mockUser.email })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(mockMailService.sendPasswordResetEmail).toHaveBeenCalled();
        });
    });

    it('should return success even for non-existent user (security)', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer())
        .post('/auth/forgot-password')
        .send({ email: 'nonexistent@example.com' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
          expect(mockMailService.sendPasswordResetEmail).not.toHaveBeenCalled();
        });
    });
  });

  describe('POST /auth/reset-password', () => {
    const mockResetToken = {
      token: 'reset-token',
      email: mockUser.email,
      type: 'password-reset',
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    };

    it('should reset password successfully', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(mockResetToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.verificationToken.delete.mockResolvedValue({});
      mockPrismaService.session.deleteMany.mockResolvedValue({});

      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'reset-token', password: 'NewPassword123!' })
        .expect(201)
        .expect((res) => {
          expect(res.body.success).toBe(true);
        });
    });

    it('should return 400 for invalid token', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(null);

      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'invalid-token', password: 'NewPassword123!' })
        .expect(400);
    });

    it('should return 400 for expired token', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue({
        ...mockResetToken,
        expiresAt: new Date(Date.now() - 1000),
      });
      mockPrismaService.verificationToken.delete.mockResolvedValue({});

      return request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'expired-token', password: 'NewPassword123!' })
        .expect(400);
    });

    it('should invalidate all existing sessions after password reset', async () => {
      mockPrismaService.verificationToken.findUnique.mockResolvedValue(mockResetToken);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUser);
      mockPrismaService.verificationToken.delete.mockResolvedValue({});
      mockPrismaService.session.deleteMany.mockResolvedValue({ count: 3 });

      await request(app.getHttpServer())
        .post('/auth/reset-password')
        .send({ token: 'reset-token', password: 'NewPassword123!' })
        .expect(201);

      expect(mockPrismaService.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
      });
    });
  });
});
