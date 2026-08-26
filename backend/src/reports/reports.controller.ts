import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser('tenantId') tenantId: string, @Query('days') days?: string) {
    return this.reports.dashboard(tenantId, days ? parseInt(days, 10) : 30);
  }

  @Get('profit-loss')
  profitLoss(
    @CurrentUser('tenantId') tenantId: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.reports.profitLoss(tenantId, from, to);
  }
}
