import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import {
  AlertTriangle,
  ArrowUpRight,
  Banknote,
  Boxes,
  ChefHat,
  PackageSearch,
  ReceiptText,
  Send,
  ShoppingCart,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'
import { AI_INSIGHTS, AI_RECOMMENDATIONS, CUSTOMERS, NOTIFICATIONS } from '@/data/business'
import { INGREDIENTS, PRODUCTS } from '@/data/products'
import { DAILY_SALES_SERIES } from '@/data/metrics'
import { getPlan } from '@/lib/catalog'
import { useSession } from '@/lib/session'
import { chartMoney } from '@/lib/chart'
import { cn, formatRWF, timeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { KpiCard } from '@/components/ui/KpiCard'

const SEVERITY_STYLES = {
  danger: 'border-red-200 bg-red-50/60',
  warning: 'border-amber-200 bg-amber-50/60',
  info: 'border-blue-200 bg-blue-50/60',
}

const IMPACT_STYLES = { high: 'bg-red-50 text-red-600', medium: 'bg-amber-50 text-amber-600', low: 'bg-slate-100 text-slate-500' }

const SUGGESTIONS = [
  'How much did we sell this week?',
  'Which products are performing badly?',
  'What ingredients are running low?',
  'Which customers owe us money?',
]

export function OwnerDashboard() {
  const session = useSession((s) => s.session)!
  const tenant = session.tenant
  const plan = getPlan(tenant.planId)
  const [aiQuery, setAiQuery] = useState('')
  const [aiAnswered, setAiAnswered] = useState<string | null>(null)

  const today = DAILY_SALES_SERIES[DAILY_SALES_SERIES.length - 1]!
  const yesterday = DAILY_SALES_SERIES[DAILY_SALES_SERIES.length - 2]!
  const revenueChange = ((today.revenue - yesterday.revenue) / yesterday.revenue) * 100
  const lowStock = [...PRODUCTS, ...INGREDIENTS].filter((p) => p.stock <= p.minStock)
  const overdue = CUSTOMERS.filter((c) => c.balance > 0)

  const ask = (q: string) => {
    const query = q.trim()
    if (!query) return
    setAiQuery('')
    setAiAnswered(query)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-slate-400">GOOD MORNING</p>
          <h1 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
            Here's your business yesterday, {session.userName.split(' ')[0]}.
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {tenant.name} · {plan.name} plan · renewal in 21 days
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/app/pos">
            <Button><ShoppingCart className="h-4 w-4" /> New sale</Button>
          </Link>
          <Link to="/app/production">
            <Button variant="outline"><ChefHat className="h-4 w-4" /> Production plan</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Sales yesterday" value={formatRWF(today.revenue)} change={revenueChange} hint="vs previous day" icon={Banknote} />
        <KpiCard label="Estimated profit" value={formatRWF(today.profit)} hint={`${((today.profit / today.revenue) * 100).toFixed(1)}% margin`} icon={TrendingUp} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Orders yesterday" value={String(today.orders)} change={4.8} icon={ReceiptText} iconClassName="bg-blue-50 text-blue-600" />
        <KpiCard label="Outstanding receivables" value={formatRWF(overdue.reduce((s, c) => s + c.balance, 0))} icon={Users} iconClassName="bg-amber-50 text-amber-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Revenue — last 30 days</CardTitle>
              <p className="mt-0.5 text-xs text-slate-500">Daily sales vs. estimated profit</p>
            </div>
            <Badge tone="emerald"><ArrowUpRight className="h-3 w-3" /> +14% this month</Badge>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DAILY_SALES_SERIES} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rev2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#059669" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} interval={6} />
                  <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={chartMoney} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#059669" strokeWidth={2} fill="url(#rev2)" />
                  <Area type="monotone" dataKey="profit" stroke="#0d9488" strokeWidth={1.5} strokeDasharray="4 4" fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Inventory — attention needed</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {lowStock.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center gap-3">
                  <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-lg', p.stock === 0 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600')}>
                    <PackageSearch className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.stock} {p.unit} left · min {p.minStock}</p>
                  </div>
                  {p.stock === 0 ? <Badge tone="red">Out</Badge> : <Badge tone="amber">Low</Badge>}
                </div>
              ))}
              <Link to="/app/inventory" className="block text-center text-xs font-semibold text-emerald-600 hover:underline">
                View full inventory
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {NOTIFICATIONS.slice(0, 3).map((n) => (
                <div key={n.id} className="flex items-start gap-2.5 rounded-lg border border-slate-100 p-2.5">
                  <AlertTriangle className={cn('mt-0.5 h-4 w-4 shrink-0', n.kind === 'danger' ? 'text-red-500' : n.kind === 'warning' ? 'text-amber-500' : 'text-blue-500')} />
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                    <p className="text-[11px] text-slate-500">{timeAgo(n.at)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <CardTitle>AI recommendations for today</CardTitle>
            </div>
            <Badge tone="violet">{plan.aiCredits === Infinity ? 'Unlimited' : `${plan.aiCredits - tenant.aiCreditsUsed} credits left`}</Badge>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {AI_RECOMMENDATIONS.map((r) => (
              <div key={r.id} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3.5 transition-colors hover:border-emerald-300">
                <div className={cn('mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-bold uppercase', IMPACT_STYLES[r.impact])}>
                  {r.impact}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-900">{r.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{r.detail}</p>
                </div>
                <Button size="xs" variant="outline" className="shrink-0">Apply</Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-emerald-500" />
              <CardTitle>Business alerts</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-2.5">
            {AI_INSIGHTS.slice(0, 5).map((insight) => (
              <div key={insight.id} className={cn('rounded-xl border p-3.5', SEVERITY_STYLES[insight.severity])}>
                <p className="text-sm font-semibold text-slate-900">{insight.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">{insight.body}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-900">Ask the AI assistant</h3>
          </div>
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              ask(aiQuery)
            }}
          >
            <input
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              placeholder="Ask anything about your business… e.g. Why did profit fall this month?"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
            />
            <Button type="submit" disabled={!aiQuery.trim()}>
              <Send className="h-4 w-4" /> Ask
            </Button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => ask(s)}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 transition-colors hover:border-emerald-400 hover:text-emerald-700"
              >
                {s}
              </button>
            ))}
          </div>
          {aiAnswered && (
            <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-500" />
                <p className="text-xs font-semibold text-emerald-800">AI Assistant</p>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-slate-700">
                Here's what I found about "<strong>{aiAnswered}</strong>": this is a demo answer. In production, the AI
                assistant runs authorized tools against your business data and explains the result with sources.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}