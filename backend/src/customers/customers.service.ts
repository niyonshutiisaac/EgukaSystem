import { Injectable } from '@nestjs/common';
import { PaymentMethod, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConflictException, NotFoundException } from '../common/exceptions/api.exception';
import { CreateCustomerDto, RecordPaymentDto, UpdateCustomerDto } from './dto/customer.dto';

@Injectable()
export class CustomersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(tenantId: string, params: { search?: string; cursor?: string; limit?: number }) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const orConditions: Prisma.CustomerWhereInput[] = [];
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

    const where: Prisma.CustomerWhereInput = {
      tenantId,
      ...(orConditions.length ? { OR: orConditions } : {}),
    };

    const rows = await this.prisma.customer.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: { _count: { select: { sales: true, payments: true } } },
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
    const customer = await this.prisma.customer.findFirst({
      where: { id, tenantId },
      include: {
        sales: {
          orderBy: { createdAt: 'desc' },
          take: 20,
          select: {
            id: true,
            saleNo: true,
            total: true,
            paid: true,
            status: true,
            createdAt: true,
          },
        },
        payments: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async create(tenantId: string, dto: CreateCustomerDto) {
    const customer = await this.prisma.customer.create({
      data: {
        tenantId,
        name: dto.name.trim(),
        phone: dto.phone,
        email: dto.email,
        location: dto.location,
        balance: dto.balance ?? 0,
        notes: dto.notes,
      },
    });

    if (dto.balance && dto.balance > 0) {
      await this.prisma.customerPayment.create({
        data: {
          tenantId,
          customerId: customer.id,
          amount: 0,
          method: PaymentMethod.cash,
          note: 'Opening balance',
        },
      });
    }
    return customer;
  }

  async update(tenantId: string, id: string, dto: UpdateCustomerDto) {
    await this.getById(tenantId, id);
    return this.prisma.customer.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.getById(tenantId, id);
    const saleCount = await this.prisma.sale.count({ where: { customerId: id } });
    if (saleCount > 0) {
      throw new ConflictException(
        'Customer has sales history — deactivate instead. Deleting would corrupt history.',
      );
    }
    await this.prisma.customer.delete({ where: { id } });
    return { deleted: true };
  }

  async recordPayment(
    tenantId: string,
    customerId: string,
    actorId: string,
    dto: RecordPaymentDto,
  ) {
    const customer = await this.prisma.customer.findFirst({ where: { id: customerId, tenantId } });
    if (!customer) throw new NotFoundException('Customer not found');

    if (dto.amount > customer.balance) {
      throw new ConflictException(
        `Payment (${dto.amount}) exceeds outstanding balance (${customer.balance})`,
        { balance: customer.balance, payment: dto.amount },
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.customer.update({
        where: { id: customerId },
        data: { balance: { decrement: dto.amount } },
      });
      return tx.customerPayment.create({
        data: {
          tenantId,
          customerId,
          amount: dto.amount,
          method: dto.method,
          note: dto.note,
          createdById: actorId,
        },
      });
    });
  }

  async ledger(tenantId: string, customerId: string, cursor?: string, limit = 50) {
    const where: Prisma.CustomerPaymentWhereInput = { tenantId, customerId };
    const decoded = cursor ? this.decodeCursor(cursor) : null;
    if (decoded) {
      where.OR = [
        { createdAt: { lt: decoded.createdAt } },
        { createdAt: decoded.createdAt, id: { lt: decoded.id } },
      ];
    }

    const rows = await this.prisma.customerPayment.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit + 1,
      include: { createdBy: { select: { id: true, name: true } } },
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
