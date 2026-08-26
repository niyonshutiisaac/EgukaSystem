import { Injectable } from '@nestjs/common';
import { AiProvider, AiProviderResult } from './ai-provider.interface';

export interface InsightContext {
  businessName: string;
  periodLabel: string;
  totalSales: number;
  salesCount: number;
  topProducts: { name: string; qty: number }[];
  lowStock: { name: string; stock: number; minStock: number }[];
  topCustomers: { name: string; balance: number }[];
  monthExpenses: number;
  monthProfitEstimate: number;
  weeklySales: number[];
  weeklyLabels: string[];
}

/**
 * Zero-cost fallback: deterministic insights computed from the tenant's own
 * data. Always available — the AI feature never breaks, even with no API key.
 */
@Injectable()
export class OfflineInsightProvider implements AiProvider {
  readonly name = 'offline';

  isConfigured(): boolean {
    return true;
  }

  generate(_system: string, userPrompt: string, _timeoutMs: number): Promise<AiProviderResult> {
    const context = JSON.parse(userPrompt) as InsightContext;
    const {
      businessName,
      totalSales,
      salesCount,
      topProducts,
      lowStock,
      topCustomers,
      monthExpenses,
      monthProfitEstimate,
    } = context;

    const avgSale = salesCount > 0 ? Math.round(totalSales / salesCount) : 0;
    const trend = context.weeklySales[6] > context.weeklySales[0] ? 'growing' : 'steady';
    const growth =
      context.weeklySales[0] > 0
        ? Math.round(
            ((context.weeklySales[6] - context.weeklySales[0]) / context.weeklySales[0]) * 100,
          )
        : 0;

    const topProductLine =
      topProducts.length > 0
        ? `Top sellers: ${topProducts
            .slice(0, 3)
            .map((p) => `${p.name} (${p.qty} sold)`)
            .join(', ')}.`
        : 'No sales recorded yet this period.';

    const lowStockLine =
      lowStock.length > 0
        ? `WARNING: ${lowStock
            .slice(0, 3)
            .map((p) => `${p.name} is low (${p.stock}, min ${p.minStock})`)
            .join('; ')}. Order these soon.`
        : 'All stock levels are healthy.';

    const creditLine =
      topCustomers.length > 0
        ? `Customers owe a total of ${topCustomers.reduce((s, c) => s + c.balance, 0)} RWF — follow up on collections.`
        : 'No outstanding customer balances.';

    const text = [
      `${businessName} — period performance (${context.periodLabel})`,
      `Revenue: ${totalSales} RWF from ${salesCount} sales (average ${avgSale} RWF/sale). Weekly trend is ${trend} (${growth >= 0 ? '+' : ''}${growth}%).`,
      topProductLine,
      lowStockLine,
      creditLine,
      `Estimated profit for the month: ${monthProfitEstimate} RWF against ${monthExpenses} RWF of expenses.`,
      `Suggested focus: ${lowStock.length > 0 ? 'restock fast-moving items' : 'maintain current pricing and promotions'}.`,
    ].join('\n');

    return Promise.resolve({ text, model: 'offline-deterministic', tokensUsed: 0 });
  }
}
