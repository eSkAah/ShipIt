import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import '../../types/express.d';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Use existing correlation ID from header or generate a new one
    const correlationId =
      (req.headers['x-correlation-id'] as string) ||
      (req.headers['x-request-id'] as string) ||
      randomUUID();

    // Attach to request object for use in services/controllers
    req.correlationId = correlationId;

    // Set response header for client-side debugging
    res.setHeader('X-Correlation-Id', correlationId);

    next();
  }
}
