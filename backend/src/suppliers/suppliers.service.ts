import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '../common/exceptions/api.exception';
import { CreateSupplierDto, RecordSupplierPaymentDto, UpdateSupplierDto } from './dto/supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, params: { search?: string; cursor?: string; limit?: number }) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const orConditions: Prisma.SupplierWhereInput[] = [];
    if (params.search) {
      orConditions.push(
        { name: { contains: params.search, mode: 'insensitive' } },
        { phone: { contains: params.search, mode: 'insensitive' } },
      );
    }

    const decoded = params.cursor ? this.decodeCursor(params.cursor) : null;
    if (decoded) {
      orConditions.push(
        { createdAt: { lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, id: { lt: decoded.id } },
      );
    }

    const where: Prisma.SupplierWhereInput = {
      tenantId,
      ...(orConditions.length ? { OR: orConditions } : {}),
    };

    const rows = await this.prisma.supplier.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: { _count: { select: { payments: true } } },
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
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, tenantId },
      include: { payments: { orderBy: { createdAt: 'desc' }, take: 20 } },
    });
    if (!supplier) throw new NotFoundException('Supplier not found');
    return supplier;
  }

  async create(tenantId: string, dto: CreateSupplierDto) {
    return this.prisma.supplier.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        phone: dto.phone,
        email: dto.email,
        address: dto.address,
        notes: dto.notes,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateSupplierDto) {
    await this.getById(tenantId, id);
    return this.prisma.supplier.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    await this.prisma.supplier.delete({ where: { id } });
    return { deleted: true };
  }

  async recordPayment(
    tenantId: string,
    supplierId: string,
    actorId: string,
    dto: RecordSupplierPaymentDto,
  ) {
    await this.getById(tenantId, supplierId);
    return this.prisma.supplierPayment.create({
      data: {
        tenantId,
        supplierId,
        amount: dto.amount,
        method: dto.method,
        note: dto.note,
        createdById: actorId,
      },
    });
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
