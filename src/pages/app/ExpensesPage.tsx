import { useState } from 'react'
import { Plus, Receipt, Search, Trash2, TrendingDown, Wallet } from 'lucide-react'
import { EXPENSES } from '@/data/business'
import type { Expense } from '@/lib/types'
import { formatRWF } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Field, Input, Select } from '@/components/ui/Field'
import { KpiCard } from '@/components/ui/KpiCard'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table'

const CATEGORY_TONES: Record<string, 'slate' | 'red' | 'amber' | 'blue' | 'violet' | 'emerald'> = {
  Rent: 'violet',
  Utilities: 'blue',
  Transport: 'amber',
  Salaries: 'emerald',
  Marketing: 'red',
  Maintenance: 'slate',
  Packaging: 'slate',
  Supplies: 'amber',
  Other: 'slate',
}

export function ExpensesPage() {
  const [query, setQuery] = useState('')
  const [expenses, setExpenses] = useState<Expense[]>(EXPENSES)

  const [formOpen, setFormOpen] = useState(false)
  const [category, setCategory] = useState('Utilities')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [formError, setFormError] = useState('')

  const [deleteTarget, setDeleteTarget] = useState<Expense | null>(null)

  const filtered = expenses.filter(
    (e) =>
      e.description.toLowerCase().includes(query.toLowerCase()) ||
      e.category.toLowerCase().includes(query.toLowerCase()),
  )

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const monthTotal = expenses.slice(0, 5).reduce((s, e) => s + e.amount, 0)

  const byCategory = [...new Set(expenses.map((e) => e.category))].map((c) => ({
    category: c,
    total: expenses.filter((e) => e.category === c).reduce((s, e) => s + e.amount, 0),
  }))

  const openAdd = () => {
    setCategory('Utilities')
    setDescription('')
    setAmount(0)
    setFormError('')
    setFormOpen(true)
  }

  const addExpense = () => {
    if (!description.trim() || amount <= 0) {
      setFormError('Description and a positive amount are required')
      return
    }
    setExpenses((prev) => [
      { id: `e-new-${prev.length + 1}`, category, description: description.trim(), amount, by: 'Patrick Mugisha', at: new Date().toISOString() },
      ...prev,
    ])
    setFormOpen(false)
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses"
        description="Record and categorize business expenses. Every entry is attributed to a user."
        actions={
          <Button onClick={openAdd}><Plus className="h-4 w-4" /> Add expense</Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="This month" value={formatRWF(monthTotal)} icon={Wallet} />
        <KpiCard label="Total recorded" value={formatRWF(total)} icon={Wallet} iconClassName="bg-teal-50 text-teal-600" />
        <KpiCard label="Entries" value={String(expenses.length)} icon={Receipt} />
        <KpiCard label="Largest category" value={byCategory[0]?.category ?? '—'} icon={TrendingDown} iconClassName="bg-amber-50 text-amber-600" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="border-b border-slate-100 p-4">
            <div className="relative max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input className="pl-9" placeholder="Search expenses…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>By</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((e) => (
                <TableRow key={e.id}>
                  <TableCell className="font-medium text-slate-900">{e.description}</TableCell>
                  <TableCell><Badge tone={CATEGORY_TONES[e.category] ?? 'slate'}>{e.category}</Badge></TableCell>
                  <TableCell className="text-right font-semibold text-slate-900">{formatRWF(e.amount)}</TableCell>
                  <TableCell className="text-xs text-slate-600">{e.by}</TableCell>
                  <TableCell className="text-xs text-slate-500">{e.at.slice(0, 10)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" title="Delete expense" className="hover:text-red-600" onClick={() => setDeleteTarget(e)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-5">
          <h3 className="text-sm font-semibold text-slate-900">Breakdown by category</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {byCategory.map((c) => (
              <div key={c.category} className="rounded-xl border border-slate-200 p-4">
                <p className="text-xs font-medium text-slate-500">{c.category}</p>
                <p className="mt-1 text-lg font-bold text-slate-900">{formatRWF(c.total)}</p>
                <p className="text-[11px] text-slate-400">
                  {Math.round((c.total / (total || 1)) * 100)}% of total
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add expense"
        description="Record a business expense with its category for reporting."
        footer={
          <>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>Cancel</Button>
            <Button onClick={addExpense}><Plus className="h-4 w-4" /> Add expense</Button>
          </>
        }
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {['Rent', 'Utilities', 'Transport', 'Salaries', 'Marketing', 'Maintenance', 'Packaging', 'Supplies', 'Other'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </Select>
          </Field>
          <Field label="Amount (RWF)">
            <Input type="number" min={0} value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </Field>
          <Field label="Description" className="sm:col-span-2">
            <Input placeholder="e.g. Electricity bill (July)" value={description} onChange={(e) => setDescription(e.target.value)} />
          </Field>
          {formError && <p className="sm:col-span-2 text-xs text-red-600">{formError}</p>}
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete this expense?`}
        description={`${deleteTarget?.description} (${deleteTarget ? formatRWF(deleteTarget.amount) : ''}) will be removed. The entry stays in the audit log.`}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => setExpenses((prev) => prev.filter((e) => e.id !== deleteTarget?.id))}
      />
    </div>
  )
}