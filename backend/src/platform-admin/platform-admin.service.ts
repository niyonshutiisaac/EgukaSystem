import { Injectable } from '@nestjs/common';
import { PlanId, Prisma, TenantStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ConflictException, NotFoundException } from '../common/exceptions/api.exception';
import { decodeCursor, encodeCursor, keysetWhere, Paginated } from '../common/utils/pagination';

@Injectable()
export class PlatformAdminService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  // ---------------------------------------------------------------------------
  // Registration requests
  // ---------------------------------------------------------------------------

  async listRequests(cursor?: string, limitRaw?: string): Promise<Paginated<unknown>> {
    const limit = Math.min(Math.max(parseInt(limitRaw ?? '20', 10) || 20, 1), 100);
    const decoded = decodeCursor(cursor);
    const where = keysetWhere<Prisma.RegistrationRequestWhereInput>(decoded, {});

    const requests = await this.prisma.registrationRequest.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            businessType: true,
            email: true,
            phone: true,
            region: true,
            district: true,
            status: true,
            createdAt: true,
          },
        },
      },
    });

    const hasMore = requests.length > limit;
    const page = requests.slice(0, limit);
    const last = page[page.length - 1];

    return {
      data: page,
      meta: {
        hasMore,
        nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
      },
    };
  }

  async approveRequest(requestId: string, reviewerId: string, trialDays = 14) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.registrationRequest.findUnique({
        where: { id: requestId },
        include: { tenant: { include: { subscriptions: true } } },
      });
      if (!request) throw new NotFoundException('Registration request not found');
      if (request.status !== 'pending') {
        throw new ConflictException('Request has already been reviewed');
      }

      const trialEndsAt = new Date(Date.now() + trialDays * 86400000);

      await tx.registrationRequest.update({
        where: { id: requestId },
        data: { status: 'approved', reviewedBy: reviewerId, reviewedAt: new Date() },
      });
      await tx.tenant.update({
        where: { id: request.tenantId },
        data: { status: 'trial', trialEndsAt },
      });
      await tx.subscription.updateMany({
        where: { tenantId: request.tenantId },
        data: { trialEndsAt },
      });

      await this.redis.del(`tenant:profile:${request.tenantId}`);

      return { approved: true, trialDays, trialEndsAt };
    });
  }

  async rejectRequest(requestId: string, reviewerId: string, notes?: string) {
    return this.prisma.$transaction(async (tx) => {
      const request = await tx.registrationRequest.findUnique({ where: { id: requestId } });
      if (!request) throw new NotFoundException('Registration request not found');
      if (request.status !== 'pending') {
        throw new ConflictException('Request has already been reviewed');
      }

      await tx.registrationRequest.update({
        where: { id: requestId },
        data: { status: 'rejected', reviewedBy: reviewerId, reviewedAt: new Date(), notes },
      });
      await tx.tenant.update({
        where: { id: request.tenantId },
        data: { status: 'rejected' },
      });

      await this.redis.del(`tenant:profile:${request.tenantId}`);

      return { rejected: true };
    });
  }

  // ---------------------------------------------------------------------------
  // Tenant directory / lifecycle
  // ---------------------------------------------------------------------------

  async listTenants(cursor?: string, limitRaw?: string, status?: TenantStatus) {
    const limit = Math.min(Math.max(parseInt(limitRaw ?? '20', 10) || 20, 1), 100);
    const decoded = decodeCursor(cursor);
    const where = keysetWhere<Prisma.TenantWhereInput>(decoded, status ? { status } : {});

    const tenants = await this.prisma.tenant.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        plan: { select: { id: true, name: true } },
        _count: { select: { users: true, sales: true } },
      },
    });

    const hasMore = tenants.length > limit;
    const page = tenants.slice(0, limit);
    const last = page[page.length - 1];

    return {
      data: page,
      meta: {
        hasMore,
        nextCursor: hasMore && last ? encodeCursor(last.createdAt, last.id) : null,
      },
    };
  }

  async setTenantStatus(tenantId: string, status: TenantStatus, trialDays?: number) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const data: Record<string, unknown> = { status };
    if (status === 'trial' || status === 'active') {
      data.trialEndsAt = trialDays
        ? new Date(Date.now() + trialDays * 86400000)
        : tenant.trialEndsAt;
      data.suspendedAt = null;
    }
    if (status === 'suspended' || status === 'expired') {
      data.suspendedAt = new Date();
    }

    const updated = await this.prisma.tenant.update({ where: { id: tenantId }, data });
    await this.redis.del(`tenant:profile:${tenantId}`);
    await this.redis.delPattern(`user:*`);
    return updated;
  }

  async changePlan(tenantId: string, planId: PlanId, days = 30) {
    const plan = await this.prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) throw new NotFoundException('Plan not found');
    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new NotFoundException('Tenant not found');

    const renewsAt = new Date(Date.now() + days * 86400000);

    return this.prisma
      .$transaction(async (tx) => {
        await tx.tenant.update({ where: { id: tenantId }, data: { planId } });
        await tx.subscription.create({
          data: {
            tenantId,
            planId,
            status: 'active',
            amount: plan.priceMonthly,
            startedAt: new Date(),
            renewsAt,
          },
        });
      })
      .then(async () => {
        await this.redis.del(`tenant:profile:${tenantId}`);
        await this.redis.delPattern(`user:*`);
        return { changed: true, planId, renewsAt };
      });
  }
}
