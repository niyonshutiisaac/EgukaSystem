import { Banknote, ReceiptText, TrendingDown, Wallet } from 'lucide-react'
import { CUSTOMERS, EXPENSES, SUPPLIERS } from '@/data/business'
import { formatRWF, formatDateShort } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'

export function AccountantDashboard() {
  const receivables = CUSTOMERS.filter((c) => c.balance > 0).reduce((s, c) => s + c.balance, 0)
  const payables = SUPPLIERS.reduce((s, sp) => s + sp.outstanding, 0)
  const totalExpenses = EXPENSES.reduce((s, e) => s + e.amount, 0)
  const estimatedProfit = 2100000

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">FINANCE</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Financial overview — this month</h1>
          <p className="mt-1 text-sm text-slate-500">Receivables, payables, expenses and profitability.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue (month)" value={formatRWF(21700000)} change={14.0} icon={Banknote} />
        <KpiCard label="Estimated profit" value={formatRWF(estimatedProfit)} hint="22.1% margin" icon={Wallet} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Receivables" value={formatRWF(receivables)} icon={ReceiptText} iconClassName="bg-amber-50 text-amber-600" />
        <KpiCard label="Supplier payables" value={formatRWF(payables)} change={-4.2} icon={TrendingDown} iconClassName="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer receivables</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">Balance</th>
                    <th className="px-5 py-3">Last order</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {CUSTOMERS.filter((c) => c.balance > 0).map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-medium text-slate-800">{c.name}</td>
                      <td className="px-5 py-3 font-semibold text-red-600">{formatRWF(c.balance)}</td>
                      <td className="px-5 py-3 text-slate-500">{formatDateShort(c.lastOrderAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent expenses</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3">Category</th>
                    <th className="px-5 py-3">Description</th>
                    <th className="px-5 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {EXPENSES.slice(0, 6).map((e) => (
                    <tr key={e.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3"><Badge tone="slate">{e.category}</Badge></td>
                      <td className="px-5 py-3 text-slate-600">{e.description}</td>
                      <td className="px-5 py-3 font-medium text-slate-800">{formatRWF(e.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Revenue</p>
            <p className="mt-1 text-lg font-bold text-slate-900">21,700,000 RWF</p>
            <p className="text-[11px] text-slate-400">+14% vs last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Cost of goods</p>
            <p className="mt-1 text-lg font-bold text-slate-900">11,900,000 RWF</p>
            <p className="text-[11px] text-slate-400">54.8% of revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs font-medium text-slate-500">Operating expenses</p>
            <p className="mt-1 text-lg font-bold text-slate-900">{formatRWF(totalExpenses)}</p>
            <p className="text-[11px] text-slate-400">Including salaries & rent</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}