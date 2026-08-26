import { ArrowRight, Check, Lock } from 'lucide-react'
import type { ModuleDef } from '@/lib/catalog'
import { FEATURE_LABELS, getPlan, PLAN_ROLES, planRequirementFor } from '@/lib/catalog'
import { formatRWF } from '@/lib/utils'
import { useSession } from '@/lib/session'
import { Badge } from './ui/Badge'
import { Button } from './ui/Button'
import { Modal } from './ui/Modal'

interface UpgradeModalProps {
  module: ModuleDef
  open: boolean
  onClose: () => void
}

export function UpgradeModal({ module, open, onClose }: UpgradeModalProps) {
  const tenant = useSession((s) => s.session?.tenant)
  const currentRole = useSession((s) => s.session?.role)
  if (!tenant) return null
  const requiredPlanId = planRequirementFor(module)
  if (!requiredPlanId) return null
  const required = getPlan(requiredPlanId)
  const current = getPlan(tenant.planId)

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={`Unlock ${module.label}`}
      description="This module is part of your subscription plan."
    >
      <div className="space-y-4">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <div className="flex items-center gap-2 text-amber-800">
            <Lock className="h-4 w-4" />
            <p className="text-sm font-semibold">Feature locked on {current.name}</p>
          </div>
          <p className="mt-1 text-sm text-amber-700">
            {module.feature && FEATURE_LABELS[module.feature]} requires the {required.name} plan.
          </p>
        </div>

        {!module.roles.includes(currentRole ?? 'owner') && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-2 text-red-800">
              <Lock className="h-4 w-4" />
              <p className="text-sm font-semibold">Role restricted</p>
            </div>
            <p className="mt-1 text-sm text-red-700">
              Your role does not include access to {module.label}. Contact your business owner.
            </p>
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Upgrade to {required.name}
          </p>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-slate-900">
              {required.priceMonthly > 0 ? formatRWF(required.priceMonthly) : 'Custom'}
            </span>
            {required.priceMonthly > 0 && <span className="text-sm text-slate-500">/month</span>}
          </div>
          <ul className="space-y-1.5">
            {required.features.slice(0, 5).map((feature) => (
              <li key={feature} className="flex items-start gap-2 text-sm text-slate-600">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {feature}
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-2 pt-1">
            <Badge tone="amber">
              {required.seats === Infinity ? 'Unlimited seats' : `${required.seats} user seats`}
            </Badge>
            <Badge tone="violet">More AI credits</Badge>
          </div>
        </div>

        <Button className="w-full" onClick={onClose}>
          Request upgrade <ArrowRight className="h-4 w-4" />
        </Button>
        <p className="text-center text-[11px] text-slate-400">
          Your owner can request a plan change from the Subscription page. Roles available: {PLAN_ROLES[requiredPlanId].join(', ')}
        </p>
      </div>
    </Modal>
  )
}