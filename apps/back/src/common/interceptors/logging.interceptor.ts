import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const { method, url, correlationId } = request;
    const userAgent = request.headers['user-agent'] || 'unknown';
    const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';

    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const duration = Date.now() - startTime;
          const statusCode = response.statusCode;

          this.logger.info(`${method} ${url} ${statusCode} ${duration}ms`, {
            requestId: correlationId,
            userId: (request as Request & { user?: { id: string } }).user?.id,
            orgId: (request as Request & { currentOrganization?: { id: string } })
              .currentOrganization?.id,
            method,
            url,
            statusCode,
            duration,
            userAgent: userAgent as string,
            ip: ip as string,
          });
        },
        error: (error) => {
          const duration = Date.now() - startTime;

          this.logger.error(`${method} ${url} ERROR ${duration}ms`, undefined, {
            requestId: correlationId,
            userId: (request as Request & { user?: { id: string } }).user?.id,
            orgId: (request as Request & { currentOrganization?: { id: string } })
              .currentOrganization?.id,
            method,
            url,
            duration,
            error: error.message,
            userAgent: userAgent as string,
            ip: ip as string,
          });
        },
      }),
    );
  }
}
