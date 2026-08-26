import { Injectable, Logger } from '@nestjs/common';
import { PlanId } from '@prisma/client';
import { RedisService } from '../redis/redis.service';
import { PrismaService } from '../prisma/prisma.service';

interface PlanFeatures {
  multiBranch: boolean;
  production: boolean;
  forecasting: boolean;
  aiAssistant: boolean;
  advancedReports: boolean;
  expenses: boolean;
  procurement: boolean;
  auditLogs: boolean;
  apiAccess: boolean;
  bulkImport: boolean;
}

const CACHE_TTL = 600;

/**
 * Server-side plan entitlement — the backend mirror of the frontend
 * `canAccess`/`planRequirementFor` logic in src/lib/catalog.ts.
 */
@Injectable()
export class PlanEntitlementService {
  private readonly logger = new Logger(PlanEntitlementService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async hasFeature(tenantId: string, planId: PlanId, feature: string): Promise<boolean> {
    const features = await this.getFeatures(planId);
    return Boolean(features && features[feature as keyof PlanFeatures]);
  }

  async getFeatures(planId: PlanId): Promise<PlanFeatures | null> {
    const cacheKey = `plan:features:${planId}`;
    const cached = await this.redis.get<PlanFeatures>(cacheKey);
    if (cached) return cached;

    try {
      const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) return null;
      const features = plan.features as unknown as PlanFeatures;
      await this.redis.set(cacheKey, features, CACHE_TTL);
      return features;
    } catch (err) {
      this.logger.warn(`Plan lookup failed: ${(err as Error).message}`);
      return null;
    }
  }

  /** Deny-by-default fallback used when the plans table is unreachable. */
  static readonly DEFAULT_FEATURES: PlanFeatures = {
    multiBranch: false,
    production: false,
    forecasting: false,
    aiAssistant: true,
    advancedReports: false,
    expenses: true,
    procurement: false,
    auditLogs: false,
    apiAccess: false,
    bulkImport: false,
  };
}
