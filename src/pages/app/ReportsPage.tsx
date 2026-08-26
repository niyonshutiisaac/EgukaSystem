import { useState } from 'react'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { BRANCH_PERFORMANCE, DAILY_SALES_SERIES, TOP_PRODUCTS } from '@/data/metrics'
import { formatRWF } from '@/lib/utils'
import { chartMoney } from '@/lib/chart'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Field, Select } from '@/components/ui/Field'
import { KpiCard } from '@/components/ui/KpiCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

const RANGES = [
  { key: '30d', label: 'Last 30 days' },
  { key: '90d', label: 'Last 90 days' },
  { key: '12m', label: 'Last 12 months' },
]

export function ReportsPage() {
  const [range, setRange] = useState('30d')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports & analytics"
        description="Understand what happened, why, and what to do next."
        actions={
          <Field className="w-44">
            <Select value={range} onChange={(e) => setRange(e.target.value)}>
              {RANGES.map((r) => (
                <option key={r.key} value={r.key}>{r.label}</option>
              ))}
            </Select>
          </Field>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Revenue" value={formatRWF(22400000)} change={14.2} icon={TrendingUp} />
        <KpiCard label="Gross margin" value="46.8%" change={-4.2} icon={TrendingUp} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Avg order value" value={formatRWF(27300)} change={2.4} icon={TrendingUp} iconClassName="bg-blue-50 text-blue-600" />
        <KpiCard label="Waste value" value={formatRWF(214000)} change={12.0} icon={TrendingUp} iconClassName="bg-red-50 text-red-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Daily revenue & profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_SALES_SERIES} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rep1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={chartMoney} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#rep1)" name="Revenue" />
                  <Area type="monotone" dataKey="profit" stroke="#0d9488" strokeWidth={1.5} fill="transparent" name="Profit" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue by branch</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={BRANCH_PERFORMANCE} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="branch" tick={{ fontSize: 9, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000000).toFixed(1)}M`} />
                  <Tooltip formatter={chartMoney} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top products by margin</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Units sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead className="text-right">Trend</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {TOP_PRODUCTS.map((p) => (
                <TableRow key={p.name}>
                  <TableCell className="font-semibold text-slate-900">{p.name}</TableCell>
                  <TableCell className="text-right text-slate-600">{p.units.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">{formatRWF(p.revenue)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${p.margin}%` }} />
                      </div>
                      <span className="font-medium text-slate-800">{p.margin}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge tone={p.trend >= 0 ? 'emerald' : 'red'}>{p.trend > 0 ? '+' : ''}{p.trend}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branch comparison</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Branch</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead className="text-right">Profit</TableHead>
                <TableHead className="text-right">Waste</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead className="text-right">Growth</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {BRANCH_PERFORMANCE.map((b) => (
                <TableRow key={b.branch}>
                  <TableCell className="font-semibold text-slate-900">{b.branch}</TableCell>
                  <TableCell className="text-right">{formatRWF(b.revenue)}</TableCell>
                  <TableCell className="text-right text-emerald-700">{formatRWF(b.profit)}</TableCell>
                  <TableCell className="text-right">
                    <span className={b.waste > 5 ? 'text-red-600' : b.waste > 4 ? 'text-amber-600' : 'text-emerald-600'}>{b.waste}%</span>
                  </TableCell>
                  <TableCell className="text-right text-slate-600">{b.orders}</TableCell>
                  <TableCell className="text-right">
                    <Badge tone={b.growth >= 0 ? 'emerald' : 'red'}>{b.growth > 0 ? '+' : ''}{b.growth}%</Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
        <p className="text-sm font-semibold text-slate-900">AI interpretation</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-600">
          Sales increased 14% this month, but gross margin declined 4.2 points. The main cause is higher flour and
          packaging costs, plus rising waste in Musanze (7.1%). Recommended actions: renegotiate flour with Huye Millers,
          reduce Musanze's evening production by 6%, and review the bakery category pricing.
        </p>
      </div>
    </div>
  )
}