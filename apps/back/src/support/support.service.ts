import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateSupportRequestDto } from './dto/create-support-request.dto';
import { User, Organization, SupportRequest, Language } from '@prisma/client';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async createSupportRequest(
    user: User,
    organization: Organization,
    dto: CreateSupportRequestDto,
  ): Promise<SupportRequest> {
    this.logger.log(`Creating support request from user ${user.id} for org ${organization.id}`);

    const supportRequest = await this.prisma.supportRequest.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        subject: dto.subject,
        message: dto.message,
      },
    });

    const userName = `${user.firstName} ${user.lastName}`;

    await this.mailService.sendSupportRequestEmail(
      userName,
      user.email,
      organization.name,
      dto.subject,
      dto.message,
      user.language || Language.fr,
    );

    this.logger.log(`Support request ${supportRequest.id} created and email queued`);

    return supportRequest;
  }

  async getUserSupportRequests(userId: string, organizationId: string): Promise<SupportRequest[]> {
    return this.prisma.supportRequest.findMany({
      where: {
        userId,
        organizationId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
