import { Injectable } from '@nestjs/common';
import { MovementType, Prisma, Product } from '@prisma/client';
import { randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ConflictException, NotFoundException } from '../common/exceptions/api.exception';
import { InventoryService } from '../inventory/inventory.service';
import { AdjustStockDto, CreateProductDto, UpdateProductDto } from './dto/product.dto';

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly inventory: InventoryService,
  ) {}

  async list(
    tenantId: string,
    params: {
      search?: string;
      ingredientOnly?: boolean;
      activeOnly?: boolean;
      cursor?: string;
      limit?: number;
    },
  ) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const orConditions: Prisma.ProductWhereInput[] = [];
    if (params.search) {
      orConditions.push(
        { name: { contains: params.search, mode: 'insensitive' } },
        { sku: { contains: params.search, mode: 'insensitive' } },
      );
    }
    if (params.ingredientOnly) orConditions.push({ isIngredient: true });
    if (params.activeOnly) orConditions.push({ isActive: true });

    const decoded = params.cursor ? this.decodeCursor(params.cursor) : null;
    if (decoded) {
      orConditions.push(
        { createdAt: { lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, id: { lt: decoded.id } },
      );
    }

    const where: Prisma.ProductWhereInput = {
      tenantId,
      ...(orConditions.length ? { OR: orConditions } : {}),
    };

    const rows = await this.prisma.product.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
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

  async getById(tenantId: string, id: string): Promise<Product> {
    const product = await this.prisma.product.findFirst({ where: { id, tenantId } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async create(tenantId: string, branchId: string | null, dto: CreateProductDto) {
    const sku = dto.sku?.trim()?.toUpperCase() || this.generateSku(dto.name);
    const existing = await this.prisma.product.findFirst({ where: { tenantId, sku } });
    if (existing) {
      throw new ConflictException(`SKU "${sku}" already exists`);
    }

    return this.prisma
      .$transaction(async (tx) => {
        const product = await tx.product.create({
          data: {
            tenantId,
            branchId,
            name: dto.name.trim(),
            sku,
            category: dto.category,
            unit: dto.unit ?? 'pcs',
            costPrice: dto.costPrice ?? 0,
            salePrice: dto.salePrice,
            stock: dto.stock ?? 0,
            minStock: dto.minStock ?? 0,
            isIngredient: dto.isIngredient ?? false,
          },
        });

        if (dto.stock && dto.stock > 0) {
          await this.inventory.applyMovement({
            tenantId,
            productId: product.id,
            branchId,
            type: MovementType.purchase,
            qty: dto.stock,
            note: 'Initial stock',
            tx,
          });
        }
        return product;
      })
      .then(async (product) => {
        await this.invalidate(tenantId);
        return product;
      });
  }

  async update(tenantId: string, id: string, dto: UpdateProductDto) {
    await this.getById(tenantId, id);
    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
    });
    await this.invalidate(tenantId);
    return product;
  }

  async adjustStock(tenantId: string, id: string, actorId: string, dto: AdjustStockDto) {
    await this.getById(tenantId, id);
    await this.inventory.applyMovement({
      tenantId,
      productId: id,
      type: MovementType.adjustment,
      qty: dto.qty,
      note: dto.note ?? 'Manual adjustment',
      createdById: actorId,
    });
    await this.invalidate(tenantId);
    return this.getById(tenantId, id);
  }

  async remove(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    const usage = await this.prisma.saleItem.count({ where: { productId: id } });
    if (usage > 0) {
      await this.prisma.product.update({ where: { id }, data: { isActive: false } });
      await this.invalidate(tenantId);
      return {
        deactivated: true,
        reason: 'Product has sales history — deactivated instead of deleted',
      };
    }
    await this.prisma.product.delete({ where: { id } });
    await this.invalidate(tenantId);
    return { deleted: true };
  }

  async getLowStock(tenantId: string, limit = 50) {
    return this.prisma.product.findMany({
      where: { tenantId, isActive: true, stock: { lte: this.prisma.product.fields.minStock } },
      orderBy: { stock: 'asc' },
      take: limit,
    });
  }

  private generateSku(name: string): string {
    const prefix =
      name
        .replace(/[^a-zA-Z0-9]/g, '')
        .slice(0, 4)
        .toUpperCase() || 'ITM';
    return `${prefix}-${randomBytes(3).toString('hex').toUpperCase()}`;
  }

  private async invalidate(tenantId: string): Promise<void> {
    await this.redis.delPattern(`products:${tenantId}:*`);
    await this.redis.del(`tenant:profile:${tenantId}`);
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
