import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { ArrowRight, BarChart3, Building2, Check, ShieldCheck, Sparkles, Store, Wallet } from 'lucide-react'
import { DEMO_ACCOUNTS, useSession } from '@/lib/session'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Field, Input } from '@/components/ui/Field'

export function LoginPage() {
  const session = useSession((s) => s.session)
  const login = useSession((s) => s.login)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  if (session) {
    return <Navigate to={session.role === 'superadmin' ? '/platform' : '/app'} replace />
  }

  const quickLogin = (key: string) => {
    const account = DEMO_ACCOUNTS.find((a) => a.role === key) ?? DEMO_ACCOUNTS[1]!
    login(account)
    navigate(account.role === 'superadmin' ? '/platform' : '/app')
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <div className="relative w-[44%] hidden flex-col justify-between overflow-hidden bg-slate-950 p-10 lg:flex">
        <div className="pointer-events-none absolute -top-24 -right-16 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-16 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">E</div>
          <div>
            <p className="font-bold text-white">EgukaSystem</p>
            <p className="text-xs text-slate-400">Business Operating System</p>
          </div>
        </div>
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-300">Understand what is happening, predict what will happen, and know what to do next.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <Store className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-300">Sales, inventory, customers, production, finance and AI — in one place.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-300">Built for Rwanda and East African SMEs.</p>
          </div>
        </div>
        <p className="text-xs text-slate-500">© 2026 EgukaSystem Ltd · Kigali, Rwanda</p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-gradient-to-b from-slate-50 to-white p-6">
        <div className="animate-fade-up w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">E</div>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Welcome back</h1>
          <p className="mt-1 text-sm text-slate-500">Sign in to manage your business or the platform.</p>

          <form
            className="mt-8 space-y-4"
            onSubmit={(e) => {
              e.preventDefault()
              quickLogin('owner')
            }}
          >
            <Field label="Email">
              <Input type="email" placeholder="you@business.rw" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Password">
              <Input type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </Field>
            <Button type="submit" className="w-full">
              Sign in <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-xs font-medium text-slate-400">DEMO MODE — preview any role</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { key: 'superadmin', label: 'Superadmin', desc: 'Platform console', icon: Wallet },
              { key: 'owner', label: 'Business Owner', desc: 'Full control', icon: Building2 },
              { key: 'manager', label: 'Manager', desc: 'Operations', icon: BarChart3 },
              { key: 'cashier', label: 'Cashier', desc: 'POS only', icon: Check },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => quickLogin(item.key)}
                className={cn(
                  'rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:border-emerald-400 hover:shadow',
                )}
              >
                <item.icon className="h-4 w-4 text-emerald-600" />
                <p className="mt-1.5 text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </button>
            ))}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {[
              { key: 'production', label: 'Production Mgr', desc: 'Batches & waste' },
              { key: 'accountant', label: 'Accountant', desc: 'Finance only' },
            ].map((item) => (
              <button
                key={item.key}
                onClick={() => quickLogin(item.key)}
                className="rounded-xl border border-slate-200 bg-white p-3 text-left shadow-sm transition-all hover:border-emerald-400 hover:shadow"
              >
                <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                <p className="text-[11px] text-slate-500">{item.desc}</p>
              </button>
            ))}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            New business?{' '}
            <a href="/register" className="font-semibold text-emerald-600 hover:underline">
              Register your business
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}