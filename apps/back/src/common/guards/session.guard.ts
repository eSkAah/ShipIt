import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../auth/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const sessionId = request.cookies?.shipit_session;

    if (!sessionId) {
      throw new UnauthorizedException('No session found');
    }

    try {
      const { user } = await this.authService.getSession(sessionId);
      request.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired session');
    }
  }
}
