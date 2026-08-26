import { Link } from 'react-router-dom'
import { ArrowUpRight, Banknote, Boxes, PackageSearch, ReceiptText, ShoppingCart, TrendingUp } from 'lucide-react'
import { CUSTOMERS } from '@/data/business'
import { INGREDIENTS, PRODUCTS } from '@/data/products'
import { BRANCH_PERFORMANCE, DAILY_SALES_SERIES } from '@/data/metrics'
import { formatRWF } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'

export function ManagerDashboard() {
  const today = DAILY_SALES_SERIES[DAILY_SALES_SERIES.length - 1]!
  const lowStock = [...PRODUCTS, ...INGREDIENTS].filter((p) => p.stock <= p.minStock)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">OPERATIONS</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Good morning, Alissa. Here's today's operations.</h1>
          <p className="mt-1 text-sm text-slate-500">Sales across all branches, stock levels and open orders.</p>
        </div>
        <Link to="/app/pos">
          <Button><ShoppingCart className="h-4 w-4" /> Open POS</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Sales today" value={formatRWF(today.revenue)} change={4.2} hint="vs yesterday" icon={Banknote} />
        <KpiCard label="Orders today" value={String(today.orders)} change={1.8} icon={ReceiptText} iconClassName="bg-blue-50 text-blue-600" />
        <KpiCard label="Stock value" value={formatRWF(24300000)} icon={Boxes} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Receivables" value={formatRWF(CUSTOMERS.filter((c) => c.balance > 0).reduce((s, c) => s + c.balance, 0))} icon={TrendingUp} iconClassName="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Branch performance — this month</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3">Branch</th>
                    <th className="px-5 py-3">Revenue</th>
                    <th className="px-5 py-3">Orders</th>
                    <th className="px-5 py-3">Waste</th>
                    <th className="px-5 py-3">Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {BRANCH_PERFORMANCE.map((b) => (
                    <tr key={b.branch} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3 font-medium text-slate-800">{b.branch}</td>
                      <td className="px-5 py-3 text-slate-700">{formatRWF(b.revenue)}</td>
                      <td className="px-5 py-3 text-slate-600">{b.orders}</td>
                      <td className="px-5 py-3">
                        <span className={b.waste > 5 ? 'text-red-600' : b.waste > 4 ? 'text-amber-600' : 'text-emerald-600'}>
                          {b.waste}%
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <span className={b.growth >= 0 ? 'inline-flex items-center gap-0.5 text-emerald-600' : 'inline-flex items-center gap-0.5 text-red-600'}>
                          <ArrowUpRight className="h-3.5 w-3.5" /> {b.growth > 0 ? '+' : ''}{b.growth}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Low stock</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {lowStock.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5">
                  <PackageSearch className="h-4 w-4 shrink-0 text-amber-500" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-slate-800">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.stock} / min {p.minStock} {p.unit}</p>
                  </div>
                  {p.stock === 0 && <Badge tone="red">Out</Badge>}
                </div>
              ))}
              <Link to="/app/inventory" className="block text-center text-xs font-semibold text-emerald-600 hover:underline">
                Manage inventory
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credit customers to follow up</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {CUSTOMERS.filter((c) => c.balance > 0).slice(0, 3).map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-2.5">
                  <div>
                    <p className="text-xs font-semibold text-slate-800">{c.name}</p>
                    <p className="text-[11px] text-slate-500">last order {c.lastOrderAt.slice(0, 10)}</p>
                  </div>
                  <Badge tone="red">{formatRWF(c.balance)}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}