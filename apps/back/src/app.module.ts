import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { HealthModule } from './health/health.module';
import { QueueModule } from './queue/queue.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { InvitationsModule } from './invitations/invitations.module';
import { StorageModule } from './storage/storage.module';
import { UsersModule } from './users/users.module';
import { BillingModule } from './billing/billing.module';
import { AdminModule } from './admin/admin.module';
import { FeedbackModule } from './feedback/feedback.module';
import { LoggerModule } from './logger';
import { CorrelationIdMiddleware } from './common/middleware';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    LoggerModule,
    QueueModule,
    MailModule,
    StorageModule,
    AuthModule,
    OrganizationsModule,
    InvitationsModule,
    UsersModule,
    BillingModule,
    AdminModule,
    FeedbackModule,
    HealthModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(CorrelationIdMiddleware).forRoutes('*');
  }
}
