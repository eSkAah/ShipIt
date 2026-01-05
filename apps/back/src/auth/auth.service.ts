import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { ConfigService } from '../config/config.service';
import * as argon2 from 'argon2';
import { nanoid } from 'nanoid';
import { Role } from '@prisma/client';
import type { SignupDto, LoginDto, ResetPasswordDto } from '@shipit/validators';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private configService: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const { email, password, firstName, lastName } = dto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const passwordHash = await argon2.hash(password);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        emailVerified: false,
      },
    });

    await this.createPersonalOrganization(user.id, email);

    const verificationToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    await this.prisma.verificationToken.create({
      data: {
        token: verificationToken,
        email: user.email,
        type: 'email-verification',
        expiresAt,
      },
    });

    await this.mailService.sendVerificationEmail(user.email, verificationToken, user.language);

    const { passwordHash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const { email, password } = dto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.emailVerified) {
      throw new UnauthorizedException('Email not verified');
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.configService.sessionExpiryDays);

    const session = await this.prisma.session.create({
      data: {
        userId: user.id,
        expiresAt,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
      },
    });

    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  async logout(sessionId: string) {
    await this.prisma.session.delete({
      where: { id: sessionId },
    });

    return { success: true };
  }

  async getSession(sessionId: string) {
    const session = await this.prisma.session.findUnique({
      where: { id: sessionId },
      include: {
        user: true,
      },
    });

    if (!session) {
      throw new UnauthorizedException('Invalid session');
    }

    if (new Date() > session.expiresAt) {
      await this.prisma.session.delete({
        where: { id: sessionId },
      });
      throw new UnauthorizedException('Session expired');
    }

    const { passwordHash: _, ...userWithoutPassword } = session.user;

    return {
      user: userWithoutPassword,
      session: {
        id: session.id,
        expiresAt: session.expiresAt,
      },
    };
  }

  async verifyEmail(token: string) {
    const verificationToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken || verificationToken.type !== 'email-verification') {
      throw new BadRequestException('Invalid verification token');
    }

    if (new Date() > verificationToken.expiresAt) {
      await this.prisma.verificationToken.delete({
        where: { token },
      });
      throw new BadRequestException('Verification token expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await this.prisma.verificationToken.delete({
      where: { token },
    });

    await this.mailService.sendWelcomeEmail(user.email, user.firstName, user.language);

    return { success: true };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { success: true };
    }

    const resetToken = nanoid(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1);

    await this.prisma.verificationToken.deleteMany({
      where: {
        email: user.email,
        type: 'password-reset',
      },
    });

    await this.prisma.verificationToken.create({
      data: {
        token: resetToken,
        email: user.email,
        type: 'password-reset',
        expiresAt,
      },
    });

    await this.mailService.sendPasswordResetEmail(user.email, resetToken, user.language);

    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const { token, password } = dto;

    const resetToken = await this.prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!resetToken || resetToken.type !== 'password-reset') {
      throw new BadRequestException('Invalid reset token');
    }

    if (new Date() > resetToken.expiresAt) {
      await this.prisma.verificationToken.delete({
        where: { token },
      });
      throw new BadRequestException('Reset token expired');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const passwordHash = await argon2.hash(password);

    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    await this.prisma.verificationToken.delete({
      where: { token },
    });

    await this.prisma.session.deleteMany({
      where: { userId: user.id },
    });

    return { success: true };
  }

  private async createPersonalOrganization(userId: string, email: string) {
    const baseName = email.split('@')[0];
    const slug = await this.generateOrgSlug(baseName);

    const organization = await this.prisma.organization.create({
      data: {
        name: 'Personal',
        slug,
      },
    });

    await this.prisma.organizationMember.create({
      data: {
        userId,
        organizationId: organization.id,
        role: Role.admin,
      },
    });

    this.logger.log(`Created personal organization for user ${userId} with slug ${slug}`);

    return organization;
  }

  private async generateOrgSlug(baseName: string): Promise<string> {
    const baseSlug = baseName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }
}
