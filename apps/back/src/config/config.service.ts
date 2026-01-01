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

  get sentryDsn(): string {
    return this.configService.get<string>('SENTRY_DSN', '');
  }

  get isProd(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDev(): boolean {
    return this.nodeEnv === 'development';
  }
}
