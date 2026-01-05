import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { QueueModule } from '../queue/queue.module';
import { MailService } from './mail.service';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [ConfigModule, QueueModule],
  providers: [MailService, MailProcessor],
  exports: [MailService],
})
export class MailModule {}
