import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  private readonly ADMIN_API_KEY = process.env.ADMIN_API_KEY || 'alo-admin-secret-key-2024';

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.headers['x-admin-api-key'] as string;

    if (!apiKey) {
      throw new UnauthorizedException('Admin API key is required');
    }

    if (apiKey !== this.ADMIN_API_KEY) {
      throw new UnauthorizedException('Invalid admin API key');
    }

    // Add admin info to request for audit trail
    request['admin'] = {
      apiKey: apiKey.substring(0, 8) + '****',
      timestamp: new Date(),
    };

    return true;
  }
}
