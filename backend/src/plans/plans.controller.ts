import { Controller, Get, Param, ParseEnumPipe } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PlanId } from '@prisma/client';
import { PlansService } from './plans.service';
import { PlanEntitlementService } from './plan-entitlement.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('plans')
@Controller('plans')
export class PlansController {
  constructor(
    private readonly plans: PlansService,
    private readonly entitlement: PlanEntitlementService,
  ) {}

  @Public()
  @Get()
  listActive() {
    return this.plans.listActive();
  }

  @Public()
  @Get(':id')
  getOne(@Param('id', new ParseEnumPipe(PlanId)) id: PlanId) {
    return this.plans.getById(id);
  }

  @Public()
  @Get(':id/features')
  features(@Param('id', new ParseEnumPipe(PlanId)) id: PlanId) {
    return this.entitlement.getFeatures(id);
  }
}
