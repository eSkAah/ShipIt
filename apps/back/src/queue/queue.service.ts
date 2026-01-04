import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class QueueService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async isHealthy(): Promise<boolean> {
    try {
      const client = await this.emailQueue.client;
      await client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }

  getEmailQueue(): Queue {
    return this.emailQueue;
  }
}
