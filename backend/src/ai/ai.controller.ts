import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiInsightType } from '@prisma/client';
import { AiService } from './ai.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';
import { PlanFeature } from '../common/decorators/plan-feature.decorator';

class GenerateInsightDto {
  type: AiInsightType;
}

@ApiTags('ai')
@PlanFeature('aiAssistant')
@Controller('ai')
export class AiController {
  constructor(private readonly ai: AiService) {}

  @Post('insights')
  generate(@CurrentUser() user: AuthUser, @Body() dto: GenerateInsightDto) {
    return this.ai.generateInsight(user.tenantId!, user.id, dto.type ?? AiInsightType.summary);
  }

  @Get('insights')
  list(@CurrentUser('tenantId') tenantId: string, @Query('limit') limit?: string) {
    return this.ai.list(tenantId, limit ? parseInt(limit, 10) : 20);
  }

  @Get('insights/:id')
  getOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.ai.getById(tenantId, id);
  }

  @Get('credits')
  credits(@CurrentUser('tenantId') tenantId: string) {
    return this.ai.creditsOf(tenantId);
  }
}
