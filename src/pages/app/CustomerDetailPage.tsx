import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, CheckCircle2, Phone, Sparkles } from 'lucide-react'
import { CUSTOMERS } from '@/data/business'
import type { Customer } from '@/lib/types'
import { formatRWF, formatDate } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Field, Input, Select } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'

const NOW = Date.now()

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const [customer, setCustomer] = useState<Customer>(CUSTOMERS.find((c) => c.id === id) ?? CUSTOMERS[0]!)

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [payAmount, setPayAmount] = useState(customer.balance)
  const [payMethod, setPayMethod] = useState<'cash' | 'momo' | 'bank'>('momo')
  const [payNote, setPayNote] = useState('')
  const [paid, setPaid] = useState(false)

  const openPayment = () => {
    setPayAmount(customer.balance)
    setPayMethod('momo')
    setPayNote('')
    setPaid(false)
    setPaymentOpen(true)
  }

  const recordPayment = () => {
    if (payAmount <= 0 || payAmount > customer.balance) return
    setCustomer((prev) => ({ ...prev, balance: Math.max(0, prev.balance - payAmount) }))
    setPaid(true)
  }

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/customers" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> All customers
        </Link>
        <PageHeader
          className="mt-3"
          title={customer.name}
          description={`${customer.type === 'walk-in' ? 'Walk-in' : customer.type === 'wholesale' ? 'Wholesale account' : 'Credit account'} · ${customer.city} · customer since ${formatDate('2024-01-15')}`}
          actions={
            <>
              <Button variant="outline"><Phone className="h-4 w-4" /> Call</Button>
              <Button onClick={openPayment} disabled={customer.balance === 0}>
                <CheckCircle2 className="h-4 w-4" /> Record payment
              </Button>
            </>
          }
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Total purchases', value: formatRWF(customer.totalPurchases), tone: 'text-slate-900' },
          { label: 'Orders', value: String(customer.orderCount), tone: 'text-slate-900' },
          { label: 'Outstanding balance', value: formatRWF(customer.balance), tone: customer.balance > 0 ? 'text-red-600' : 'text-emerald-600' },
          { label: 'Last order', value: formatDate(customer.lastOrderAt), tone: 'text-slate-900' },
        ].map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-slate-500">{kpi.label}</p>
              <p className={`mt-1.5 text-xl font-bold ${kpi.tone}`}>{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Purchase history</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-left text-xs font-semibold uppercase tracking-wide text-slate-400">
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Invoice</th>
                      <th className="px-5 py-3">Items</th>
                      <th className="px-5 py-3 text-right">Amount</th>
                      <th className="px-5 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[1, 2, 3, 4, 5].map((n) => {
                      const daysAgo = n * customer.avgOrderIntervalDays + (n === 1 ? 8 : 0)
                      const date = new Date(NOW - daysAgo * 86400000).toISOString()
                      const amount = Math.round(customer.totalPurchases / customer.orderCount) + n * 15000
                      return (
                        <tr key={n} className="hover:bg-slate-50/70">
                          <td className="px-5 py-3 text-slate-600">{formatDate(date)}</td>
                          <td className="px-5 py-3 text-slate-500">INV-{7400 - n * 37}</td>
                          <td className="px-5 py-3 text-slate-600">Bread, buns, croissants</td>
                          <td className="px-5 py-3 text-right font-medium text-slate-900">{formatRWF(amount)}</td>
                          <td className="px-5 py-3 text-right">
                            <Badge tone={n <= 2 && customer.balance > 0 ? 'amber' : 'emerald'}>
                              {n <= 2 && customer.balance > 0 ? 'Partial' : 'Paid'}
                            </Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-slate-500">Phone</span><span className="font-medium text-slate-900">{customer.phone}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Email</span><span className="font-medium text-slate-900">{customer.email ?? '—'}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">City</span><span className="font-medium text-slate-900">{customer.city}</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Order interval</span><span className="font-medium text-slate-900">every {customer.avgOrderIntervalDays} days</span></div>
              {customer.notes && <p className="rounded-lg bg-slate-50 p-3 text-xs text-slate-600">{customer.notes}</p>}
            </CardContent>
          </Card>

          <Card className="border-violet-200">
            <CardContent className="p-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                <h3 className="text-sm font-semibold text-slate-900">AI insight</h3>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-slate-600">
                {customer.name} normally orders every {customer.avgOrderIntervalDays} days but last ordered{' '}
                {formatDate(customer.lastOrderAt)}. {customer.balance > 0
                  ? `There is an outstanding balance of ${formatRWF(customer.balance)}.`
                  : 'The account is fully paid.'}{' '}
                Would you like to send a follow-up message?
              </p>
              <Button size="sm" className="mt-3 w-full">Send WhatsApp follow-up</Button>
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal
        open={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        title={paid ? 'Payment recorded' : `Record payment — ${customer.name}`}
        description={paid ? 'The customer balance has been updated.' : `Outstanding balance: ${formatRWF(customer.balance)}`}
        footer={
          paid ? (
            <Button onClick={() => setPaymentOpen(false)}>Done</Button>
          ) : (
            <>
              <Button variant="ghost" onClick={() => setPaymentOpen(false)}>Cancel</Button>
              <Button onClick={recordPayment} disabled={payAmount <= 0 || payAmount > customer.balance}>
                <CheckCircle2 className="h-4 w-4" /> Record payment
              </Button>
            </>
          )
        }
      >
        {paid ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
            <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
            <p className="text-sm text-emerald-800">
              {formatRWF(payAmount)} received by {payMethod.toUpperCase()}. New balance:{' '}
              <strong>{formatRWF(customer.balance)}</strong>.
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <Field label="Amount (RWF)">
              <Input type="number" min={0} max={customer.balance} value={payAmount} onChange={(e) => setPayAmount(Number(e.target.value))} />
            </Field>
            <Field label="Payment method">
              <Select value={payMethod} onChange={(e) => setPayMethod(e.target.value as 'cash' | 'momo' | 'bank')}>
                <option value="momo">MTN / Airtel Money</option>
                <option value="cash">Cash</option>
                <option value="bank">Bank transfer</option>
              </Select>
            </Field>
            <Field label="Note">
              <Input placeholder="e.g. Partial payment for March order" value={payNote} onChange={(e) => setPayNote(e.target.value)} />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  )
}