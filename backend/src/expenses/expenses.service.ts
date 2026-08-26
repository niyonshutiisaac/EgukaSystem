import { Injectable } from '@nestjs/common';
import { ExpenseCategory, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '../common/exceptions/api.exception';
import { CreateExpenseDto, UpdateExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(
    tenantId: string,
    params: {
      category?: ExpenseCategory;
      from?: string;
      to?: string;
      cursor?: string;
      limit?: number;
    },
  ) {
    const limit = Math.min(Math.max(params.limit ?? 20, 1), 100);
    const where: Prisma.ExpenseWhereInput = { tenantId };
    if (params.category) where.category = params.category;
    if (params.from || params.to) {
      where.incurredAt = {
        ...(params.from ? { gte: new Date(params.from) } : {}),
        ...(params.to ? { lte: new Date(params.to) } : {}),
      };
    }

    const decoded = params.cursor ? this.decodeCursor(params.cursor) : null;
    if (decoded) {
      where.OR = [
        { incurredAt: { lt: decoded.createdAt } },
        { incurredAt: decoded.createdAt, id: { lt: decoded.id } },
      ];
    }

    const rows = await this.prisma.expense.findMany({
      where,
      orderBy: [{ incurredAt: 'desc' }, { id: 'desc' }],
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
        nextCursor: hasMore && last ? this.encodeCursor(last.incurredAt, last.id) : null,
      },
    };
  }

  async create(tenantId: string, actorId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        tenantId,
        branchId: dto.branchId ?? null,
        category: dto.category,
        amount: dto.amount,
        description: dto.description,
        incurredAt: dto.incurredAt ? new Date(dto.incurredAt) : new Date(),
        createdById: actorId,
      },
    });
  }

  async update(tenantId: string, id: string, dto: UpdateExpenseDto) {
    await this.ensure(tenantId, id);
    return this.prisma.expense.update({ where: { id }, data: dto });
  }

  async remove(tenantId: string, id: string) {
    await this.ensure(tenantId, id);
    await this.prisma.expense.delete({ where: { id } });
    return { deleted: true };
  }

  async breakdown(tenantId: string, from?: string, to?: string) {
    const where: Prisma.ExpenseWhereInput = { tenantId };
    if (from || to) {
      where.incurredAt = {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to) } : {}),
      };
    }
    const [grouped, total] = await Promise.all([
      this.prisma.expense.groupBy({
        by: ['category'],
        where,
        _sum: { amount: true },
        _count: { _all: true },
        orderBy: { _sum: { amount: 'desc' } },
      }),
      this.prisma.expense.aggregate({ where, _sum: { amount: true }, _count: { _all: true } }),
    ]);

    return {
      total: total._sum.amount ?? 0,
      count: total._count._all,
      categories: grouped.map((g) => ({
        category: g.category,
        amount: g._sum.amount ?? 0,
        count: g._count._all,
      })),
    };
  }

  private async ensure(tenantId: string, id: string) {
    const expense = await this.prisma.expense.findFirst({ where: { id, tenantId } });
    if (!expense) throw new NotFoundException('Expense not found');
    return expense;
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
