import { Module } from '@nestjs/common';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { DatabaseModule } from '../database/database.module';
import { MailModule } from '../mail/mail.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, MailModule, AuthModule],
  controllers: [FeedbackController],
  providers: [FeedbackService],
  exports: [FeedbackService],
})
export class FeedbackModule {}
