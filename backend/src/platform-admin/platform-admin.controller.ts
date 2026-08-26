import { Body, Controller, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Role, TenantStatus } from '@prisma/client';
import { PlatformAdminService } from './platform-admin.service';
import {
  ApproveRequestDto,
  ChangePlanDto,
  RejectRequestDto,
  UpdateTenantStatusDto,
} from './dto/admin.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('admin')
@Roles(Role.superadmin)
@Controller('admin')
export class PlatformAdminController {
  constructor(private readonly admin: PlatformAdminService) {}

  @Get('requests')
  listRequests(@Query('cursor') cursor?: string, @Query('limit') limit?: string) {
    return this.admin.listRequests(cursor, limit);
  }

  @Post('requests/:id/approve')
  approve(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: ApproveRequestDto,
  ) {
    return this.admin.approveRequest(id, reviewerId, dto.trialDays ?? 14);
  }

  @Post('requests/:id/reject')
  reject(
    @Param('id') id: string,
    @CurrentUser('id') reviewerId: string,
    @Body() dto: RejectRequestDto,
  ) {
    return this.admin.rejectRequest(id, reviewerId, dto.notes);
  }

  @Get('tenants')
  listTenants(
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: TenantStatus,
  ) {
    return this.admin.listTenants(cursor, limit, status);
  }

  @Patch('tenants/:id/status')
  setStatus(@Param('id') id: string, @Body() dto: UpdateTenantStatusDto) {
    return this.admin.setTenantStatus(id, dto.status, dto.trialDays);
  }

  @Patch('tenants/:id/plan')
  changePlan(@Param('id') id: string, @Body() dto: ChangePlanDto) {
    return this.admin.changePlan(id, dto.planId, dto.days);
  }
}
