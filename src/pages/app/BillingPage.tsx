import { useState } from 'react'
import { ArrowRight, Check, CreditCard, History, Landmark, Smartphone, Sparkles } from 'lucide-react'
import { getPlan, PLANS } from '@/lib/catalog'
import { useSession } from '@/lib/session'
import type { PlanId } from '@/lib/types'
import { cn, daysUntil, formatDate, formatRWF } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'

export function BillingPage() {
  const session = useSession((s) => s.session)!
  const tenant = session.tenant
  const currentPlan = getPlan(tenant.planId)
  const [requestOpen, setRequestOpen] = useState(false)
  const [target, setTarget] = useState<PlanId | null>(null)
  const [requested, setRequested] = useState(false)

  const daysLeft = daysUntil(tenant.subscriptionEndsAt)

  const requestUpgrade = () => {
    setRequested(true)
    setTimeout(() => {
      setRequestOpen(false)
      setRequested(false)
      setTarget(null)
    }, 1200)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Subscription & billing"
        description="Manage your plan, seats and payment information. Only the business owner can change subscriptions."
        actions={<Button variant="outline"><History className="h-4 w-4" /> Billing history</Button>}
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">{currentPlan.name} plan</h3>
                {tenant.status === 'trial' && <Badge tone="blue">Trial · ends {formatDate(tenant.trialEndsAt ?? '')}</Badge>}
              </div>
              <p className="mt-1 text-sm text-slate-500">
                {currentPlan.description} Renews automatically on {formatDate(tenant.subscriptionEndsAt)} ({daysLeft} days).
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-extrabold text-slate-900">
                {currentPlan.priceMonthly > 0 ? formatRWF(currentPlan.priceMonthly) : 'Custom'}
                {currentPlan.priceMonthly > 0 && <span className="text-sm font-medium text-slate-400">/month</span>}
              </p>
              <p className="text-xs text-slate-500">Paid via MTN MoMo · +250 788 123 456</p>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Badge tone="emerald">{currentPlan.seats === Infinity ? 'Unlimited' : `${currentPlan.seats} seats`}</Badge>
            <Badge tone="violet"><Sparkles className="h-3 w-3" /> {currentPlan.aiCredits === Infinity ? 'Unlimited AI credits' : `${currentPlan.aiCredits.toLocaleString()} AI credits/mo`}</Badge>
            {currentPlan.featureFlags.map((f) => (
              <Badge key={f} tone="slate" className="capitalize">{f.replace(/([A-Z])/g, ' $1')}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div>
        <h3 className="text-sm font-semibold text-slate-900">Compare plans</h3>
        <p className="mt-0.5 text-xs text-slate-500">Request a plan change and the EgukaSystem team will contact you to arrange payment.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => {
            const isCurrent = p.id === tenant.planId
            const isUpgrade = PLANS.findIndex((x) => x.id === p.id) > PLANS.findIndex((x) => x.id === tenant.planId)
            return (
              <Card key={p.id} className={cn(isCurrent && 'ring-2 ring-emerald-500')}>
                <CardContent className="flex h-full flex-col p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900">{p.name}</p>
                    {isCurrent && <Badge tone="emerald">Current</Badge>}
                  </div>
                  <p className="mt-2 text-xl font-extrabold text-slate-900">
                    {p.priceMonthly > 0 ? formatRWF(p.priceMonthly) : 'Custom'}
                    {p.priceMonthly > 0 && <span className="text-xs font-medium text-slate-400">/mo</span>}
                  </p>
                  <ul className="mt-3 flex-1 space-y-1.5">
                    {p.features.slice(0, 5).map((f) => (
                      <li key={f} className="flex items-start gap-1.5 text-xs text-slate-600">
                        <Check className="mt-0.5 h-3 w-3 shrink-0 text-emerald-500" /> {f}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className="mt-4 w-full"
                    variant={isCurrent ? 'outline' : isUpgrade ? 'primary' : 'secondary'}
                    disabled={isCurrent}
                    onClick={() => {
                      setTarget(p.id)
                      setRequestOpen(true)
                    }}
                  >
                    {isCurrent ? 'Active' : isUpgrade ? 'Upgrade' : 'Downgrade'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      <Modal
        open={requestOpen}
        onClose={() => setRequestOpen(false)}
        title={requested ? 'Request sent' : `Request ${target === tenant.planId ? '' : target ? getPlan(target).name : ''} plan`}
        description={requested ? undefined : 'The EgukaSystem team will contact you to confirm payment and activate the change.'}
        size="sm"
        footer={
          requested ? (
            <Button onClick={() => setRequestOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setRequestOpen(false)}>Cancel</Button>
              <Button onClick={requestUpgrade}><ArrowRight className="h-4 w-4" /> Submit request</Button>
            </>
          )
        }
      >
        {requested ? (
          <div className="flex flex-col items-center py-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
              <Check className="h-7 w-7 text-emerald-600" />
            </div>
            <p className="mt-4 text-sm font-semibold text-slate-900">Plan change requested</p>
            <p className="mt-1 text-xs text-slate-500">
              We'll contact {tenant.phone} within 24 hours. Your current plan stays active until the change is confirmed.
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-4">
              <span className="text-slate-500">Current</span>
              <span className="font-semibold text-slate-900">{currentPlan.name} · {formatRWF(currentPlan.priceMonthly)}/mo</span>
            </div>
            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
              <span className="text-emerald-700">Requested</span>
              <span className="font-semibold text-emerald-800">
                {target ? `${getPlan(target).name} · ${getPlan(target).priceMonthly > 0 ? formatRWF(getPlan(target).priceMonthly) : 'Custom'}/mo` : ''}
              </span>
            </div>
            <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-700">
              {target && getPlan(target).seats < tenant.users.length
                ? `Warning: you currently have ${tenant.users.length} users, but ${getPlan(target).name} allows only ${getPlan(target).seats}. ${tenant.users.length - getPlan(target).seats} user(s) will be deactivated on downgrade.`
                : 'Your seats, AI credits and features update as soon as the change is activated.'}
            </p>
          </div>
        )}
      </Modal>

      <Card>
        <CardHeader>
          <CardTitle>Payment methods</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {[
              { name: 'MTN Mobile Money', detail: '+250 788 123 456', icon: Smartphone, active: true },
              { name: 'Airtel Money', detail: '+250 788 123 456', icon: Smartphone, active: true },
              { name: 'Bank transfer', detail: 'Equity Bank · 1001-2345-6789', icon: Landmark, active: false },
            ].map((m) => (
              <div key={m.name} className={cn('rounded-xl border p-4', m.active ? 'border-slate-200' : 'border-dashed border-slate-200 opacity-60')}>
                <div className="flex items-center justify-between">
                  <m.icon className="h-5 w-5 text-slate-500" />
                  {m.active ? <Badge tone="emerald">Active</Badge> : <Badge tone="slate">Inactive</Badge>}
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">{m.name}</p>
                <p className="text-xs text-slate-500">{m.detail}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-4">
        <CreditCard className="mt-0.5 h-5 w-5 shrink-0 text-blue-600" />
        <p className="text-xs leading-relaxed text-blue-800">
          Payments are arranged through the EgukaSystem team. Your account is activated after payment confirmation and
          deactivated automatically if the subscription lapses — your data is always preserved.
        </p>
      </div>
    </div>
  )
}