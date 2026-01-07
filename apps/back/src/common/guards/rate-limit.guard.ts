import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '../../config/config.service';
import Redis from 'ioredis';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate, OnModuleDestroy {
  private readonly logger = new Logger(RateLimitGuard.name);
  private redis: Redis;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    const redisUrl = this.configService.redisUrl;
    this.redis = new Redis(redisUrl);

    this.redis.on('error', (err) => {
      this.logger.error('Redis connection error:', err.message);
    });
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitConfig = this.reflector.getAllAndOverride<{
      points: number;
      duration: number;
    }>(RATE_LIMIT_KEY, [context.getHandler(), context.getClass()]);

    if (!rateLimitConfig) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const ip =
      request.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
      request.ip ||
      request.socket?.remoteAddress ||
      'unknown';
    const key = `rate-limit:${request.route.path}:${ip}`;

    const response = context.switchToHttp().getResponse();

    try {
      const current = await this.redis.get(key);
      const count = current ? parseInt(current, 10) : 0;
      const ttl = await this.redis.ttl(key);

      // Set rate limit headers
      response.setHeader('X-RateLimit-Limit', rateLimitConfig.points);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, rateLimitConfig.points - count - 1));
      response.setHeader(
        'X-RateLimit-Reset',
        Math.ceil(Date.now() / 1000) + (ttl > 0 ? ttl : rateLimitConfig.duration),
      );

      if (count >= rateLimitConfig.points) {
        response.setHeader('Retry-After', ttl > 0 ? ttl : rateLimitConfig.duration);
        throw new HttpException(
          {
            success: false,
            error: {
              message: 'Too many requests. Please try again later.',
              code: 'RATE_LIMIT_EXCEEDED',
            },
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      await this.redis.pipeline().incr(key).expire(key, rateLimitConfig.duration).exec();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error('Rate limit check failed:', error);
      // Fail-open: allow request if Redis is unavailable
    }

    return true;
  }
}
