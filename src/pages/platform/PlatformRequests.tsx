import { useState } from 'react'
import { Check, Clock3, Mail, MapPin, Phone, X } from 'lucide-react'
import { REGISTRATION_REQUESTS } from '@/data/requests'
import { BUSINESS_TYPES, getPlan } from '@/lib/catalog'
import type { RegistrationRequest } from '@/lib/types'
import { formatDate, timeAgo } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Field, Textarea } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { PlanBadge, StatusBadge } from '@/components/ui/StatusBadges'
import { EmptyState } from '@/components/ui/EmptyState'
import { Inbox } from 'lucide-react'

export function PlatformRequests() {
  const [requests, setRequests] = useState(REGISTRATION_REQUESTS)
  const [selected, setSelected] = useState<RegistrationRequest | null>(null)
  const [note, setNote] = useState('')
  const [withTrial, setWithTrial] = useState(true)
  const pending = requests.filter((r) => r.status === 'pending')

  const decide = (id: string, approve: boolean) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, status: approve ? 'approved' : 'rejected', reviewedAt: new Date().toISOString(), reviewedBy: 'System Admin', reviewNote: note, withTrial: approve ? withTrial : undefined }
          : r,
      ),
    )
    setSelected(null)
    setNote('')
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business registration requests"
        description="Approve businesses after verifying their subscription payment. Approved businesses activate instantly."
      />

      {pending.length === 0 && (
        <Card>
          <EmptyState icon={Inbox} title="No pending requests" description="New business registrations will appear here." />
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {requests
          .filter((r) => r.status === 'pending')
          .map((r) => (
            <Card key={r.id}>
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-bold text-slate-900">{r.companyName}</p>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {BUSINESS_TYPES.find((b) => b.value === r.businessType)?.label} · {r.city}
                    </p>
                  </div>
                  <Badge tone="amber"><Clock3 className="h-3 w-3" /> Pending</Badge>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <PlanBadge planId={r.planId} />
                  <span className="text-xs text-slate-500">{timeAgo(r.submittedAt)}</span>
                </div>
                <div className="mt-4 space-y-1.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-600">
                  <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-slate-400" /> {r.contactPhone}</p>
                  <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-slate-400" /> {r.contactEmail}</p>
                  <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-slate-400" /> {r.address || r.city}</p>
                  {r.message && <p className="pt-1 italic text-slate-500">"{r.message}"</p>}
                </div>
                <div className="mt-4 flex gap-2">
                  <Button className="flex-1" onClick={() => setSelected(r)}>Approve</Button>
                  <Button variant="outline" onClick={() => setSelected(r)}>Reject</Button>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      {requests.some((r) => r.status !== 'pending') && (
        <Card>
          <CardContent className="p-5">
            <h3 className="text-sm font-semibold text-slate-900">Reviewed requests</h3>
            <div className="mt-3 divide-y divide-slate-100">
              {requests
                .filter((r) => r.status !== 'pending')
                .map((r) => (
                  <div key={r.id} className="flex items-center gap-3 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-900">{r.companyName}</p>
                      <p className="truncate text-xs text-slate-500">
                        {r.reviewNote ?? '—'} · reviewed {r.reviewedAt ? formatDate(r.reviewedAt) : '—'}
                      </p>
                    </div>
                    <StatusBadge status={r.status === 'approved' ? 'active' : 'rejected'} />
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected ? `Review ${selected.companyName}` : ''}
        description={selected ? `Plan: ${getPlan(selected.planId).name} (${getPlan(selected.planId).priceMonthly > 0 ? getPlan(selected.planId).priceMonthly.toLocaleString() + ' RWF/mo' : 'Custom'})` : ''}
        footer={
          <>
            <Button variant="ghost" onClick={() => setSelected(null)}>Cancel</Button>
            <Button variant="danger" onClick={() => selected && decide(selected.id, false)}>
              <X className="h-4 w-4" /> Reject
            </Button>
            <Button onClick={() => selected && decide(selected.id, true)}>
              <Check className="h-4 w-4" /> Approve{withTrial ? ' with trial' : ''}
            </Button>
          </>
        }
      >
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                id="trial"
                type="checkbox"
                checked={withTrial}
                onChange={(e) => setWithTrial(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="trial" className="text-sm text-slate-700">Start with a 14-day free trial before the subscription begins</label>
            </div>
            <Field label="Review note (visible to the business)">
              <Textarea placeholder="e.g. Payment confirmed via MTN MoMo, reference 84XY..." value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </div>
        )}
      </Modal>
    </div>
  )
}