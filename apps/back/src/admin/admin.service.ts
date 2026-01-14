import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UsersQueryDto, OrganizationsQueryDto, LogsQueryDto, FeedbackQueryDto } from './dto';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsers(query: UsersQueryDto) {
    const { page = 1, limit = 10, search } = query;
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { email: { contains: search, mode: 'insensitive' as const } },
            { firstName: { contains: search, mode: 'insensitive' as const } },
            { lastName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          emailVerified: true,
          isSuperAdmin: true,
          createdAt: true,
          memberships: {
            select: {
              id: true,
              role: true,
              organization: {
                select: {
                  id: true,
                  name: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getOrganizations(query: OrganizationsQueryDto) {
    const { page = 1, limit = 10, search, tier } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (tier) {
      where.subscriptionTier = tier;
    }

    const [organizations, total] = await Promise.all([
      this.prisma.organization.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          slug: true,
          logoUrl: true,
          subscriptionTier: true,
          subscriptionStatus: true,
          createdAt: true,
          _count: {
            select: {
              members: true,
            },
          },
        },
      }),
      this.prisma.organization.count({ where }),
    ]);

    return {
      data: organizations.map((org) => ({
        ...org,
        memberCount: org._count.members,
        _count: undefined,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getLogs(query: LogsQueryDto) {
    const { page = 1, limit = 50, search, level } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.message = { contains: search, mode: 'insensitive' };
    }

    if (level) {
      where.level = level;
    }

    const [logs, total] = await Promise.all([
      this.prisma.appLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { timestamp: 'desc' },
      }),
      this.prisma.appLog.count({ where }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getStats() {
    const [totalUsers, totalOrganizations, verifiedUsers, premiumOrgs] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.organization.count(),
      this.prisma.user.count({ where: { emailVerified: true } }),
      this.prisma.organization.count({ where: { subscriptionTier: 'premium' } }),
    ]);

    return {
      totalUsers,
      totalOrganizations,
      verifiedUsers,
      premiumOrgs,
      freeOrgs: totalOrganizations - premiumOrgs,
      unverifiedUsers: totalUsers - verifiedUsers,
    };
  }

  async getFeedback(query: FeedbackQueryDto) {
    const { page = 1, limit = 10, search, type } = query;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { message: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (type) {
      where.type = type;
    }

    const [feedbacks, total] = await Promise.all([
      this.prisma.feedback.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.feedback.count({ where }),
    ]);

    const userIds = [...new Set(feedbacks.map((f) => f.userId))];
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, email: true, firstName: true, lastName: true },
    });

    const userMap = new Map(users.map((u) => [u.id, u]));

    return {
      data: feedbacks.map((feedback) => ({
        ...feedback,
        user: userMap.get(feedback.userId) || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
