import type { PlanId, Role, TenantStatus } from '@/lib/types'
import { ROLE_LABELS } from '@/lib/catalog'
import { Badge } from './Badge'

export function PlanBadge({ planId }: { planId: PlanId }) {
  const tones = { starter: 'slate', growth: 'blue', professional: 'violet', enterprise: 'amber' } as const
  const labels = { starter: 'Starter', growth: 'Growth', professional: 'Professional', enterprise: 'Enterprise' } as const
  return <Badge tone={tones[planId]}>{labels[planId]}</Badge>
}

export function StatusBadge({ status }: { status: TenantStatus }) {
  const tones: Record<TenantStatus, 'emerald' | 'amber' | 'slate' | 'red' | 'blue' | 'outline'> = {
    active: 'emerald',
    trial: 'blue',
    pending: 'amber',
    suspended: 'red',
    expired: 'red',
    rejected: 'outline',
  }
  const labels: Record<TenantStatus, string> = {
    active: 'Active',
    trial: 'Trial',
    pending: 'Pending',
    suspended: 'Suspended',
    expired: 'Expired',
    rejected: 'Rejected',
  }
  return <Badge tone={tones[status]}>{labels[status]}</Badge>
}

export function RoleBadge({ role }: { role: Role }) {
  if (role === 'superadmin') return <Badge tone="violet">{ROLE_LABELS.superadmin}</Badge>
  const tones: Record<string, 'emerald' | 'slate' | 'amber' | 'blue' | 'violet'> = {
    owner: 'emerald',
    manager: 'blue',
    cashier: 'slate',
    production: 'amber',
    accountant: 'violet',
  }
  return <Badge tone={tones[role]}>{ROLE_LABELS[role]}</Badge>
}

export function UserStatusBadge({ status }: { status: 'active' | 'invited' | 'inactive' }) {
  const tones = { active: 'emerald', invited: 'amber', inactive: 'slate' } as const
  const labels = { active: 'Active', invited: 'Invited', inactive: 'Inactive' } as const
  return <Badge tone={tones[status]}>{labels[status]}</Badge>
}