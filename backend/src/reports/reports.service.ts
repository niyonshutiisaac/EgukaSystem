import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const CACHE_TTL = 60;

@Injectable()
export class ReportsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  /** The "6AM view" — everything the owner needs on one dashboard screen. */
  async dashboard(tenantId: string, days = 30) {
    const cacheKey = `reports:dashboard:${tenantId}:${days}`;
    const cached = await this.redis.get(cacheKey);
    if (cached) return cached;

    const since = new Date(Date.now() - days * 86400000);
    const today = new Date();
    const todayStart = new Date(today.setHours(0, 0, 0, 0));
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const prevMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);

    const [
      salesPeriod,
      salesToday,
      salesPrevPeriod,
      salesTrend,
      lowStock,
      expensesPeriod,
      expensesPrev,
      customers,
      recentSales,
      topProducts,
    ] = await Promise.all([
      this.prisma.sale.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: since } },
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.sale.aggregate({
        where: { tenantId, status: 'completed', createdAt: { gte: todayStart } },
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.sale.aggregate({
        where: {
          tenantId,
          status: 'completed',
          createdAt: { gte: new Date(since.getTime() - days * 86400000), lt: since },
        },
        _sum: { total: true },
        _count: { _all: true },
      }),
      this.prisma.sale.groupBy({
        by: ['createdAt'],
        where: { tenantId, status: 'completed', createdAt: { gte: since } },
        _sum: { total: true },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.product.findMany({
        where: {
          tenantId,
          isActive: true,
          stock: { lte: this.prisma.product.fields.minStock },
        },
        select: { id: true, name: true, sku: true, stock: true, minStock: true, salePrice: true },
        orderBy: { stock: 'asc' },
        take: 10,
      }),
      this.prisma.expense.aggregate({
        where: { tenantId, incurredAt: { gte: monthStart } },
        _sum: { amount: true },
      }),
      this.prisma.expense.aggregate({
        where: { tenantId, incurredAt: { gte: prevMonthStart, lt: monthStart } },
        _sum: { amount: true },
      }),
      this.prisma.customer.aggregate({
        where: { tenantId, balance: { gt: 0 } },
        _sum: { balance: true },
        _count: { _all: true },
      }),
      this.prisma.sale.findMany({
        where: { tenantId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          items: { include: { product: { select: { id: true, name: true } } } },
          customer: { select: { id: true, name: true } },
        },
      }),
      this.prisma.saleItem.groupBy({
        by: ['productId'],
        where: { sale: { tenantId, status: 'completed', createdAt: { gte: since } } },
        _sum: { qty: true },
        orderBy: { _sum: { qty: 'desc' } },
        take: 5,
      }),
    ]);

    const productIds = topProducts.map((p) => p.productId);
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        })
      : [];
    const names = new Map(products.map((p) => [p.id, p.name]));

    const total = salesPeriod._sum.total ?? 0;
    const prevTotal = salesPrevPeriod._sum.total ?? 0;
    const changePercent = prevTotal > 0 ? Math.round(((total - prevTotal) / prevTotal) * 100) : 0;

    const trendMap = new Map<string, number>();
    for (const row of salesTrend) {
      const day = row.createdAt.toISOString().slice(0, 10);
      trendMap.set(day, (trendMap.get(day) ?? 0) + (row._sum.total ?? 0));
    }
    const trend = Array.from(trendMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, value]) => ({ date, value }));

    const result = {
      kpis: {
        periodSales: total,
        periodSalesCount: salesPeriod._count._all,
        changePercent,
        todaySales: salesToday._sum.total ?? 0,
        todaySalesCount: salesToday._count._all,
        monthExpenses: expensesPeriod._sum.amount ?? 0,
        expenseChangePercent:
          (expensesPrev._sum.amount ?? 0) > 0
            ? Math.round(
                (((expensesPeriod._sum.amount ?? 0) - (expensesPrev._sum.amount ?? 0)) /
                  (expensesPrev._sum.amount ?? 0)) *
                  100,
              )
            : 0,
        customerDebt: customers._sum.balance ?? 0,
        customersOwing: customers._count._all,
        lowStockCount: lowStock.length,
        estProfit: Math.round(total - (expensesPeriod._sum.amount ?? 0) - total * 0.6),
      },
      trend,
      lowStock,
      topProducts: topProducts.map((p) => ({
        name: names.get(p.productId) ?? 'Unknown',
        qty: p._sum.qty ?? 0,
      })),
      recentSales,
    };

    await this.redis.set(cacheKey, result, CACHE_TTL);
    return result;
  }

  async profitLoss(tenantId: string, from: string, to: string) {
    const gte = new Date(from);
    const lte = new Date(to);
    const where: Prisma.SaleWhereInput = { tenantId, status: 'completed', createdAt: { gte, lte } };

    const [revenue, expenses, creditSales, productCost] = await Promise.all([
      this.prisma.sale.aggregate({ where, _sum: { total: true, discount: true, tax: true } }),
      this.prisma.expense.aggregate({
        where: { tenantId, incurredAt: { gte, lte } },
        _sum: { amount: true },
      }),
      this.prisma.sale.aggregate({
        where: { ...where, paymentMethod: 'mobile_money' },
        _sum: { total: true },
      }),
      this.prisma.saleItem.aggregate({
        where: { sale: where },
        _sum: { lineTotal: true },
        _count: { _all: true },
      }),
    ]);

    const revenueTotal = revenue._sum.total ?? 0;
    const expenseTotal = expenses._sum.amount ?? 0;
    const cogsEstimate = Math.round((productCost._count._all > 0 ? revenueTotal : 0) * 0.6);

    return {
      period: { from: gte, to: lte },
      revenue: revenueTotal,
      discounts: revenue._sum.discount ?? 0,
      taxesCollected: revenue._sum.tax ?? 0,
      costOfGoodsEstimate: cogsEstimate,
      expenses: expenseTotal,
      netProfit: revenueTotal - cogsEstimate - expenseTotal,
      creditSales: creditSales._sum.total ?? 0,
    };
  }
}
