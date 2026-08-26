import { Module } from '@nestjs/common';
import { PlansService } from './plans.service';
import { PlanEntitlementService } from './plan-entitlement.service';
import { PlansController } from './plans.controller';

@Module({
  controllers: [PlansController],
  providers: [PlansService, PlanEntitlementService],
  exports: [PlanEntitlementService, PlansService],
})
export class PlansModule {}
