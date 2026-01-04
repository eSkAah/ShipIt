import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '../config/config.module';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [
    ConfigModule,
    BullModule.registerQueue({
      name: 'email',
    }),
  ],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
