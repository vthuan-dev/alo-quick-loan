import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);
    
    if (!token) {
      throw new UnauthorizedException('Access token required');
    }

    try {
      // Use JwtModule configured secret (do not override here)
      const payload = await this.jwtService.verifyAsync(token);

      // Check if user has admin role
      if (!payload.role || !['SUPER_ADMIN', 'ADMIN', 'SALES', 'SUPPORT'].includes(payload.role)) {
        throw new UnauthorizedException('Admin access required');
      }

      // Attach user info to request
      request.user = payload;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
