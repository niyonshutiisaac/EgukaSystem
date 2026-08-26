import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowRight, Building2, CircleDollarSign, Clock3, Cpu, Percent, Ticket, Users2 } from 'lucide-react'
import { PLATFORM_METRICS } from '@/data/metrics'
import { TENANTS } from '@/data/tenants'
import { REGISTRATION_REQUESTS } from '@/data/requests'
import { formatRWF } from '@/lib/utils'
import { chartMoney } from '@/lib/chart'
import { Card, CardContent } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'
import { PageHeader } from '@/components/ui/PageHeader'
import { Badge } from '@/components/ui/Badge'
import { StatusBadge } from '@/components/ui/StatusBadges'

export function PlatformDashboard() {
  const pending = REGISTRATION_REQUESTS.filter((r) => r.status === 'pending')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform overview"
        description="EgukaSystem platform console — manage businesses, subscriptions and revenue."
        actions={
          <Link to="/platform/requests" className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700">
            Review requests ({pending.length}) <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Monthly recurring revenue" value={formatRWF(PLATFORM_METRICS.monthlyRecurringRevenue)} change={21.9} hint="vs last month" icon={CircleDollarSign} />
        <KpiCard label="Active businesses" value={String(PLATFORM_METRICS.activeBusinesses)} change={33.3} icon={Building2} />
        <KpiCard label="Pending requests" value={String(PLATFORM_METRICS.pendingRequests)} icon={Clock3} iconClassName="bg-amber-50 text-amber-600" />
        <KpiCard label="AI queries this month" value={PLATFORM_METRICS.aiQueriesThisMonth.toLocaleString()} change={38.4} icon={Cpu} iconClassName="bg-violet-50 text-violet-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Revenue growth</h3>
                <p className="mt-0.5 text-xs text-slate-500">MRR across all businesses (RWF)</p>
              </div>
              <Badge tone="emerald">+33% QoQ</Badge>
            </div>
            <div className="mt-4 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PLATFORM_METRICS.revenueSeries} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${v / 1000}k`} />
                  <Tooltip formatter={chartMoney} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2.5} fill="url(#rev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-slate-900">Platform health</h3>
            <div className="mt-4 space-y-4">
              {[
                { label: 'Annual recurring revenue', value: formatRWF(PLATFORM_METRICS.annualRecurringRevenue, true), icon: CircleDollarSign },
                { label: 'Avg revenue / business', value: formatRWF(PLATFORM_METRICS.avgRevenuePerBusiness), icon: Percent },
                { label: 'Trial businesses', value: String(PLATFORM_METRICS.trialBusinesses), icon: Clock3 },
                { label: 'Seats sold / used', value: `${PLATFORM_METRICS.seatsSold} / ${PLATFORM_METRICS.seatsUsed}`, icon: Users2 },
                { label: 'Churn rate', value: `${PLATFORM_METRICS.churnRate}%`, icon: Ticket },
              ].map((row) => (
                <div key={row.label} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                    <row.icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500">{row.label}</p>
                    <p className="text-sm font-bold text-slate-900">{row.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900">Recent registration requests</h3>
              <Link to="/platform/requests" className="text-xs font-semibold text-emerald-600 hover:underline">
                View all
              </Link>
            </div>
            <div className="mt-3 divide-y divide-slate-100">
              {REGISTRATION_REQUESTS.slice(0, 4).map((r) => (
                <div key={r.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{r.companyName}</p>
                    <p className="text-xs text-slate-500">{r.contactName} · {r.city}</p>
                  </div>
                  <Badge tone={r.status === 'pending' ? 'amber' : r.status === 'approved' ? 'emerald' : 'slate'}>
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-slate-900">Businesses on the platform</h3>
            <div className="mt-3 divide-y divide-slate-100">
              {TENANTS.map((t) => (
                <div key={t.id} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.branches.length} branch{t.branches.length > 1 ? 'es' : ''} · {t.users.length} users</p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}