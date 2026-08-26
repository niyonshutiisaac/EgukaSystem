import { Injectable } from '@nestjs/common';
import { MovementType, Prisma, SaleStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { InventoryService } from '../inventory/inventory.service';
import { ConflictException, NotFoundException } from '../common/exceptions/api.exception';
import { CreateSaleDto, VoidSaleDto } from './dto/sale.dto';

@Injectable()
export class SalesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly inventory: InventoryService,
  ) {}

  async create(tenantId: string, actorId: string, dto: CreateSaleDto) {
    if (dto.items.length === 0) {
      throw new ConflictException('A sale must contain at least one item');
    }

    // Idempotency: identical retries return the SAME sale, never a duplicate.
    if (dto.idempotencyKey) {
      const existing = await this.prisma.sale.findUnique({
        where: { tenantId_idempotencyKey: { tenantId, idempotencyKey: dto.idempotencyKey } },
      });
      if (existing) {
        return this.findById(tenantId, existing.id);
      }
      const inFlight = await this.redis.get(`sale:inflight:${tenantId}:${dto.idempotencyKey}`);
      if (inFlight) {
        throw new ConflictException('Sale is being processed — retry shortly', { retryAfter: 2 });
      }
      await this.redis.set(`sale:inflight:${tenantId}:${dto.idempotencyKey}`, '1', 30);
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const productIds = [...new Set(dto.items.map((i) => i.productId))];
        const products = await tx.product.findMany({
          where: { id: { in: productIds }, tenantId, isActive: true },
        });
        const productMap = new Map(products.map((p) => [p.id, p]));
        if (productMap.size !== productIds.length) {
          throw new NotFoundException('One or more products do not exist or are inactive');
        }

        let subtotal = 0;
        for (const item of dto.items) {
          const product = productMap.get(item.productId)!;
          if (item.unitPrice !== product.salePrice) {
            throw new ConflictException(
              `Price for "${product.name}" changed — refresh and retry (${product.salePrice} RWF)`,
            );
          }
          subtotal += item.qty * product.salePrice;
        }

        const discount = Math.min(dto.discount ?? 0, subtotal);
        const tax = Math.max(dto.tax ?? 0, 0);
        const total = subtotal - discount + tax;
        const change = Math.max(dto.paid - total, 0);

        const saleNo = await this.nextSaleNo(tenantId);
        const sale = await tx.sale.create({
          data: {
            tenantId,
            branchId: dto.branchId ?? null,
            saleNo,
            subtotal,
            discount,
            tax,
            total,
            paid: dto.paid,
            change,
            paymentMethod: dto.paymentMethod,
            customerId: dto.customerId ?? null,
            cashierId: actorId,
            note: dto.note,
            idempotencyKey: dto.idempotencyKey ?? null,
          },
        });

        for (const item of dto.items) {
          await tx.saleItem.create({
            data: {
              saleId: sale.id,
              productId: item.productId,
              qty: item.qty,
              unitPrice: item.unitPrice,
              lineTotal: item.qty * item.unitPrice,
            },
          });
          await this.inventory.applyMovement({
            tenantId,
            productId: item.productId,
            branchId: dto.branchId ?? null,
            type: MovementType.sale,
            qty: -item.qty,
            refType: 'sale',
            refId: sale.id,
            createdById: actorId,
            tx,
          });
        }

        if (dto.customerId) {
          const customer = await tx.customer.findFirst({
            where: { id: dto.customerId, tenantId },
          });
          if (!customer) throw new NotFoundException('Customer not found');
          const unpaid = total - dto.paid;
          if (unpaid > 0) {
            await tx.customer.update({
              where: { id: customer.id },
              data: { balance: { increment: unpaid } },
            });
          }
        }

        return tx.sale.findUniqueOrThrow({
          where: { id: sale.id },
          include: {
            items: { include: { product: { select: { id: true, name: true, sku: true } } } },
          },
        });
      });
    } finally {
      if (dto.idempotencyKey) {
        await this.redis.del(`sale:inflight:${tenantId}:${dto.idempotencyKey}`);
      }
    }
  }

  async list(
    tenantId: string,
    params: {
      cursor?: string;
      limit?: number;
      status?: SaleStatus;
      customerId?: string;
      from?: string;
      to?: string;
    },
  ) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const where: Prisma.SaleWhereInput = { tenantId };
    if (params.status) where.status = params.status;
    if (params.customerId) where.customerId = params.customerId;
    if (params.from || params.to) {
      where.createdAt = {
        ...(params.from ? { gte: new Date(params.from) } : {}),
        ...(params.to ? { lte: new Date(params.to) } : {}),
      };
    }

    const decoded = params.cursor ? this.decodeCursor(params.cursor) : null;
    if (decoded) {
      where.OR = [
        { createdAt: { lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, id: { lt: decoded.id } },
      ];
    }

    const rows = await this.prisma.sale.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: {
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        customer: { select: { id: true, name: true, phone: true } },
        cashier: { select: { id: true, name: true } },
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

  async findById(tenantId: string, id: string) {
    const sale = await this.prisma.sale.findFirst({
      where: { id, tenantId },
      include: {
        items: { include: { product: { select: { id: true, name: true, sku: true } } } },
        customer: { select: { id: true, name: true, phone: true } },
        cashier: { select: { id: true, name: true } },
      },
    });
    if (!sale) throw new NotFoundException('Sale not found');
    return sale;
  }

  async void(tenantId: string, id: string, actorId: string, dto: VoidSaleDto) {
    return this.prisma.$transaction(async (tx) => {
      const sale = await tx.sale.findFirst({ where: { id, tenantId } });
      if (!sale) throw new NotFoundException('Sale not found');
      if (sale.status !== 'completed') {
        throw new ConflictException('Only completed sales can be voided');
      }

      const items = await tx.saleItem.findMany({ where: { saleId: sale.id } });
      for (const item of items) {
        await this.inventory.applyMovement({
          tenantId,
          productId: item.productId,
          type: MovementType.adjustment,
          qty: item.qty,
          refType: 'sale_void',
          refId: sale.id,
          note: dto.reason ?? 'Sale voided',
          createdById: actorId,
          tx,
        });
      }

      if (sale.customerId) {
        const unpaid = sale.total - sale.paid;
        if (unpaid > 0) {
          await tx.customer.update({
            where: { id: sale.customerId },
            data: { balance: { decrement: unpaid } },
          });
        }
      }

      return tx.sale.update({
        where: { id },
        data: { status: 'voided', voidedAt: new Date(), voidedById: actorId },
      });
    });
  }

  async summary(tenantId: string, from?: string, to?: string) {
    const gte = from ? new Date(from) : new Date(new Date().setHours(0, 0, 0, 0));
    const lte = to ? new Date(to) : new Date();
    const where: Prisma.SaleWhereInput = { tenantId, status: 'completed', createdAt: { gte, lte } };

    const [agg, count] = await Promise.all([
      this.prisma.sale.aggregate({
        where,
        _sum: { total: true, subtotal: true, discount: true, tax: true },
        _count: { _all: true },
      }),
      this.prisma.sale.count({ where: { tenantId, status: 'completed' } }),
    ]);

    return {
      period: { from: gte, to: lte },
      total: agg._sum.total ?? 0,
      subtotal: agg._sum.subtotal ?? 0,
      discount: agg._sum.discount ?? 0,
      tax: agg._sum.tax ?? 0,
      salesCount: agg._count._all,
      allTimeCount: count,
      averageSale: agg._count._all > 0 ? Math.round((agg._sum.total ?? 0) / agg._count._all) : 0,
    };
  }

  private async nextSaleNo(tenantId: string): Promise<string> {
    const day = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    if (this.redis.isAvailable) {
      const seq = await this.redis.raw!.incr(`saleNo:${tenantId}:${day}`);
      if (seq === 1) {
        await this.redis.raw!.expire(`saleNo:${tenantId}:${day}`, 172800);
      }
      return `INV-${day}-${String(seq).padStart(4, '0')}`;
    }
    return `INV-${day}-${Date.now().toString(36).toUpperCase()}`;
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
