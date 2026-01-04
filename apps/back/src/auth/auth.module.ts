import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { MailModule } from '../mail/mail.module';
import { ConfigModule } from '../config/config.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

@Module({
  imports: [DatabaseModule, MailModule, ConfigModule],
  providers: [AuthService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
