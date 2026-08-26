import { Injectable } from '@nestjs/common';
import { MovementType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InsufficientStockException, NotFoundException } from '../common/exceptions/api.exception';

interface MovementInput {
  tenantId: string;
  productId: string;
  branchId?: string | null;
  type: MovementType;
  qty: number; // signed
  refType?: string;
  refId?: string;
  note?: string;
  createdById?: string | null;
  tx?: Prisma.TransactionClient;
}

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Applies a signed quantity change atomically (check-and-decrement via
   * updateMany condition — no lost updates under concurrency) and appends a
   * ledger movement. Uses the optional tx client so callers can compose
   * multi-step transactions (sales, transfers).
   */
  async applyMovement(input: MovementInput): Promise<void> {
    const db = input.tx ?? this.prisma;
    const product = await db.product.findFirst({
      where: { id: input.productId, tenantId: input.tenantId },
      select: { id: true, name: true, stock: true },
    });
    if (!product) throw new NotFoundException('Product not found');

    if (input.qty < 0) {
      const result = await db.product.updateMany({
        where: {
          id: input.productId,
          tenantId: input.tenantId,
          stock: { gte: -input.qty },
        },
        data: { stock: { decrement: -input.qty } },
      });
      if (result.count === 0) {
        throw new InsufficientStockException(product.name, product.stock, -input.qty);
      }
    } else {
      await db.product.updateMany({
        where: { id: input.productId, tenantId: input.tenantId },
        data: { stock: { increment: input.qty } },
      });
    }

    const after = await db.product.findUnique({
      where: { id: input.productId },
      select: { stock: true },
    });

    await db.inventoryMovement.create({
      data: {
        tenantId: input.tenantId,
        branchId: input.branchId,
        productId: input.productId,
        type: input.type,
        qty: input.qty,
        beforeQty: product.stock,
        afterQty: after?.stock ?? product.stock + input.qty,
        refType: input.refType,
        refId: input.refId,
        note: input.note,
        createdById: input.createdById,
      },
    });
  }

  async listMovements(
    tenantId: string,
    params: {
      productId?: string;
      type?: MovementType;
      cursor?: string;
      limit?: number;
    },
  ) {
    const { cursor, limit = 20 } = params;
    const where: Prisma.InventoryMovementWhereInput = { tenantId };
    if (params.productId) where.productId = params.productId;
    if (params.type) where.type = params.type;

    const decoded = cursor ? this.decodeCursor(cursor) : null;
    if (decoded) {
      where.OR = [
        { createdAt: { lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, id: { lt: decoded.id } },
      ];
    }

    const rows = await this.prisma.inventoryMovement.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: { product: { select: { id: true, name: true, sku: true } } },
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
