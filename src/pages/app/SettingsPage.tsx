import { useState } from 'react'
import { Building2, Plus, Save, Store, Trash2 } from 'lucide-react'
import { useSession } from '@/lib/session'
import { BUSINESS_TYPES, getPlan } from '@/lib/catalog'
import type { Branch } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { UpgradeModal } from '@/components/UpgradeModal'
import { BUSINESS_MODULES } from '@/lib/catalog'

export function SettingsPage() {
  const session = useSession((s) => s.session)!
  const tenant = session.tenant
  const plan = getPlan(tenant.planId)
  const [saved, setSaved] = useState(false)
  const [branches, setBranches] = useState<Branch[]>(tenant.branches)

  const [branchOpen, setBranchOpen] = useState(false)
  const [upgradeOpen, setUpgradeOpen] = useState(false)
  const [branchName, setBranchName] = useState('')
  const [branchCity, setBranchCity] = useState('Kigali')
  const [deleteTarget, setDeleteTarget] = useState<Branch | null>(null)

  const multiBranch = plan.featureFlags.includes('multiBranch')

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const openAddBranch = () => {
    if (!multiBranch) {
      setUpgradeOpen(true)
      return
    }
    setBranchName('')
    setBranchCity('Kigali')
    setBranchOpen(true)
  }

  const addBranch = () => {
    if (!branchName.trim()) return
    setBranches((prev) => [...prev, { id: `br-${prev.length + 1}`, name: branchName.trim(), city: branchCity, isHeadOffice: false }])
    setBranchOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business settings"
        description={`Organization configuration for ${tenant.name}. Only the business owner can change these.`}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Organization profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Company name">
                <Input defaultValue={tenant.name} />
              </Field>
              <Field label="Business type">
                <Select defaultValue={tenant.businessType}>
                  {BUSINESS_TYPES.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </Select>
              </Field>
              <Field label="Phone">
                <Input defaultValue={tenant.phone} />
              </Field>
              <Field label="Email">
                <Input defaultValue={tenant.email} />
              </Field>
              <Field label="Address">
                <Input defaultValue={`${tenant.address}, ${tenant.city}`} />
              </Field>
              <Field label="TIN (Tax ID)">
                <Input defaultValue={tenant.tin ?? ''} />
              </Field>
            </div>
            <div className="flex justify-end">
              <Button onClick={save}><Save className="h-4 w-4" /> {saved ? 'Saved' : 'Save changes'}</Button>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Receipt & invoice defaults</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Field label="Receipt footer">
                <Input defaultValue="Murakoze! Thank you for shopping with ABC Bakery." />
              </Field>
              <Field label="Invoice numbering">
                <Input defaultValue="INV-0001" />
              </Field>
              <Field label="Currency">
                <Select defaultValue="rwf">
                  <option value="rwf">RWF — Rwandan Franc</option>
                  <option value="kes">KES — Kenyan Shilling</option>
                  <option value="ugx">UGX — Ugandan Shilling</option>
                </Select>
              </Field>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Branches</CardTitle>
                <Button size="sm" variant="outline" onClick={openAddBranch}>
                  <Plus className="h-3.5 w-3.5" /> Add branch
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {branches.map((b) => (
                <div key={b.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">{b.name}</p>
                    <p className="text-xs text-slate-500">{b.city}</p>
                  </div>
                  {b.isHeadOffice && <span className="text-[10px] font-bold uppercase text-emerald-600">Head office</span>}
                  {!b.isHeadOffice && (
                    <Button variant="ghost" size="icon" className="hover:text-red-600" title="Remove branch" onClick={() => setDeleteTarget(b)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              {!multiBranch && (
                <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
                  Add more branches with the Professional plan.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Data & privacy</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 rounded-xl border border-slate-200 p-4">
            <Store className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-xs leading-relaxed text-slate-600">
              Your data is stored in a dedicated tenant workspace. You can export all business data at any time, and
              request deletion in accordance with Rwanda's data-protection framework. An audit log of user activity is
              available on the Professional plan.
            </p>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={branchOpen}
        onClose={() => setBranchOpen(false)}
        title="Add branch"
        description="Branches share one inventory ledger, with stock transfers between them."
        footer={
          <>
            <Button variant="ghost" onClick={() => setBranchOpen(false)}>Cancel</Button>
            <Button onClick={addBranch} disabled={!branchName.trim()}>Add branch</Button>
          </>
        }
      >
        <div className="grid gap-4">
          <Field label="Branch name">
            <Input placeholder="e.g. Huye Branch" value={branchName} onChange={(e) => setBranchName(e.target.value)} />
          </Field>
          <Field label="City">
            <Select value={branchCity} onChange={(e) => setBranchCity(e.target.value)}>
              {['Kigali', 'Huye', 'Musanze', 'Rubavu', 'Rwamagana', 'Nyagatare', 'Muhanga', 'Karongi'].map((city) => (
                <option key={city}>{city}</option>
              ))}
            </Select>
          </Field>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Remove ${deleteTarget?.name}?`}
        description="The branch will be removed from your organization. Its history stays in the ledger."
        confirmLabel="Remove branch"
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setBranches((prev) => prev.filter((b) => b.id !== deleteTarget?.id))}
      />

      <UpgradeModal module={BUSINESS_MODULES.find((m) => m.key === 'branches')!} open={upgradeOpen} onClose={() => setUpgradeOpen(false)} />
    </div>
  )
}