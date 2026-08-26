import { Link } from 'react-router-dom'
import { Banknote, Clock3, ReceiptText, ScanBarcode, ShoppingCart } from 'lucide-react'
import { SALES } from '@/data/business'
import { formatRWF, timeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'

const todayIso = new Date().toISOString().slice(0, 10)

export function CashierDashboard() {
  const todaySales = SALES.filter((s) => s.createdAt.slice(0, 10) === todayIso)
  const todayRevenue = todaySales.reduce((sum, s) => sum + s.total, 0)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">CASHIER</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">Cashier session — Kigali Retail Shop</h1>
          <p className="mt-1 text-sm text-slate-500">Your shift started at 07:00. Today's transactions are recorded under your name.</p>
        </div>
        <Link to="/app/pos">
          <Button size="lg"><ScanBarcode className="h-5 w-5" /> Open POS</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Today's sales" value={formatRWF(todayRevenue)} icon={Banknote} />
        <KpiCard label="Transactions" value={String(todaySales.length)} icon={ReceiptText} iconClassName="bg-blue-50 text-blue-600" />
        <KpiCard label="Average order" value={formatRWF(todaySales.length ? todayRevenue / todaySales.length : 0)} icon={ShoppingCart} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Session time" value="07:00 – now" icon={Clock3} iconClassName="bg-amber-50 text-amber-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-5 py-3">Invoice</th>
                  <th className="px-5 py-3">Customer</th>
                  <th className="px-5 py-3">Items</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Time</th>
                  <th className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {todaySales.slice(0, 8).map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-medium text-slate-800">{s.invoiceNo}</td>
                    <td className="px-5 py-3 text-slate-600">{s.customerName}</td>
                    <td className="px-5 py-3 text-slate-600">{s.items.reduce((n, it) => n + it.qty, 0)}</td>
                    <td className="px-5 py-3">
                      <Badge tone={s.paymentMethod === 'cash' ? 'emerald' : s.paymentMethod === 'momo' ? 'blue' : s.paymentMethod === 'card' ? 'violet' : 'amber'}>
                        {s.paymentMethod}
                      </Badge>
                    </td>
                    <td className="px-5 py-3 text-slate-500">{timeAgo(s.createdAt)}</td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-900">{formatRWF(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}