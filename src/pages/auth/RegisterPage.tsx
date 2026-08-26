import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronRight, Clock3, Sparkles } from 'lucide-react'
import { BUSINESS_TYPES, getPlan, PLANS } from '@/lib/catalog'
import type { PlanId } from '@/lib/types'
import { cn, formatRWF } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Field, Input, Select, Textarea } from '@/components/ui/Field'

const STEPS = ['Plan', 'Business details', 'Contact & submit']

export function RegisterPage() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [planId, setPlanId] = useState<PlanId>('starter')
  const [companyName, setCompanyName] = useState('')
  const [businessType, setBusinessType] = useState('bakery')
  const [city, setCity] = useState('Kigali')
  const [address, setAddress] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const plan = getPlan(planId)

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="animate-fade-up w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <Check className="h-8 w-8 text-emerald-600" />
          </div>
          <h1 className="mt-6 text-2xl font-bold text-slate-900">Application submitted</h1>
          <p className="mt-2 text-sm text-slate-500">
            Thank you, {contactName}. Your application for <strong>{companyName}</strong> is now being reviewed by our team.
            You will be able to log in and start using {plan.name} as soon as it is approved.
          </p>
          <div className="mt-6 flex items-center justify-center gap-2 rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
            <Clock3 className="h-4 w-4" />
            Typical review time: within 24 hours
          </div>
          <div className="mt-6 flex justify-center gap-3">
            <Button variant="outline" onClick={() => navigate('/')}>Back to home</Button>
            <Button onClick={() => navigate('/login')}>Track status <ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 text-sm font-bold text-white">E</div>
            <span className="font-bold text-slate-900">EgukaSystem</span>
          </Link>
          <p className="text-sm text-slate-500">Register your business</p>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <div key={step} className="animate-page-in">
        <div className="flex items-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <span
                className={cn(
                  'flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold',
                  i <= step ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500',
                )}
              >
                {i + 1}
              </span>
              <span className={cn('text-xs font-medium', i <= step ? 'text-slate-900' : 'text-slate-400')}>{s}</span>
              {i < STEPS.length - 1 && <ChevronRight className="h-3 w-3 text-slate-300" />}
            </div>
          ))}
        </div>

        <div className="mt-8">
          {step === 0 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Choose a plan</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Every plan includes cloud access, data backups and support. You can change plans later.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {PLANS.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => setPlanId(p.id)}
                    className={cn(
                      'rounded-2xl border-2 bg-white p-5 text-left transition-all',
                      planId === p.id ? 'border-emerald-500 shadow-lg shadow-emerald-500/10' : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-slate-900">{p.name}</p>
                      {planId === p.id && <Badge tone="emerald">Selected</Badge>}
                    </div>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      {p.priceMonthly > 0 ? formatRWF(p.priceMonthly) : 'Custom'}
                      {p.priceMonthly > 0 && <span className="text-sm font-medium text-slate-400">/month</span>}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-500">{p.tagline}</p>
                    <ul className="mt-4 space-y-1.5">
                      {p.features.slice(0, 6).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" /> {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 flex items-center gap-1.5">
                      <Badge tone="amber">{p.seats === Infinity ? 'Unlimited' : `${p.seats}`} user seats</Badge>
                      <Badge tone="violet">{p.aiCredits === Infinity ? 'Full AI' : p.aiCredits > 0 ? 'AI included' : 'No AI'}</Badge>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Tell us about your business</h1>
                <p className="mt-1 text-sm text-slate-500">We adapt the system to your business type.</p>
              </div>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {BUSINESS_TYPES.map((bt) => (
                  <button
                    key={bt.value}
                    onClick={() => setBusinessType(bt.value)}
                    className={cn(
                      'rounded-xl border-2 bg-white p-3 text-center transition-all',
                      businessType === bt.value ? 'border-emerald-500 bg-emerald-50/50' : 'border-slate-200 hover:border-slate-300',
                    )}
                  >
                    <bt.icon className="mx-auto h-5 w-5 text-emerald-600" />
                    <p className="mt-1 text-xs font-semibold text-slate-700">{bt.label}</p>
                  </button>
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Company name">
                  <Input placeholder="e.g. ABC Bakery Ltd" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
                </Field>
                <Field label="City">
                  <Select value={city} onChange={(e) => setCity(e.target.value)}>
                    {['Kigali', 'Huye', 'Musanze', 'Rubavu', 'Rwamagana', 'Nyagatare', 'Muhanga', 'Other'].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </Select>
                </Field>
                <Field label="Physical address" className="md:col-span-2">
                  <Input placeholder="Street / district / landmark" value={address} onChange={(e) => setAddress(e.target.value)} />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-xl font-bold text-slate-900">Contact & submit</h1>
                <p className="mt-1 text-sm text-slate-500">Our team will review your application before activating your account.</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Contact name">
                  <Input placeholder="Full name" value={contactName} onChange={(e) => setContactName(e.target.value)} />
                </Field>
                <Field label="Phone (MTN / Airtel)">
                  <Input placeholder="+250 7XX XXX XXX" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
                </Field>
                <Field label="Email" className="md:col-span-2">
                  <Input type="email" placeholder="you@company.rw" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} />
                </Field>
                <Field label="Anything else?" className="md:col-span-2">
                  <Textarea placeholder="Optional message for the review team" value={message} onChange={(e) => setMessage(e.target.value)} />
                </Field>
              </div>
              <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4">
                <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
                <p className="text-xs text-slate-500">
                  By submitting you agree to be contacted about your subscription. Payment is arranged after approval —
                  by mobile money (MTN MoMo / Airtel Money) or bank transfer.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button variant="ghost" onClick={() => (step === 0 ? navigate('/') : setStep(step - 1))}>
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
            {step < 2 ? (
              <Button onClick={() => setStep(step + 1)} disabled={step === 1 && !companyName.trim()}>
                Continue <ArrowRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                disabled={!companyName || !contactName || !contactEmail || !contactPhone}
                onClick={() => setSubmitted(true)}
              >
                Submit application <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
        </div>
      </main>
    </div>
  )
}