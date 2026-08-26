import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BatchStatus } from '@prisma/client';
import { ProductionService } from './production.service';
import { CompleteBatchDto, CreateBatchDto, FailBatchDto } from './dto/batch.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';
import { PlanFeature } from '../common/decorators/plan-feature.decorator';

@ApiTags('production')
@PlanFeature('production')
@Controller('production')
export class ProductionController {
  constructor(private readonly production: ProductionService) {}

  @Get('batches')
  list(
    @CurrentUser('tenantId') tenantId: string,
    @Query('status') status?: BatchStatus,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    return this.production.list(tenantId, {
      status,
      cursor,
      limit: limit ? parseInt(limit, 10) : 20,
    });
  }

  @Get('batches/:id')
  getOne(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.production.getById(tenantId, id);
  }

  @Post('batches')
  create(@CurrentUser() user: AuthUser, @Body() dto: CreateBatchDto) {
    return this.production.create(user.tenantId!, user.id, dto);
  }

  @Patch('batches/:id/start')
  start(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.production.start(user.tenantId!, id, user.id);
  }

  @Patch('batches/:id/complete')
  complete(@CurrentUser() user: AuthUser, @Param('id') id: string, @Body() dto: CompleteBatchDto) {
    return this.production.complete(user.tenantId!, id, user.id, dto);
  }

  @Patch('batches/:id/fail')
  fail(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: FailBatchDto,
  ) {
    return this.production.fail(tenantId, id, dto);
  }
}
