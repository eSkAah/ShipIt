import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Headers,
  RawBodyRequest,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { Organization } from '@prisma/client';
import { SessionGuard } from '../common/guards/session.guard';
import { TenantGuard } from '../common/guards/tenant.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentOrganization } from '../common/decorators/current-organization.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { BillingService } from './billing.service';
import { CreateCheckoutSessionDto, createCheckoutSessionSchema } from './dto';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { ConfigService } from '../config/config.service';

@Controller('billing')
export class BillingController {
  constructor(
    private billingService: BillingService,
    private configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(SessionGuard, TenantGuard)
  async getSubscriptionInfo(@CurrentOrganization() organization: Organization) {
    const subscriptionInfo = await this.billingService.getSubscriptionInfo(organization.id);
    return { success: true, data: subscriptionInfo };
  }

  @Post('checkout')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  async createCheckoutSession(
    @CurrentOrganization() organization: Organization,
    @Body(new ZodValidationPipe(createCheckoutSessionSchema)) dto: CreateCheckoutSessionDto,
  ) {
    const frontendUrl = this.configService.frontendUrl;
    const successUrl = `${frontendUrl}/settings/billing?success=true`;
    const cancelUrl = `${frontendUrl}/settings/billing?canceled=true`;

    const result = await this.billingService.createCheckoutSession(
      organization,
      dto.priceId,
      successUrl,
      cancelUrl,
    );

    return { success: true, data: result };
  }

  @Post('portal')
  @UseGuards(SessionGuard, TenantGuard, RolesGuard)
  @Roles('admin')
  async createPortalSession(@CurrentOrganization() organization: Organization) {
    const frontendUrl = this.configService.frontendUrl;
    const returnUrl = `${frontendUrl}/settings/billing`;

    const result = await this.billingService.createPortalSession(organization, returnUrl);

    return { success: true, data: result };
  }

  @Post('webhooks')
  @Public()
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    const rawBody = req.rawBody;

    if (!rawBody) {
      return { success: false, error: 'No raw body found' };
    }

    await this.billingService.handleWebhookEvent(rawBody, signature);

    return { success: true };
  }
}
