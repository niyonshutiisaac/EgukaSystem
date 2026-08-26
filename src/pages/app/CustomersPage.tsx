import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Pencil, Search, Sparkles, Trash2, UserPlus } from 'lucide-react'
import { CUSTOMERS } from '@/data/business'
import type { Customer } from '@/lib/types'
import { cn, formatRWF, formatDateShort, initials } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

const TYPE_TONES = { 'walk-in': 'slate', credit: 'amber', wholesale: 'blue' } as const
const NOW = Date.now()

interface CustomerForm {
  id?: string
  name: string
  phone: string
  email: string
  type: Customer['type']
  city: string
  notes: string
}

const EMPTY_FORM: CustomerForm = { name: '', phone: '+250 7', email: '', type: 'walk-in', city: 'Kigali', notes: '' }

export function CustomersPage() {
  const [query, setQuery] = useState('')
  const [customers, setCustomers] = useState<Customer[]>(CUSTOMERS)

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<CustomerForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const editing = !!form.id

  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null)

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.phone.includes(query),
      ),
    [query, customers],
  )

  const totalBalance = customers.filter((c) => c.balance > 0).reduce((s, c) => s + c.balance, 0)
  const inactive = customers.filter((c) => {
    const daysSince = (NOW - new Date(c.lastOrderAt).getTime()) / 86400000
    return c.type !== 'walk-in' && daysSince > c.avgOrderIntervalDays * 1.5
  })

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (c: Customer) => {
    setForm({ id: c.id, name: c.name, phone: c.phone, email: c.email ?? '', type: c.type, city: c.city, notes: c.notes ?? '' })
    setFormError('')
    setFormOpen(true)
  }

  const saveCustomer = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError('Name and phone are required')
      return
    }
    if (editing) {
      setCustomers((prev) =>
        prev.map((c) =>
          c.id === form.id
            ? { ...c, name: form.name, phone: form.phone, email: form.email || undefined, type: form.type, city: form.city, notes: form.notes || undefined }
            : c,
        ),
      )
    } else {
      setCustomers((prev) => [
        { id: `c-new-${prev.length + 1}`, name: form.name, phone: form.phone, email: form.email || undefined, type: form.type, city: form.city, notes: form.notes || undefined, balance: 0, totalPurchases: 0, orderCount: 0, lastOrderAt: new Date().toISOString(), avgOrderIntervalDays: 7 },
        ...prev,
      ])
    }
    setFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Customers"
        description="Customer profiles with purchase history, balances and AI-powered insights."
        actions={
          <Button onClick={openAdd}><UserPlus className="h-4 w-4" /> Add customer</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total customers" value={String(customers.length)} icon={UserPlus} />
        <KpiCard label="Outstanding balance" value={formatRWF(totalBalance)} icon={UserPlus} iconClassName="bg-amber-50 text-amber-600" />
        <KpiCard label="Wholesale accounts" value={String(customers.filter((c) => c.type === 'wholesale').length)} icon={UserPlus} iconClassName="bg-blue-50 text-blue-600" />
        <KpiCard label="Likely inactive" value={String(inactive.length)} icon={Sparkles} iconClassName="bg-violet-50 text-violet-600" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 p-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="Search customers…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Total purchases</TableHead>
                <TableHead className="text-right">Balance</TableHead>
                <TableHead className="text-right">Orders</TableHead>
                <TableHead>Last order</TableHead>
                <TableHead className="w-24" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const daysSince = (NOW - new Date(c.lastOrderAt).getTime()) / 86400000
                const isInactive = c.type !== 'walk-in' && daysSince > c.avgOrderIntervalDays * 1.5
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <Link to={`/app/customers/${c.id}`} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
                          {initials(c.name)}
                        </span>
                        <div>
                          <p className="font-semibold text-slate-900 hover:text-emerald-700">{c.name}</p>
                          <p className="text-xs text-slate-500">{c.phone}</p>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell><Badge tone={TYPE_TONES[c.type]} className="capitalize">{c.type}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{formatRWF(c.totalPurchases)}</TableCell>
                    <TableCell className="text-right">
                      <span className={cn('font-semibold', c.balance > 0 ? 'text-red-600' : 'text-emerald-600')}>
                        {formatRWF(c.balance)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-slate-600">{c.orderCount}</TableCell>
                    <TableCell>
                      <p className="text-xs text-slate-600">{formatDateShort(c.lastOrderAt)}</p>
                      {isInactive && <Badge tone="amber" className="mt-1">Likely inactive</Badge>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" title="Edit customer" onClick={() => openEdit(c)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete customer" className="hover:text-red-600" onClick={() => setDeleteTarget(c)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            <h3 className="text-sm font-semibold text-slate-900">AI customer insights</h3>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
              <p className="text-sm font-semibold text-slate-900">ABC Hotel normally orders every 4 days</p>
              <p className="mt-1 text-xs text-slate-600">
                Its last order was 8 days ago. The hotel's average monthly purchase is 1,100,000 RWF and it has an
                outstanding balance of 430,000 RWF. Consider a follow-up call or WhatsApp reminder.
              </p>
            </div>
            <div className="rounded-xl border border-violet-200 bg-violet-50/50 p-4">
              <p className="text-sm font-semibold text-slate-900">Two wholesale customers are drifting</p>
              <p className="mt-1 text-xs text-slate-600">
                Butare Bakery Supply and Musanze Lodge have not ordered within their normal intervals. Together they
                generate about 530,000 RWF/month. A small discount or call could recover them.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit customer' : 'Add customer'}
        description={editing ? 'Update the customer profile below.' : 'Create a profile to track purchases, balances and insights.'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={saveCustomer}>{editing ? 'Save changes' : 'Add customer'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name" className="sm:col-span-2">
            <Input placeholder="e.g. Alice Mukamana" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input placeholder="+250 7XX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Email">
            <Input type="email" placeholder="name@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Customer type">
            <Select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as Customer['type'] })}>
              <option value="walk-in">Walk-in</option>
              <option value="credit">Credit account</option>
              <option value="wholesale">Wholesale</option>
            </Select>
          </Field>
          <Field label="City">
            <Select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
              {['Kigali', 'Huye', 'Musanze', 'Rubavu', 'Rwamagana', 'Nyagatare', 'Muhanga', 'Karongi', 'Other'].map((city) => (
                <option key={city}>{city}</option>
              ))}
            </Select>
          </Field>
          <Field label="Notes" className="sm:col-span-2">
            <Input placeholder="e.g. Prefers morning deliveries, orders on credit" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
          </Field>
          {formError && <p className="sm:col-span-2 text-xs text-red-600">{formError}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.name}?`}
        description="The customer profile and balances will be removed. Purchase history is preserved in the audit log."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget?.id))}
      />
    </div>
  )
}