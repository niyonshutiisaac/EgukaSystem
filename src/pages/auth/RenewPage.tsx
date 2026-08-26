import { useNavigate } from 'react-router-dom'
import { AlertTriangle, ArrowRight, CheckCircle2, CreditCard, RefreshCcw } from 'lucide-react'
import { useSession } from '@/lib/session'
import { getPlan } from '@/lib/catalog'
import { formatRWF } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'

export function RenewPage() {
  const session = useSession((s) => s.session)
  const logout = useSession((s) => s.logout)
  const navigate = useNavigate()
  const tenant = session?.tenant
  const plan = tenant ? getPlan(tenant.planId) : null
  const suspended = tenant?.status === 'suspended'

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">
          {suspended ? 'Subscription suspended' : 'Subscription expired'}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          <strong>{tenant?.name}</strong> no longer has an active subscription. Access to business features is paused —
          your data remains safe and will be restored after renewal.
        </p>
        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-left">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Plan</span>
            <Badge tone="violet">{plan?.name}</Badge>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Monthly fee</span>
            <span className="text-sm font-semibold text-slate-900">
              {plan && plan.priceMonthly > 0 ? formatRWF(plan.priceMonthly) : 'Custom'}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Renewal method</span>
            <span className="flex items-center gap-1.5 text-sm text-slate-700">
              <CreditCard className="h-4 w-4 text-emerald-600" /> MTN MoMo / Airtel Money / Bank
            </span>
          </div>
        </div>
        <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-left">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <p className="text-xs text-emerald-800">
            Your products, customers, inventory history and reports are untouched. As soon as the renewal payment is
            confirmed by EgukaSystem, your business becomes active again.
          </p>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            Back to home
          </Button>
          <Button onClick={() => navigate('/login')}>
            <RefreshCcw className="h-4 w-4" /> Renew now <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}