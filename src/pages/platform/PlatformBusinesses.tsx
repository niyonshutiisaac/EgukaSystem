import { useState } from 'react'
import { MoreVertical, Pause, Play, Search } from 'lucide-react'
import { TENANTS } from '@/data/tenants'
import { BUSINESS_TYPES, getPlan } from '@/lib/catalog'
import type { Tenant, TenantStatus } from '@/lib/types'
import { daysUntil, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { PlanBadge, StatusBadge } from '@/components/ui/StatusBadges'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

export function PlatformBusinesses() {
  const [tenants, setTenants] = useState(TENANTS)
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TenantStatus>('all')
  const [selected, setSelected] = useState<Tenant | null>(null)

  const filtered = tenants.filter((t) => {
    const matchesQuery = t.name.toLowerCase().includes(query.toLowerCase())
    const matchesStatus = statusFilter === 'all' || t.status === statusFilter
    return matchesQuery && matchesStatus
  })

  const toggleSuspend = (id: string) => {
    setTenants((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'suspended' ? 'active' : 'suspended' } : t)),
    )
    setSelected(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Businesses"
        description="All businesses on the platform. Suspend businesses with unpaid subscriptions."
      />

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input className="pl-9" placeholder="Search businesses..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select className="w-44" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'all' | TenantStatus)}>
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="trial">Trial</option>
          <option value="pending">Pending</option>
          <option value="suspended">Suspended</option>
          <option value="expired">Expired</option>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Business</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Renewal</TableHead>
                <TableHead>Users</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((t) => {
                const plan = getPlan(t.planId)
                const activeUsers = t.users.filter((u) => u.status !== 'inactive').length
                const daysLeft = daysUntil(t.subscriptionEndsAt)
                return (
                  <TableRow key={t.id}>
                    <TableCell>
                      <p className="font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.city} · {t.branches.length} branch{t.branches.length > 1 ? 'es' : ''}</p>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-slate-600">{BUSINESS_TYPES.find((b) => b.value === t.businessType)?.label}</span>
                    </TableCell>
                    <TableCell><PlanBadge planId={t.planId} /></TableCell>
                    <TableCell><StatusBadge status={t.status} /></TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-600">{formatDate(t.subscriptionEndsAt)}</p>
                      {daysLeft > 0 ? (
                        <Badge tone="emerald" className="mt-1">{daysLeft} days</Badge>
                      ) : (
                        <Badge tone="red" className="mt-1">Overdue</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-slate-600">
                      {activeUsers} <span className="text-slate-400">/ {plan.seats === Infinity ? '∞' : plan.seats}</span>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="icon" onClick={() => setSelected(t)}>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        description={selected ? `Managed on the ${getPlan(selected.planId).name} plan` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            {selected?.status !== 'suspended' && (
              <Button variant="danger" onClick={() => selected && toggleSuspend(selected.id)}>
                <Pause className="h-4 w-4" /> Suspend subscription
              </Button>
            )}
            {selected?.status === 'suspended' && (
              <Button onClick={() => selected && toggleSuspend(selected.id)}>
                <Play className="h-4 w-4" /> Reactivate
              </Button>
            )}
          </>
        }
      >
        {selected && (
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between"><span className="text-slate-500">Contact</span><span className="font-medium text-slate-900">{selected.email}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">Phone</span><span className="font-medium text-slate-900">{selected.phone}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">Address</span><span className="font-medium text-slate-900">{selected.address}, {selected.city}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">Joined</span><span className="font-medium text-slate-900">{formatDate(selected.joinedAt)}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">TIN</span><span className="font-medium text-slate-900">{selected.tin ?? '—'}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-500">AI credits used</span><span className="font-medium text-slate-900">{selected.aiCreditsUsed.toLocaleString()}</span></div>
          </div>
        )}
      </Modal>
    </div>
  )
}