import { Injectable } from '@nestjs/common';
import { Plan } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CACHE_TTL = 600;

@Injectable()
export class PlansService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async listActive(): Promise<Plan[]> {
    const cacheKey = 'plans:active';
    const cached = await this.redis.get<Plan[]>(cacheKey);
    if (cached) return cached;

    const plans = await this.prisma.plan.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
    });
    await this.redis.set(cacheKey, plans, CACHE_TTL);
    return plans;
  }

  async getById(id: string): Promise<Plan | null> {
    return this.prisma.plan.findUnique({ where: { id: id as Plan['id'] } });
  }
}
