import { useState } from 'react'
import { Banknote, Pencil, Plus, Search, Star, Trash2, Truck } from 'lucide-react'
import { SUPPLIERS } from '@/data/business'
import type { Supplier } from '@/lib/types'
import { cn, formatRWF } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

interface SupplierForm {
  id?: string
  name: string
  phone: string
  products: string
  rating: number
}

const EMPTY_FORM: SupplierForm = { name: '', phone: '+250 7', products: '', rating: 4 }

export function SuppliersPage() {
  const [query, setQuery] = useState('')
  const [suppliers, setSuppliers] = useState<Supplier[]>(SUPPLIERS)

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<SupplierForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const editing = !!form.id

  const [payTarget, setPayTarget] = useState<Supplier | null>(null)
  const [payAmount, setPayAmount] = useState(0)

  const [deleteTarget, setDeleteTarget] = useState<Supplier | null>(null)

  const filtered = suppliers.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()))
  const totalPayables = suppliers.reduce((sum, s) => sum + s.outstanding, 0)
  const totalPurchases = suppliers.reduce((sum, s) => sum + s.totalPurchases, 0)

  const openAdd = () => {
    setForm(EMPTY_FORM)
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (s: Supplier) => {
    setForm({ id: s.id, name: s.name, phone: s.phone, products: s.products.join(', '), rating: s.rating })
    setFormError('')
    setFormOpen(true)
  }

  const saveSupplier = () => {
    if (!form.name.trim() || !form.phone.trim()) {
      setFormError('Supplier name and phone are required')
      return
    }
    const products = form.products.split(',').map((p) => p.trim()).filter(Boolean)
    if (editing) {
      setSuppliers((prev) =>
        prev.map((s) =>
          s.id === form.id ? { ...s, name: form.name, phone: form.phone, products, rating: form.rating } : s,
        ),
      )
    } else {
      setSuppliers((prev) => [
        { id: `sp-new-${prev.length + 1}`, name: form.name, phone: form.phone, products, totalPurchases: 0, outstanding: 0, rating: form.rating },
        ...prev,
      ])
    }
    setFormOpen(false)
  }

  const openPayment = (s: Supplier) => {
    setPayTarget(s)
    setPayAmount(s.outstanding)
  }

  const recordPayment = () => {
    if (!payTarget || payAmount <= 0) return
    setSuppliers((prev) =>
      prev.map((s) => (s.id === payTarget.id ? { ...s, outstanding: Math.max(0, s.outstanding - payAmount) } : s)),
    )
    setPayTarget(null)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        description="Manage suppliers, purchase history and outstanding payables."
        actions={
          <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add supplier</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Suppliers" value={String(suppliers.length)} icon={Truck} />
        <KpiCard label="Total purchases" value={formatRWF(totalPurchases)} icon={Truck} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Outstanding payables" value={formatRWF(totalPayables)} icon={Banknote} iconClassName="bg-amber-50 text-amber-600" />
        <KpiCard label="Avg. rating" value={`${(suppliers.reduce((s, sp) => s + sp.rating, 0) / Math.max(1, suppliers.length)).toFixed(1)} / 5`} icon={Star} iconClassName="bg-violet-50 text-violet-600" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 p-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="Search suppliers…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead className="text-right">Total purchases</TableHead>
                <TableHead className="text-right">Outstanding</TableHead>
                <TableHead className="w-32" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-slate-600">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.phone}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {s.products.map((p) => (
                        <Badge key={p} tone="slate">{p}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-slate-700">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {s.rating.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatRWF(s.totalPurchases)}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn('font-semibold', s.outstanding > 0 ? 'text-red-600' : 'text-emerald-600')}>
                      {formatRWF(s.outstanding)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" title="Record payment" disabled={s.outstanding === 0} onClick={() => openPayment(s)}>
                        <Banknote className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit supplier" onClick={() => openEdit(s)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete supplier" className="hover:text-red-600" onClick={() => setDeleteTarget(s)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit supplier' : 'Add supplier'}
        description={editing ? 'Update supplier details below.' : 'Suppliers you purchase ingredients and materials from.'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={saveSupplier}>{editing ? 'Save changes' : 'Add supplier'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Supplier name" className="sm:col-span-2">
            <Input placeholder="e.g. Huye Millers" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Phone">
            <Input placeholder="+250 7XX XXX XXX" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="Rating (1–5)">
            <Select value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}>
              {[5, 4.5, 4, 3.5, 3, 2.5, 2].map((r) => (
                <option key={r} value={r}>{r} / 5</option>
              ))}
            </Select>
          </Field>
          <Field label="Products supplied" className="sm:col-span-2" hint="Comma-separated, e.g. Wheat Flour, Yeast">
            <Input placeholder="Wheat Flour, Sugar" value={form.products} onChange={(e) => setForm({ ...form, products: e.target.value })} />
          </Field>
          {formError && <p className="sm:col-span-2 text-xs text-red-600">{formError}</p>}
        </div>
      </Modal>

      <Modal
        open={!!payTarget}
        onClose={() => setPayTarget(null)}
        title={`Record payment — ${payTarget?.name}`}
        description={`Outstanding: ${payTarget ? formatRWF(payTarget.outstanding) : ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setPayTarget(null)}>Cancel</Button>
            <Button onClick={recordPayment} disabled={!payTarget || payAmount <= 0 || payAmount > payTarget.outstanding}>
              <Banknote className="h-4 w-4" /> Record payment
            </Button>
          </>
        }
      >
        <Field label="Amount (RWF)">
          <Input type="number" min={0} value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} />
        </Field>
        <p className="mt-3 text-xs text-slate-500">
          Payment will be attributed to the current accounting period and reflected in the accounts payable report.
        </p>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.name}?`}
        description="The supplier will be removed. Purchase history remains in the audit log."
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setSuppliers((prev) => prev.filter((s) => s.id !== deleteTarget?.id))}
      />
    </div>
  )
}