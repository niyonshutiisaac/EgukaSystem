import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Clock3, FileCheck2, ShieldCheck } from 'lucide-react'
import { useSession } from '@/lib/session'
import { getPlan } from '@/lib/catalog'
import { Button } from '@/components/ui/Button'

export function PendingPage() {
  const session = useSession((s) => s.session)
  const logout = useSession((s) => s.logout)
  const navigate = useNavigate()
  const tenant = session?.tenant
  const plan = tenant ? getPlan(tenant.planId) : null

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100">
          <Clock3 className="h-8 w-8 text-amber-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-slate-900">Application under review</h1>
        <p className="mt-2 text-sm text-slate-500">
          <strong>{tenant?.name}</strong> has been registered on the <strong>{plan?.name}</strong> plan.
          Your business will be activated as soon as the EgukaSystem team approves the subscription payment.
        </p>
        <div className="mt-6 space-y-3 text-left">
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
            <FileCheck2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800">What happens next</p>
              <p className="mt-1 text-xs text-slate-500">
                You will receive a confirmation email. Once approved, you can log in and complete your business setup.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl border border-slate-200 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-emerald-500" />
            <div>
              <p className="text-sm font-semibold text-slate-800">Your data is safe</p>
              <p className="mt-1 text-xs text-slate-500">
                Only your business can access its own data. Tenant isolation is enforced by the platform.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-8 flex justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              logout()
              navigate('/')
            }}
          >
            Back to home
          </Button>
          <Button variant="ghost">
            <Link to="/login" className="flex items-center gap-2">
              Sign in as another role <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}