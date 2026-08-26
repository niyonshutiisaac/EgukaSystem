import { Injectable } from '@nestjs/common';
import { BatchStatus, MovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { InventoryService } from '../inventory/inventory.service';
import { ConflictException, NotFoundException } from '../common/exceptions/api.exception';
import { CompleteBatchDto, CreateBatchDto, FailBatchDto } from './dto/batch.dto';

@Injectable()
export class ProductionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly inventory: InventoryService,
  ) {}

  async list(tenantId: string, params: { status?: BatchStatus; cursor?: string; limit?: number }) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const where: Prisma.BatchWhereInput = { tenantId };
    if (params.status) where.status = params.status;

    const decoded = params.cursor ? this.decodeCursor(params.cursor) : null;
    if (decoded) {
      where.OR = [
        { createdAt: { lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, id: { lt: decoded.id } },
      ];
    }

    const rows = await this.prisma.batch.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        recipe: { include: { product: { select: { id: true, name: true, sku: true } } } },
      },
    });

    const hasMore = rows.length > limit;
    const page = rows.slice(0, limit);
    const last = page[page.length - 1];

    return {
      data: page,
      meta: {
        hasMore,
        nextCursor: hasMore && last ? this.encodeCursor(last.createdAt, last.id) : null,
      },
    };
  }

  async getById(tenantId: string, id: string) {
    const batch = await this.prisma.batch.findFirst({
      where: { id, tenantId },
      include: {
        recipe: {
          include: {
            product: { select: { id: true, name: true, sku: true, unit: true } },
            ingredients: {
              include: { product: { select: { id: true, name: true, sku: true, unit: true } } },
            },
          },
        },
      },
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async create(tenantId: string, actorId: string, dto: CreateBatchDto) {
    const recipe = await this.prisma.recipe.findFirst({
      where: { id: dto.recipeId, tenantId, isActive: true },
      include: { ingredients: true },
    });
    if (!recipe) throw new NotFoundException('Active recipe not found');

    const batchNo = await this.nextBatchNo(tenantId);
    return this.prisma.batch.create({
      data: {
        tenantId,
        recipeId: recipe.id,
        batchNo,
        plannedQty: dto.plannedQty,
        status: 'planned',
        note: dto.note,
        createdById: actorId,
      },
    });
  }

  /** Consumes ingredient stock (production_input) and marks the batch started. */
  async start(tenantId: string, id: string, actorId: string) {
    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findFirst({ where: { id, tenantId } });
      if (!batch) throw new NotFoundException('Batch not found');
      if (batch.status !== 'planned') {
        throw new ConflictException(`Batch is ${batch.status} — only planned batches can start`);
      }

      const recipe = await tx.recipe.findUnique({
        where: { id: batch.recipeId },
        include: { ingredients: true },
      });
      if (!recipe) throw new NotFoundException('Recipe not found');

      for (const ing of recipe.ingredients) {
        await this.inventory.applyMovement({
          tenantId,
          productId: ing.productId,
          type: MovementType.production_input,
          qty: -ing.quantity,
          refType: 'batch',
          refId: batch.id,
          note: `Batch ${batch.batchNo}: ${recipe.name}`,
          createdById: actorId,
          tx,
        });
      }

      return tx.batch.update({
        where: { id },
        data: { status: 'started', startedAt: new Date() },
      });
    });
  }

  /** Adds finished goods (production_output) plus waste, marks completed. */
  async complete(tenantId: string, id: string, actorId: string, dto: CompleteBatchDto) {
    return this.prisma.$transaction(async (tx) => {
      const batch = await tx.batch.findFirst({ where: { id, tenantId } });
      if (!batch) throw new NotFoundException('Batch not found');
      if (batch.status !== 'started') {
        throw new ConflictException(`Batch is ${batch.status} — only started batches can complete`);
      }

      const recipe = await tx.recipe.findUnique({ where: { id: batch.recipeId } });
      if (!recipe) throw new NotFoundException('Recipe not found');

      await this.inventory.applyMovement({
        tenantId,
        productId: recipe.productId,
        type: MovementType.production_output,
        qty: dto.completedQty,
        refType: 'batch',
        refId: batch.id,
        note: `Batch ${batch.batchNo}: ${recipe.name}`,
        createdById: actorId,
        tx,
      });

      if (dto.wasteQty && dto.wasteQty > 0) {
        await this.inventory.applyMovement({
          tenantId,
          productId: recipe.productId,
          type: MovementType.waste,
          qty: -dto.wasteQty,
          refType: 'batch',
          refId: batch.id,
          note: `Batch ${batch.batchNo} waste`,
          createdById: actorId,
          tx,
        });
      }

      return tx.batch.update({
        where: { id },
        data: {
          status: 'completed',
          completedAt: new Date(),
          completedQty: dto.completedQty,
          wasteQty: dto.wasteQty ?? 0,
          note: dto.note ?? batch.note,
        },
      });
    });
  }

  async fail(tenantId: string, id: string, dto: FailBatchDto) {
    const batch = await this.prisma.batch.findFirst({ where: { id, tenantId } });
    if (!batch) throw new NotFoundException('Batch not found');
    if (batch.status !== 'started' && batch.status !== 'planned') {
      throw new ConflictException(`Batch is ${batch.status} — cannot fail it`);
    }
    return this.prisma.batch.update({
      where: { id },
      data: { status: 'failed', note: dto.note ?? batch.note },
    });
  }

  private async nextBatchNo(tenantId: string): Promise<string> {
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    if (this.redis.isAvailable) {
      const seq = await this.redis.raw!.incr(`batchNo:${tenantId}:${day}`);
      if (seq === 1) {
        await this.redis.raw!.expire(`batchNo:${tenantId}:${day}`, 172800);
      }
      return `BATCH-${day}-${String(seq).padStart(3, '0')}`;
    }
    return `BATCH-${day}-${Date.now().toString(36).toUpperCase()}`;
  }

  private encodeCursor(createdAt: Date, id: string): string {
    return Buffer.from(`${createdAt.toISOString()}|${id}`).toString('base64url');
  }

  private decodeCursor(cursor: string): { createdAt: Date; id: string } | null {
    try {
      const [iso, id] = Buffer.from(cursor, 'base64url').toString('utf8').split('|');
      const createdAt = new Date(iso);
      return Number.isNaN(createdAt.getTime()) ? null : { createdAt, id };
    } catch {
      return null;
    }
  }
}
