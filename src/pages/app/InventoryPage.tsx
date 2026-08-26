import { useState } from 'react'
import { ArrowDownRight, ArrowUpRight, PackageSearch, Pencil, Plus, Search, SlidersHorizontal, Trash2 } from 'lucide-react'
import { INGREDIENTS, PRODUCTS } from '@/data/products'
import { INVENTORY_MOVEMENTS } from '@/data/inventory'
import type { InventoryMovement, Product } from '@/lib/types'
import { cn, formatRWF } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

const MOVEMENT_TONES: Record<string, 'emerald' | 'red' | 'amber' | 'blue' | 'violet' | 'slate'> = {
  purchase: 'emerald',
  production: 'violet',
  waste: 'red',
  sale: 'blue',
  transfer: 'amber',
  adjustment: 'slate',
}

interface ProductForm {
  id?: string
  name: string
  category: string
  sku: string
  price: number
  cost: number
  unit: string
  minStock: number
}

const EMPTY_FORM: ProductForm = { name: '', category: 'Bread', sku: '', price: 0, cost: 0, unit: 'piece', minStock: 10 }

export function InventoryPage() {
  const [tab, setTab] = useState('stock')
  const [query, setQuery] = useState('')
  const [onlyLow, setOnlyLow] = useState(false)
  const [items, setItems] = useState<Product[]>([...PRODUCTS, ...INGREDIENTS])

  const [formOpen, setFormOpen] = useState(false)
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM)
  const [formError, setFormError] = useState('')
  const editing = !!form.id

  const [adjustOpen, setAdjustOpen] = useState(false)
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null)
  const [adjustQty, setAdjustQty] = useState(0)
  const [adjustType, setAdjustType] = useState<InventoryMovement['type']>('adjustment')
  const [adjustNote, setAdjustNote] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null)

  const stockValue = items.reduce((s, p) => s + p.stock * p.cost, 0)
  const lowCount = items.filter((p) => p.stock <= p.minStock).length
  const outCount = items.filter((p) => p.stock === 0).length

  const filteredItems = items.filter((p) => {
    const matches = p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase())
    return matches && (!onlyLow || p.stock <= p.minStock)
  })

  const openAdd = () => {
    setForm({ ...EMPTY_FORM, sku: `SKU-${String(items.length + 1).padStart(3, '0')}` })
    setFormError('')
    setFormOpen(true)
  }

  const openEdit = (p: Product) => {
    setForm({ id: p.id, name: p.name, category: p.category, sku: p.sku, price: p.price, cost: p.cost, unit: p.unit, minStock: p.minStock })
    setFormError('')
    setFormOpen(true)
  }

  const saveProduct = () => {
    if (!form.name.trim()) {
      setFormError('Product name is required')
      return
    }
    if (form.price < 0 || form.cost < 0) {
      setFormError('Prices cannot be negative')
      return
    }
    if (editing) {
      setItems((prev) =>
        prev.map((p) =>
          p.id === form.id
            ? { ...p, name: form.name, category: form.category, sku: form.sku, price: form.price, cost: form.cost, unit: form.unit, minStock: form.minStock }
            : p,
        ),
      )
    } else {
      setItems((prev) => [
        { id: `p-new-${prev.length + 1}`, name: form.name, category: form.category, sku: form.sku, price: form.price, cost: form.cost, unit: form.unit, minStock: form.minStock, stock: 0 },
        ...prev,
      ])
    }
    setFormOpen(false)
  }

  const openAdjust = (p: Product) => {
    setAdjustTarget(p)
    setAdjustQty(0)
    setAdjustType('adjustment')
    setAdjustNote('')
    setAdjustOpen(true)
  }

  const applyAdjust = () => {
    if (!adjustTarget || adjustQty === 0) return
    const delta = adjustType === 'sale' || adjustType === 'waste' ? -Math.abs(adjustQty) : Math.abs(adjustQty)
    setItems((prev) =>
      prev.map((p) => (p.id === adjustTarget.id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    )
    setAdjustOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inventory"
        description="An auditable stock ledger — every movement is recorded and attributed to a user."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setAdjustOpen(true)}>
              <SlidersHorizontal className="h-4 w-4" /> Adjust stock
            </Button>
            <Button onClick={openAdd}>
              <Plus className="h-4 w-4" /> Add item
            </Button>
          </div>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Stock value" value={formatRWF(stockValue)} icon={PackageSearch} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Products & ingredients" value={String(items.length)} icon={PackageSearch} />
        <KpiCard label="Low stock" value={String(lowCount)} icon={PackageSearch} iconClassName="bg-amber-50 text-amber-600" />
        <KpiCard label="Out of stock" value={String(outCount)} icon={PackageSearch} iconClassName="bg-red-50 text-red-600" />
      </div>

      <Tabs
        tabs={[
          { key: 'stock', label: 'Stock levels' },
          { key: 'movements', label: 'Stock ledger' },
          { key: 'transfers', label: 'Transfers', badge: <Badge tone="blue">5 branches</Badge> },
        ]}
        active={tab}
        onChange={setTab}
      />

      {tab === 'stock' && (
        <Card>
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center gap-3 border-b border-slate-100 p-4">
              <div className="relative w-full max-w-xs">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input className="pl-9" placeholder="Search stock…" value={query} onChange={(e) => setQuery(e.target.value)} />
              </div>
              <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
                <input type="checkbox" checked={onlyLow} onChange={(e) => setOnlyLow(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                Only low / out of stock
              </label>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Unit cost</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-28" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredItems.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold text-slate-900">{p.name}</TableCell>
                    <TableCell className="text-xs text-slate-500">{p.sku}</TableCell>
                    <TableCell><Badge tone="slate">{p.category}</Badge></TableCell>
                    <TableCell className="text-right font-medium">{p.stock} {p.unit}</TableCell>
                    <TableCell className="text-right text-slate-600">{formatRWF(p.cost)}</TableCell>
                    <TableCell className="text-right font-medium text-slate-800">{formatRWF(p.stock * p.cost)}</TableCell>
                    <TableCell>
                      {p.stock === 0 ? (
                        <Badge tone="red">Out of stock</Badge>
                      ) : p.stock <= p.minStock ? (
                        <Badge tone="amber">Low · min {p.minStock}</Badge>
                      ) : (
                        <Badge tone="emerald">In stock</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" title="Edit item" onClick={() => openEdit(p)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Adjust stock" onClick={() => openAdjust(p)}>
                          <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Delete item" className="hover:text-red-600" onClick={() => setDeleteTarget(p)}>
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
      )}

      {tab === 'movements' && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {INVENTORY_MOVEMENTS.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="font-semibold text-slate-900">{m.productName}</TableCell>
                    <TableCell>
                      <Badge tone={MOVEMENT_TONES[m.type]} className="capitalize">{m.type}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={cn('inline-flex items-center gap-1 font-medium', m.qty > 0 ? 'text-emerald-600' : 'text-red-500')}>
                        {m.qty > 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                        {m.qty > 0 ? '+' : ''}{m.qty}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-slate-600">{m.balanceAfter}</TableCell>
                    <TableCell className="text-xs text-slate-500">{m.note ?? '—'}</TableCell>
                    <TableCell className="text-xs text-slate-600">{m.by}</TableCell>
                    <TableCell className="text-xs text-slate-500">{m.at.slice(0, 10)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {tab === 'transfers' && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-slate-900">Stock transfers</h3>
            <p className="mt-0.5 text-xs text-slate-500">
              Transfer stock between your 5 branches. Transfers are recorded in the ledger for both branches.
            </p>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {[
                { from: 'Kigali Production Facility', to: 'Huye Branch', items: 'White Bread · 200 loaf', status: 'In transit', at: 'Today 08:15' },
                { from: 'Kigali Production Facility', to: 'Musanze Branch', items: 'Buns · 150 pack', status: 'Delivered', at: 'Yesterday 16:40' },
              ].map((t, i) => (
                <div key={i} className="rounded-xl border border-slate-200 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900">{t.from} → {t.to}</p>
                    <Badge tone={t.status === 'Delivered' ? 'emerald' : 'amber'}>{t.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{t.items}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{t.at}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title={editing ? 'Edit item' : 'Add item to inventory'}
        description={editing ? 'Update the product details below.' : 'New items start with zero stock — record an opening balance or purchase afterwards.'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={saveProduct}>{editing ? 'Save changes' : 'Add item'}</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" className="sm:col-span-2">
            <Input placeholder="e.g. Sesame Bread (loaf)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Category">
            <Select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {['Bread', 'Pastry', 'Cakes', 'Ingredient', 'Packaging', 'Beverage', 'Other'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="SKU">
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
          </Field>
          <Field label="Selling price (RWF)">
            <Input type="number" min={0} value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </Field>
          <Field label="Unit cost (RWF)">
            <Input type="number" min={0} value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
          </Field>
          <Field label="Unit">
            <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })}>
              {['piece', 'kg', 'L', 'pack', 'loaf', 'box', 'bag'].map((u) => (
                <option key={u}>{u}</option>
              ))}
            </Select>
          </Field>
          <Field label="Minimum stock (alert level)">
            <Input type="number" min={0} value={form.minStock} onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })} />
          </Field>
          {formError && <p className="sm:col-span-2 text-xs text-red-600">{formError}</p>}
        </div>
      </Modal>

      <Modal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        title="Adjust stock"
        description={adjustTarget ? `Record a movement for ${adjustTarget.name}.` : 'Select an item to adjust.'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setAdjustOpen(false)}>Cancel</Button>
            <Button onClick={applyAdjust} disabled={!adjustTarget || adjustQty === 0}>
              Record movement
            </Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Item" className="sm:col-span-2">
            <Select
              value={adjustTarget?.id ?? ''}
              onChange={(e) => {
                const p = items.find((i) => i.id === e.target.value) ?? null
                setAdjustTarget(p)
              }}
            >
              <option value="" disabled>Select an item…</option>
              {items.map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.stock} {p.unit} in stock)</option>
              ))}
            </Select>
          </Field>
          <Field label="Movement type">
            <Select value={adjustType} onChange={(e) => setAdjustType(e.target.value as InventoryMovement['type'])}>
              <option value="adjustment">Adjustment (correction)</option>
              <option value="purchase">Purchase (stock in)</option>
              <option value="waste">Waste / damage (stock out)</option>
              <option value="sale">Sale (stock out)</option>
            </Select>
          </Field>
          <Field label="Quantity">
            <Input type="number" value={adjustQty} onChange={(e) => setAdjustQty(Number(e.target.value))} />
          </Field>
          <Field label="Note (visible in ledger)" className="sm:col-span-2">
            <Input placeholder="e.g. Count correction after stock count" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)} />
          </Field>
          {adjustTarget && adjustQty !== 0 && (
            <div className="sm:col-span-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Resulting stock: <strong>{Math.max(0, adjustTarget.stock + (adjustType === 'waste' || adjustType === 'sale' ? -Math.abs(adjustQty) : Math.abs(adjustQty)))} {adjustTarget.unit}</strong>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.name}?`}
        description={`This removes the item from inventory. Historical movements remain in the ledger.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setItems((prev) => prev.filter((p) => p.id !== deleteTarget?.id))}
      />
    </div>
  )
}