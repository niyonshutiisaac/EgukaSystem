import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../common/types/auth-user';
import { CreateBranchDto, UpdateBranchDto, UpdateTenantDto } from './dto/tenant.dto';

@ApiTags('tenants')
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenants: TenantsService) {}

  @Get('me')
  me(@CurrentUser('tenantId') tenantId: string) {
    return this.tenants.getProfile(tenantId);
  }

  @Get('me/usage')
  usage(@CurrentUser('tenantId') tenantId: string) {
    return this.tenants.getUsage(tenantId);
  }

  @Patch('me')
  update(@CurrentUser('tenantId') tenantId: string, @Body() dto: UpdateTenantDto) {
    return this.tenants.updateProfile(tenantId, dto);
  }

  @Get('branches')
  branches(@CurrentUser('tenantId') tenantId: string) {
    return this.tenants.listBranches(tenantId);
  }

  @Post('branches')
  createBranch(@CurrentUser() user: AuthUser, @Body() dto: CreateBranchDto) {
    return this.tenants.createBranch(user.tenantId!, user.planId!, dto);
  }

  @Patch('branches/:id')
  updateBranch(
    @CurrentUser('tenantId') tenantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateBranchDto,
  ) {
    return this.tenants.updateBranch(tenantId, id, dto);
  }

  @Delete('branches/:id')
  removeBranch(@CurrentUser('tenantId') tenantId: string, @Param('id') id: string) {
    return this.tenants.removeBranch(tenantId, id);
  }
}
