import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  userId?: string;
  orgId?: string;
  requestId?: string;
  [key: string]: unknown;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  constructor(private prisma: PrismaService) {}

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId || 'no-request-id';
    return `[${timestamp}] [${level.toUpperCase()}] [${requestId}] ${message}`;
  }

  private async persistLog(level: LogLevel, message: string, context?: LogContext): Promise<void> {
    try {
      const { userId, orgId, requestId, ...rest } = context || {};
      const contextData: Prisma.InputJsonValue | undefined =
        Object.keys(rest).length > 0 ? (rest as Prisma.InputJsonValue) : undefined;

      await this.prisma.appLog.create({
        data: {
          level,
          message,
          context: contextData,
          userId: userId || undefined,
          orgId: orgId || undefined,
          requestId: requestId || undefined,
        },
      });
    } catch {
      // Fail silently to avoid infinite loops
      console.error('Failed to persist log to database');
    }
  }

  log(message: string, context?: LogContext): void {
    console.log(this.formatMessage('info', message, context));
    this.persistLog('info', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log(message, context);
  }

  error(message: string, trace?: string, context?: LogContext): void {
    const fullMessage = trace ? `${message}\n${trace}` : message;
    console.error(this.formatMessage('error', fullMessage, context));
    this.persistLog('error', message, { ...context, trace });
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatMessage('warn', message, context));
    this.persistLog('warn', message, context);
  }

  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, context));
    }
    this.persistLog('debug', message, context);
  }

  verbose(message: string, context?: LogContext): void {
    this.debug(message, context);
  }
}
