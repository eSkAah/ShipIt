import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { User, Organization, Role, Language } from '@prisma/client';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class InvitationsService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private generateToken(): string {
    return randomBytes(32).toString('hex');
  }

  async create(dto: CreateInvitationDto, organization: Organization, invitedBy: User) {
    const existingMember = await this.prisma.organizationMember.findFirst({
      where: {
        organizationId: organization.id,
        user: { email: dto.email },
      },
    });

    if (existingMember) {
      throw new ConflictException('User is already a member of this organization');
    }

    const existingInvitation = await this.prisma.invitation.findFirst({
      where: {
        email: dto.email,
        organizationId: organization.id,
        status: 'pending',
      },
    });

    if (existingInvitation) {
      throw new ConflictException('An invitation has already been sent to this email');
    }

    const token = this.generateToken();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email,
        organizationId: organization.id,
        role: dto.role as Role,
        token,
        invitedById: invitedBy.id,
        expiresAt,
      },
      include: {
        organization: true,
      },
    });

    await this.mailService.sendInvitationEmail(
      dto.email,
      token,
      organization.name,
      dto.role,
      invitedBy.language || Language.fr,
    );

    return invitation;
  }

  async getOrganizationInvitations(organizationId: string) {
    return this.prisma.invitation.findMany({
      where: {
        organizationId,
        status: 'pending',
      },
      orderBy: {
        expiresAt: 'asc',
      },
    });
  }

  async cancelInvitation(invitationId: string, organizationId: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { id: invitationId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.organizationId !== organizationId) {
      throw new ForbiddenException('Invitation does not belong to this organization');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException('Invitation is no longer pending');
    }

    return this.prisma.invitation.update({
      where: { id: invitationId },
      data: { status: 'canceled' },
    });
  }

  async getByToken(token: string) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(`Invitation is ${invitation.status}`);
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Invitation has expired');
    }

    return {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      organization: invitation.organization,
      expiresAt: invitation.expiresAt,
    };
  }

  async accept(token: string, user: User) {
    const invitation = await this.prisma.invitation.findUnique({
      where: { token },
      include: {
        organization: true,
      },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status !== 'pending') {
      throw new BadRequestException(`Invitation is ${invitation.status}`);
    }

    if (invitation.expiresAt < new Date()) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'expired' },
      });
      throw new BadRequestException('Invitation has expired');
    }

    if (invitation.email.toLowerCase() !== user.email.toLowerCase()) {
      throw new ForbiddenException('This invitation was sent to a different email address');
    }

    const existingMember = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: user.id,
          organizationId: invitation.organizationId,
        },
      },
    });

    if (existingMember) {
      await this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted' },
      });
      throw new ConflictException('You are already a member of this organization');
    }

    const [membership] = await this.prisma.$transaction([
      this.prisma.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: invitation.organizationId,
          role: invitation.role,
        },
        include: {
          organization: true,
        },
      }),
      this.prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'accepted' },
      }),
    ]);

    return {
      organization: membership.organization,
      role: membership.role,
      membershipId: membership.id,
    };
  }
}
