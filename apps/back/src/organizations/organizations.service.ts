import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { QueueService } from '../queue/queue.service';
import { User, Role } from '@prisma/client';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  async getUserOrganizations(userId: string) {
    const memberships = await this.prisma.organizationMember.findMany({
      where: { userId },
      include: {
        organization: true,
      },
      orderBy: {
        organization: {
          createdAt: 'asc',
        },
      },
    });

    return memberships.map((m) => ({
      ...m.organization,
      role: m.role,
      membershipId: m.id,
    }));
  }

  async create(dto: CreateOrganizationDto, user: User) {
    const baseSlug = this.generateSlug(dto.name);
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.organization.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const organization = await this.prisma.organization.create({
      data: {
        name: dto.name,
        slug,
        members: {
          create: {
            userId: user.id,
            role: 'admin',
          },
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    // Queue Stripe customer creation job asynchronously
    try {
      await this.queueService.getStripeQueue().add(
        'create-customer',
        {
          type: 'create-customer',
          organizationId: organization.id,
        },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
        },
      );
      this.logger.log(`Queued Stripe customer creation for organization ${organization.id}`);
    } catch (error) {
      // Don't fail organization creation if queue fails
      this.logger.warn(
        `Failed to queue Stripe customer creation for org ${organization.id}: ${error}`,
      );
    }

    return organization;
  }

  async findById(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    return organization;
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const updateData: { name?: string; slug?: string } = {};

    if (dto.name) {
      updateData.name = dto.name;
      const baseSlug = this.generateSlug(dto.name);
      let slug = baseSlug;
      let counter = 1;

      for (;;) {
        const existing = await this.prisma.organization.findUnique({ where: { slug } });
        if (!existing || existing.id === id) break;
        slug = `${baseSlug}-${counter}`;
        counter++;
      }

      updateData.slug = slug;
    }

    return this.prisma.organization.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id: string, userId: string): Promise<void> {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
    });

    if (!organization) {
      throw new NotFoundException('Organization not found');
    }

    const userOrgs = await this.prisma.organizationMember.findMany({
      where: { userId },
    });

    if (userOrgs.length <= 1) {
      throw new ForbiddenException('Cannot delete your only organization');
    }

    await this.prisma.organization.delete({
      where: { id },
    });
  }

  async getMembers(organizationId: string) {
    const members = await this.prisma.organizationMember.findMany({
      where: { organizationId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: {
        user: {
          firstName: 'asc',
        },
      },
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      user: m.user,
    }));
  }

  async updateMemberRole(
    organizationId: string,
    targetUserId: string,
    newRole: Role,
    currentUserId: string,
  ) {
    if (targetUserId === currentUserId) {
      throw new ForbiddenException('Cannot change your own role');
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    const adminCount = await this.prisma.organizationMember.count({
      where: {
        organizationId,
        role: 'admin',
      },
    });

    if (membership.role === 'admin' && newRole !== 'admin' && adminCount <= 1) {
      throw new ForbiddenException('Organization must have at least one admin');
    }

    return this.prisma.organizationMember.update({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });
  }

  async removeMember(organizationId: string, targetUserId: string, currentUserId: string) {
    if (targetUserId === currentUserId) {
      throw new ForbiddenException('Cannot remove yourself. Use leave organization instead.');
    }

    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('Member not found');
    }

    if (membership.role === 'admin') {
      const adminCount = await this.prisma.organizationMember.count({
        where: {
          organizationId,
          role: 'admin',
        },
      });

      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot remove the last admin');
      }
    }

    await this.prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId: targetUserId,
          organizationId,
        },
      },
    });

    return { success: true };
  }

  async leaveOrganization(organizationId: string, userId: string) {
    const membership = await this.prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of this organization');
    }

    const userOrgs = await this.prisma.organizationMember.findMany({
      where: { userId },
    });

    if (userOrgs.length <= 1) {
      throw new ForbiddenException('Cannot leave your only organization');
    }

    if (membership.role === 'admin') {
      const adminCount = await this.prisma.organizationMember.count({
        where: {
          organizationId,
          role: 'admin',
        },
      });

      if (adminCount <= 1) {
        throw new ForbiddenException('Cannot leave as the last admin. Transfer ownership first.');
      }
    }

    await this.prisma.organizationMember.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });

    return { success: true };
  }
}
