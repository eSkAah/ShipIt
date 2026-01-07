import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { HealthIndicator, HealthIndicatorResult, HealthCheckError } from '@nestjs/terminus';
import Redis from 'ioredis';
import { ConfigService } from '../config/config.service';

@Injectable()
export class RedisHealthIndicator extends HealthIndicator implements OnModuleDestroy {
  private redis: Redis | null = null;

  constructor(private configService: ConfigService) {
    super();
    const redisUrl = this.configService.redisUrl;
    if (redisUrl) {
      this.redis = new Redis(redisUrl);
    }
  }

  async onModuleDestroy() {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  async isHealthy(key: string): Promise<HealthIndicatorResult> {
    if (!this.redis) {
      return this.getStatus(key, false, { message: 'Redis not configured' });
    }

    try {
      const result = await this.redis.ping();
      const isHealthy = result === 'PONG';

      if (isHealthy) {
        return this.getStatus(key, true);
      }

      throw new HealthCheckError('Redis check failed', this.getStatus(key, false));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      throw new HealthCheckError(
        'Redis check failed',
        this.getStatus(key, false, { message: errorMessage }),
      );
    }
  }
}
