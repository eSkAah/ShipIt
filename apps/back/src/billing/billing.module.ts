import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { ConfigModule } from '../config/config.module';
import { AuthModule } from '../auth/auth.module';
import { QueueModule } from '../queue/queue.module';
import { BillingService } from './billing.service';
import { BillingController } from './billing.controller';
import { StripeProcessor } from './stripe.processor';

@Module({
  imports: [DatabaseModule, ConfigModule, AuthModule, QueueModule],
  providers: [BillingService, StripeProcessor],
  controllers: [BillingController],
  exports: [BillingService],
})
export class BillingModule {}
