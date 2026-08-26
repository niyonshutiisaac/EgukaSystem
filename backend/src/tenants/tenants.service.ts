import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  ConflictException,
  NotFoundException,
  PlanRequiredException,
} from '../common/exceptions/api.exception';
import { PlanEntitlementService } from '../plans/plan-entitlement.service';
import { CreateBranchDto, UpdateBranchDto, UpdateTenantDto } from './dto/tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly entitlement: PlanEntitlementService,
  ) {}

  async getProfile(tenantId: string) {
    const cacheKey = `tenant:profile:${tenantId}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        branches: { orderBy: { isDefault: 'desc' } },
        plan: true,
        subscriptions: { orderBy: { startedAt: 'desc' }, take: 1 },
        _count: {
          select: { users: true, products: true, sales: true, customers: true },
        },
      },
    });
    if (!tenant) throw new NotFoundException('Business not found');

    await this.redis.set(cacheKey, tenant, 60);
    return tenant;
  }

  async updateProfile(tenantId: string, dto: UpdateTenantDto) {
    const tenant = await this.prisma.tenant.update({
      where: { id: tenantId },
      data: dto,
    });
    await this.redis.del(`tenant:profile:${tenantId}`);
    return tenant;
  }

  async getUsage(tenantId: string) {
    const [seatsUsed, aiCredits, monthlySales] = await Promise.all([
      this.prisma.user.count({ where: { tenantId } }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId },
        select: { aiCredits: true, aiCreditLimit: true, plan: { select: { seats: true } } },
      }),
      this.prisma.sale.aggregate({
        where: { tenantId, createdAt: { gte: new Date(new Date().setDate(1)) } },
        _sum: { total: true },
      }),
    ]);
    return {
      seatsUsed,
      seatsLimit: aiCredits?.plan.seats ?? 0,
      aiCredits: aiCredits?.aiCredits ?? 0,
      aiCreditLimit: aiCredits?.aiCreditLimit ?? 0,
      monthlySalesTotal: monthlySales._sum.total ?? 0,
    };
  }

  // ---------------------------------------------------------------------------
  // Branches
  // ---------------------------------------------------------------------------

  async listBranches(tenantId: string) {
    return this.prisma.branch.findMany({
      where: { tenantId },
      orderBy: { isDefault: 'desc' },
    });
  }

  async createBranch(tenantId: string, planId: string, dto: CreateBranchDto) {
    const count = await this.prisma.branch.count({ where: { tenantId } });
    const hasMultiBranch = await this.entitlement.hasFeature(
      tenantId,
      planId as never,
      'multiBranch',
    );
    if (count > 0 && !hasMultiBranch) {
      throw new PlanRequiredException('multiBranch', { branches: count });
    }
    if (count >= 10) {
      throw new ConflictException('Maximum of 10 branches reached');
    }
    return this.prisma.branch.create({
      data: { tenantId, name: dto.name, phone: dto.phone },
    });
  }

  async updateBranch(tenantId: string, branchId: string, dto: UpdateBranchDto) {
    await this.ensureBranch(tenantId, branchId);
    return this.prisma.$transaction(async (tx) => {
      if (dto.isDefault) {
        await tx.branch.updateMany({
          where: { tenantId, isDefault: true },
          data: { isDefault: false },
        });
      }
      return tx.branch.update({ where: { id: branchId }, data: dto });
    });
  }

  async removeBranch(tenantId: string, branchId: string) {
    const branch = await this.ensureBranch(tenantId, branchId);
    if (branch.isDefault) {
      throw new ConflictException('The default branch cannot be removed');
    }
    await this.prisma.branch.delete({ where: { id: branchId } });
    return { deleted: true };
  }

  private async ensureBranch(tenantId: string, branchId: string) {
    const branch = await this.prisma.branch.findFirst({ where: { id: branchId, tenantId } });
    if (!branch) throw new NotFoundException('Branch not found');
    return branch;
  }
}
