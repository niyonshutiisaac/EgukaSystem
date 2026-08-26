import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { PLAN_FEATURE_KEY } from '../decorators/plan-feature.decorator';
import { AuthUser } from '../types/auth-user';
import { PlanRequiredException, ForbiddenException } from '../exceptions/api.exception';
import { PlanEntitlementService } from '../../plans/plan-entitlement.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Mirrors the frontend gating (src/lib/catalog.ts): role ∩ plan.
 * Superadmin bypasses. Requires the tenant plan to include the feature.
 */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly entitlement: PlanEntitlementService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const feature = this.reflector.getAllAndOverride<string>(PLAN_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!feature) return true;

    const request = context.switchToHttp().getRequest<Request>();
    const user = request.user as AuthUser | undefined;
    if (!user) throw new ForbiddenException('Authentication required');
    if (user.isSuperadmin) return true;
    if (!user.tenantId || !user.planId) {
      throw new PlanRequiredException(feature);
    }

    const allowed = await this.entitlement.hasFeature(user.tenantId, user.planId, feature);
    if (!allowed) {
      throw new PlanRequiredException(feature);
    }
    return true;
  }
}
