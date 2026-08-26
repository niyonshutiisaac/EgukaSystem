import { Injectable } from '@nestjs/common';
import { AiInsightType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ApiException } from '../common/exceptions/api.exception';
import { AiGatewayService } from './ai-gateway.service';
import { InsightContext } from './providers/offline.provider';

const CREDIT_COST_PER_INSIGHT = 1;
const ONLINE_MODELS = new Set(['groq', 'openrouter', 'gemini', 'ollama']);

@Injectable()
export class AiService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AiGatewayService,
  ) {}

  async generateInsight(tenantId: string, userId: string, type: AiInsightType) {
    const context = await this.buildContext(tenantId);

    const tenant = await this.prisma.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new ApiException('NOT_FOUND', 'Business not found', 404);

    const systemPrompt = this.systemPromptFor(type);
    const userPrompt = JSON.stringify(context);

    const result = await this.gateway.generate(systemPrompt, userPrompt);

    const usesOnlineModel = ONLINE_MODELS.has(result.model.split(':')[0].split('/')[0]);

    if (usesOnlineModel) {
      if (tenant.aiCredits < CREDIT_COST_PER_INSIGHT) {
        throw new ApiException(
          'AI_CREDITS_EXHAUSTED',
          `No AI credits left (${tenant.aiCredits}/${tenant.aiCreditLimit}). Upgrade your plan or use the offline summary.`,
          402,
        );
      }
      await this.prisma.tenant.update({
        where: { id: tenantId },
        data: { aiCredits: { decrement: CREDIT_COST_PER_INSIGHT } },
      });
    }

    const insight = await this.prisma.aiInsight.create({
      data: {
        tenantId,
        type,
        title: this.titleFor(type, context.periodLabel),
        body: { text: result.text, context } as unknown as Prisma.InputJsonValue,
        model: result.model,
        tokensUsed: result.tokensUsed,
        createdById: userId,
      },
    });

    return { ...insight, creditsUsed: usesOnlineModel ? CREDIT_COST_PER_INSIGHT : 0 };
  }

  async list(tenantId: string, limit = 20) {
    return this.prisma.aiInsight.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { id: true, type: true, title: true, model: true, createdAt: true },
    });
  }

  async creditsOf(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { aiCredits: true, aiCreditLimit: true },
    });
    if (!tenant) throw new ApiException('NOT_FOUND', 'Business not found', 404);
    return { credits: tenant.aiCredits, limit: tenant.aiCreditLimit };
  }

  async getById(tenantId: string, id: string) {
    const insight = await this.prisma.aiInsight.findFirst({ where: { id, tenantId } });
    if (!insight) throw new ApiException('NOT_FOUND', 'Insight not found', 404);
    return insight;
  }

  private async buildContext(tenantId: string): Promise<InsightContext> {
    const today = new Date();
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - 6);
    weekStart.setHours(0, 0, 0, 0);

    const [tenant, salesAgg, weekSales, topProducts, lowStock, customers, expenses, monthSales] =
      await Promise.all([
        this.prisma.tenant.findUnique({
          where: { id: tenantId },
          select: { name: true, businessType: true },
        }),
        this.prisma.sale.aggregate({
          where: { tenantId, status: 'completed', createdAt: { gte: monthStart } },
          _sum: { total: true },
          _count: { _all: true },
        }),
        this.prisma.sale.groupBy({
          by: ['createdAt'],
          where: { tenantId, status: 'completed', createdAt: { gte: weekStart } },
          _sum: { total: true },
        }),
        this.prisma.saleItem.groupBy({
          by: ['productId'],
          where: { sale: { tenantId, status: 'completed', createdAt: { gte: monthStart } } },
          _sum: { qty: true },
          orderBy: { _sum: { qty: 'desc' } },
          take: 5,
        }),
        this.prisma.product.findMany({
          where: { tenantId, isActive: true, stock: { lte: this.prisma.product.fields.minStock } },
          select: { name: true, stock: true, minStock: true },
          take: 5,
        }),
        this.prisma.customer.findMany({
          where: { tenantId, balance: { gt: 0 } },
          select: { name: true, balance: true },
          orderBy: { balance: 'desc' },
          take: 5,
        }),
        this.prisma.expense.aggregate({
          where: { tenantId, incurredAt: { gte: monthStart } },
          _sum: { amount: true },
        }),
        this.prisma.sale.aggregate({
          where: { tenantId, status: 'completed', createdAt: { gte: monthStart } },
          _sum: { total: true },
        }),
      ]);

    const productIds = topProducts.map((p) => p.productId);
    const products = productIds.length
      ? await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true },
        })
      : [];
    const productName = new Map(products.map((p) => [p.id, p.name]));

    const weeklyMap = new Map<number, number>();
    for (const row of weekSales) {
      const day = row.createdAt.getDay();
      weeklyMap.set(day, (weeklyMap.get(day) ?? 0) + (row._sum.total ?? 0));
    }
    const weeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const weeklySales = [1, 2, 3, 4, 5, 6, 0].map((d) => weeklyMap.get(d) ?? 0);

    const revenue = monthSales._sum.total ?? 0;
    const expensesTotal = expenses._sum.amount ?? 0;
    const costRatio = 0.6; // rough COGS estimate; refine when cost tracking lands

    return {
      businessName: tenant?.name ?? 'Your business',
      periodLabel: `${monthStart.toLocaleDateString('en-GB', { month: 'long' })} ${today.getFullYear()}`,
      totalSales: revenue,
      salesCount: salesAgg._count._all,
      topProducts: topProducts.map((p) => ({
        name: productName.get(p.productId) ?? 'Unknown',
        qty: p._sum.qty ?? 0,
      })),
      lowStock: lowStock.map((p) => ({ name: p.name, stock: p.stock, minStock: p.minStock })),
      topCustomers: customers.map((c) => ({ name: c.name, balance: c.balance })),
      monthExpenses: expensesTotal,
      monthProfitEstimate: Math.round(revenue - expensesTotal - revenue * costRatio),
      weeklySales,
      weeklyLabels,
    };
  }

  private systemPromptFor(type: AiInsightType): string {
    switch (type) {
      case 'summary':
        return 'You are EgukaAI, an analyst for a small business in Rwanda. Give a concise, friendly business summary in plain English using the JSON context. Use RWF amounts. 3-5 sentences, no markdown headers, no bullet lists, end with one concrete recommendation.';
      case 'forecast':
        return 'You are EgukaAI, a forecasting analyst for a small business in Rwanda. Using the JSON context (weekly sales, stock, customers), predict next week: expected revenue range in RWF, the 1-2 products to reorder, and one risk. Plain English, 4-6 sentences, no markdown.';
      case 'anomaly':
        return 'You are EgukaAI, a business anomaly detector in Rwanda. From the JSON context, flag unusual patterns: sales dips or spikes, shrinking margins, high customer debt, or stockouts. Be specific with RWF numbers. 3-5 sentences, no markdown.';
      case 'advice':
        return 'You are EgukaAI, a business mentor for a small business in Rwanda. Give practical, low-cost growth advice based on the JSON context (sales, stock, credit, expenses). Two concrete actions this week, one thing to stop doing. Plain English, no markdown.';
    }
  }

  private titleFor(type: AiInsightType, period: string): string {
    switch (type) {
      case 'summary':
        return `${period} performance summary`;
      case 'forecast':
        return 'Next week forecast';
      case 'anomaly':
        return 'Anomaly scan';
      case 'advice':
        return 'Growth advice';
    }
  }
}
