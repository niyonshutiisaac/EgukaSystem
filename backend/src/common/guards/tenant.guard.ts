import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { AuthUser } from '../types/auth-user';
import {
  ForbiddenException,
  TenantBlockedException,
  TenantPendingException,
} from '../exceptions/api.exception';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Enforces tenant context: every non-superadmin user must belong to a tenant
 * whose status allows access. Suspended/expired tenants are blocked, pending
 * tenants cannot access business APIs. Public routes are skipped.
 */
@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUser | undefined;

    if (!user) {
      throw new ForbiddenException('Authentication required');
    }
    if (user.isSuperadmin) {
      return true;
    }
    if (!user.tenantId) {
      throw new ForbiddenException('User is not attached to a business');
    }
    if (user.tenantStatus === 'suspended' || user.tenantStatus === 'expired') {
      throw new TenantBlockedException();
    }
    if (user.tenantStatus === 'pending' || user.tenantStatus === 'rejected') {
      throw new TenantPendingException();
    }
    return true;
  }
}
