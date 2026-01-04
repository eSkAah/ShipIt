import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '../../config/config.service';
import Redis from 'ioredis';
import { RATE_LIMIT_KEY } from '../decorators/rate-limit.decorator';

@Injectable()
export class RateLimitGuard implements CanActivate {
  private redis: Redis;

  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {
    const redisUrl = this.configService.redisUrl;
    this.redis = new Redis(redisUrl);
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
    const ip = request.ip || request.connection.remoteAddress;
    const key = `rate-limit:${request.route.path}:${ip}`;

    const current = await this.redis.get(key);
    const count = current ? parseInt(current, 10) : 0;

    if (count >= rateLimitConfig.points) {
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

    return true;
  }
}
