import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private configService: NestConfigService) {}

  get nodeEnv(): string {
    return this.configService.get<string>('NODE_ENV', 'development');
  }

  get port(): number {
    return this.configService.get<number>('PORT', 3001);
  }

  get frontendUrl(): string {
    return this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
  }

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL', '');
  }

  get redisUrl(): string {
    return this.configService.get<string>('REDIS_URL', '');
  }

  get betterAuthSecret(): string {
    return this.configService.get<string>('BETTER_AUTH_SECRET', '');
  }

  get stripeSecretKey(): string {
    return this.configService.get<string>('STRIPE_SECRET_KEY', '');
  }

  get stripeWebhookSecret(): string {
    return this.configService.get<string>('STRIPE_WEBHOOK_SECRET', '');
  }

  get resendApiKey(): string {
    return this.configService.get<string>('RESEND_API_KEY', '');
  }

  get azureStorageConnectionString(): string {
    return this.configService.get<string>('AZURE_STORAGE_CONNECTION_STRING', '');
  }

  get azureStorageAvatarsContainer(): string {
    return this.configService.get<string>('AZURE_STORAGE_AVATARS_CONTAINER', 'avatars');
  }

  get sentryDsn(): string {
    return this.configService.get<string>('SENTRY_DSN', '');
  }

  get sessionExpiryDays(): number {
    return this.configService.get<number>('SESSION_EXPIRY_DAYS', 7);
  }

  get betterAuthBasePath(): string {
    return this.configService.get<string>('BETTER_AUTH_BASE_PATH', '/api/auth');
  }

  get fromEmail(): string {
    return this.configService.get<string>('FROM_EMAIL', 'noreply@shipit.com');
  }

  get supportEmail(): string {
    return this.configService.get<string>('SUPPORT_EMAIL', 'support@shipit.com');
  }

  get googleClientId(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_ID', '');
  }

  get googleClientSecret(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET', '');
  }

  get appleClientId(): string {
    return this.configService.get<string>('APPLE_CLIENT_ID', '');
  }

  get appleTeamId(): string {
    return this.configService.get<string>('APPLE_TEAM_ID', '');
  }

  get appleKeyId(): string {
    return this.configService.get<string>('APPLE_KEY_ID', '');
  }

  get applePrivateKey(): string {
    return this.configService.get<string>('APPLE_PRIVATE_KEY', '');
  }

  get isProd(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDev(): boolean {
    return this.nodeEnv === 'development';
  }
}
