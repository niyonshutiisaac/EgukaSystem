import { SetMetadata } from '@nestjs/common';

export const PLAN_FEATURE_KEY = 'planFeature';

/**
 * Requires the tenant's plan to include the given feature flag
 * (e.g. 'multiBranch', 'production', 'forecasting', 'aiAssistant').
 */
export const PlanFeature = (feature: string) => SetMetadata(PLAN_FEATURE_KEY, feature);
