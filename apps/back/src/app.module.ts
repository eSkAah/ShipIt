import { Module } from '@nestjs/common';
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

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    QueueModule,
    MailModule,
    StorageModule,
    AuthModule,
    OrganizationsModule,
    InvitationsModule,
    UsersModule,
    BillingModule,
    AdminModule,
    HealthModule,
  ],
})
export class AppModule {}
