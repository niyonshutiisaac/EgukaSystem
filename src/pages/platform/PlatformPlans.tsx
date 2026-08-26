import { Check, Sparkles } from 'lucide-react'
import { PLANS } from '@/lib/catalog'
import { formatRWF } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Card, CardContent } from '@/components/ui/Card'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

export function PlatformPlans() {
  const maxFlags = Math.max(...PLANS.map((p) => p.featureFlags.length))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Plans & pricing"
        description="Subscription plans available for businesses. Each plan defines the features, seats and AI credits a business can use."
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((p) => (
          <Card key={p.id} className={p.id === 'growth' ? 'ring-2 ring-emerald-500' : ''}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-base font-bold text-slate-900">{p.name}</p>
                {p.id === 'growth' && <Badge tone="emerald">Popular</Badge>}
              </div>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {p.priceMonthly > 0 ? formatRWF(p.priceMonthly) : 'Custom'}
                {p.priceMonthly > 0 && <span className="text-sm font-medium text-slate-400">/month</span>}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">{p.tagline}</p>
              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <p><strong>{p.seats === Infinity ? 'Unlimited' : p.seats}</strong> user seats</p>
                <p><strong>{p.aiCredits === Infinity ? 'Unlimited' : `${p.aiCredits.toLocaleString()} AI`}</strong> credits / month</p>
                <p><strong>{p.featureFlags.length}</strong> premium features</p>
              </div>
              <div className="mt-4 flex items-center gap-1.5">
                {p.featureFlags.includes('aiAssistant') && (
                  <Badge tone="violet"><Sparkles className="h-3 w-3" /> AI</Badge>
                )}
                {p.featureFlags.includes('multiBranch') && <Badge tone="blue">Multi-branch</Badge>}
                {p.featureFlags.includes('forecasting') && <Badge tone="amber">Forecasting</Badge>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 px-5 py-4">
            <h3 className="text-sm font-semibold text-slate-900">Feature matrix</h3>
            <p className="mt-0.5 text-xs text-slate-500">Businesses can only use features included in their paid plan.</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Feature</TableHead>
                {PLANS.map((p) => (
                  <TableHead key={p.id} className="text-center">{p.name}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: maxFlags }).map((_, i) => {
                const flag = PLANS[PLANS.length - 1]!.featureFlags[i]
                if (!flag) return null
                const label = PLANS.map((p) => p.featureFlags.includes(flag)).some(Boolean)
                  ? flag.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())
                  : flag
                return (
                  <TableRow key={flag}>
                    <TableCell className="font-medium text-slate-700">{label}</TableCell>
                    {PLANS.map((p) => (
                      <TableCell key={p.id} className="text-center">
                        {p.featureFlags.includes(flag) ? (
                          <Check className="mx-auto h-4 w-4 text-emerald-500" />
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}