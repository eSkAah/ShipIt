import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  private readonly logger = new Logger(QueueService.name);

  constructor(
    @InjectQueue('email') private emailQueue: Queue,
    @InjectQueue('stripe') private stripeQueue: Queue,
  ) {}

  async isHealthy(): Promise<boolean> {
    try {
      const client = await this.emailQueue.client;
      await client.ping();
      return true;
    } catch (error) {
      this.logger.error('Queue health check failed:', error);
      return false;
    }
  }

  getEmailQueue(): Queue {
    return this.emailQueue;
  }

  getStripeQueue(): Queue {
    return this.stripeQueue;
  }
}
