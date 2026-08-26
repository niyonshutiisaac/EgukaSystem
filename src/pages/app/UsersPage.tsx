import { useState } from 'react'
import { Lock, Mail, Plus, ShieldCheck, UserMinus, Users2 } from 'lucide-react'
import { getPlan, PLAN_ROLES, ROLE_LABELS } from '@/lib/catalog'
import { useSession } from '@/lib/session'
import type { Role, TenantUser } from '@/lib/types'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { RoleBadge, UserStatusBadge } from '@/components/ui/StatusBadges'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'
import { UserAvatar } from '@/components/ui/UserAvatar'
import { UpgradeModal } from '@/components/UpgradeModal'
import { BUSINESS_MODULES } from '@/lib/catalog'

export function UsersPage() {
  const session = useSession((s) => s.session)!
  const tenant = session.tenant
  const plan = getPlan(tenant.planId)
  const [users, setUsers] = useState<TenantUser[]>(tenant.users)
  const [inviteOpen, setInviteOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')
  const [newPhone, setNewPhone] = useState('')
  const [newRole, setNewRole] = useState<Role>('cashier')
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [removeTarget, setRemoveTarget] = useState<TenantUser | null>(null)

  const activeUsers = users.filter((u) => u.status !== 'inactive').length
  const seatsUsed = activeUsers
  const seatsTotal = plan.seats
  const atCapacity = seatsUsed >= seatsTotal
  const seatPercent = Math.min(100, (seatsUsed / (seatsTotal === Infinity ? 100 : seatsTotal)) * 100)

  const availableRoles = PLAN_ROLES[tenant.planId]

  const addUser = () => {
    if (!newName.trim() || atCapacity) return
    const user: TenantUser = {
      id: `u-new-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim() || `${newName.trim().toLowerCase().replace(/\s+/g, '.')}@business.rw`,
      phone: newPhone.trim() || '+250 7XX XXX XXX',
      role: newRole,
      status: 'invited',
    }
    setUsers((prev) => [...prev, user])
    setInviteOpen(false)
    setNewName('')
    setNewEmail('')
    setNewPhone('')
  }

  const removeUser = (id: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== id))
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users & roles"
        description={`Manage who can access ${tenant.name} and what each person can do.`}
        actions={
          atCapacity ? (
            <Button onClick={() => setUpgradeOpen(true)}>
              <Lock className="h-4 w-4" /> Add user
            </Button>
          ) : (
            <Button onClick={() => setInviteOpen(true)}>
              <Plus className="h-4 w-4" /> Invite user
            </Button>
          )
        }
      />

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <Users2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-900">
                  {seatsUsed} of {seatsTotal === Infinity ? 'unlimited' : seatsTotal} seats used
                </p>
                <p className="text-xs text-slate-500">
                  Your {plan.name} plan includes {seatsTotal === Infinity ? 'unlimited users' : `${seatsTotal} user seats`}.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {atCapacity && <Badge tone="amber">Plan limit reached</Badge>}
              <div className="h-2 w-32 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn('h-full rounded-full', atCapacity ? 'bg-amber-500' : 'bg-emerald-500')}
                  style={{ width: `${seatPercent}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <UserAvatar name={u.name} />
                        <div>
                          <p className="font-semibold text-slate-900">{u.name}</p>
                          {u.id === 'u-1' && (
                            <p className="flex items-center gap-1 text-[11px] text-emerald-600">
                              <ShieldCheck className="h-3 w-3" /> Business owner
                            </p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell><RoleBadge role={u.role} /></TableCell>
                    <TableCell><UserStatusBadge status={u.status} /></TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-600">{u.email}</p>
                      <p className="text-[11px] text-slate-400">{u.phone}</p>
                    </TableCell>
                    <TableCell>
                      {u.role !== 'owner' && (
                        <Button variant="ghost" size="icon" onClick={() => setRemoveTarget(u)} title="Remove user">
                          <UserMinus className="h-4 w-4" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Roles on your plan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(['owner', 'manager', 'cashier', 'production', 'accountant'] as Role[]).map((role) => {
                const allowed = availableRoles.includes(role)
                const requiredPlan = !allowed ? (role === 'owner' || role === 'cashier' ? null : 'growth') : null
                return (
                  <div key={role} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-800">{ROLE_LABELS[role]}</p>
                      <p className="text-[11px] text-slate-400">
                        {role === 'owner' ? 'Full control of the business' :
                          role === 'manager' ? 'Operations, inventory, customers' :
                          role === 'cashier' ? 'Sales, payments, receipts' :
                          role === 'production' ? 'Production plans & batches' : 'Invoices, expenses, finance'}
                      </p>
                    </div>
                    {allowed ? (
                      <Badge tone="emerald">Allowed</Badge>
                    ) : (
                      <Badge tone="amber" className="gap-1">
                        <Lock className="h-3 w-3" /> {requiredPlan === 'growth' ? 'Growth+' : 'Plan'}
                      </Badge>
                    )}
                  </div>
                )
              })}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-slate-500">
              Roles are granted per user. A role can only use modules allowed by both the role and your plan.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-slate-900">Role permissions matrix</h3>
          <p className="mt-0.5 text-xs text-slate-500">
            What each role can access for {tenant.name} on the {plan.name} plan.
          </p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-left text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-2">Module</th>
                  {availableRoles.map((r) => (
                    <th key={r} className="px-3 py-2 text-center">{ROLE_LABELS[r]}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {BUSINESS_MODULES.filter((m) => m.key !== 'dashboard').map((m) => (
                  <tr key={m.key}>
                    <td className="px-3 py-2 font-medium text-slate-700">{m.label}</td>
                    {availableRoles.map((r) => {
                      const allowed = m.roles.includes(r)
                      const planLocked = m.feature && !plan.featureFlags.includes(m.feature)
                      return (
                        <td key={r} className="px-3 py-2 text-center">
                          {allowed ? (
                            <span className={cn('mx-auto inline-block h-2 w-2 rounded-full', planLocked ? 'bg-slate-300' : 'bg-emerald-500')} />
                          ) : (
                            <span className="text-slate-300">—</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a user"
        description={`You have ${seatsTotal === Infinity ? 'unlimited' : seatsTotal - seatsUsed} seat${seatsTotal - seatsUsed === 1 ? '' : 's'} left on ${plan.name}.`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={addUser} disabled={!newName.trim()}><Mail className="h-4 w-4" /> Send invite</Button>
          </>
        }
      >
        <div className="space-y-4">
          <Field label="Full name">
            <Input placeholder="e.g. Jean Paul Nkurunziza" value={newName} onChange={(e) => setNewName(e.target.value)} />
          </Field>
          <Field label="Email" hint="The invite will be sent to this address.">
            <Input type="email" placeholder="name@business.rw" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          </Field>
          <Field label="Phone">
            <Input placeholder="+250 7XX XXX XXX" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} />
          </Field>
          <Field label="Role">
            <Select value={newRole} onChange={(e) => setNewRole(e.target.value as Role)}>
              {availableRoles
                .filter((r) => r !== 'owner')
                .map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
            </Select>
          </Field>
        </div>
      </Modal>

      <UpgradeModal module={BUSINESS_MODULES.find((m) => m.key === 'users')!} open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />

      <ConfirmDialog
        open={!!removeTarget}
        title={`Remove ${removeTarget?.name}?`}
        description="They will immediately lose access to this business and their seat will be freed."
        confirmLabel="Remove user"
        onClose={() => setRemoveTarget(null)}
        onConfirm={() => {
          if (removeTarget) removeUser(removeTarget.id)
        }}
      />
    </div>
  )
}