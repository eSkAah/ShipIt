import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BillingService } from './billing.service';

export interface CreateCustomerJob {
  type: 'create-customer';
  organizationId: string;
}

export type StripeJob = CreateCustomerJob;

@Processor('stripe')
export class StripeProcessor extends WorkerHost {
  private readonly logger = new Logger(StripeProcessor.name);

  constructor(private billingService: BillingService) {
    super();
  }

  async process(job: Job<StripeJob>): Promise<void> {
    const { type } = job.data;

    this.logger.log(`Processing Stripe job: ${type}`);

    try {
      switch (type) {
        case 'create-customer': {
          const { organizationId } = job.data as CreateCustomerJob;
          await this.billingService.createStripeCustomer(organizationId);
          break;
        }

        default:
          throw new Error(`Unknown Stripe job type: ${type}`);
      }

      this.logger.log(`Successfully processed Stripe job: ${type}`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(`Failed to process Stripe job ${type}: ${errorMessage}`, errorStack);
      throw error;
    }
  }
}
