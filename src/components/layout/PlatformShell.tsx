import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Building2, CircleDollarSign, LayoutDashboard, LogOut, ShieldCheck, Wallet, type LucideIcon } from 'lucide-react'
import { useSession } from '@/lib/session'
import { cn, formatRWF } from '@/lib/utils'
import { PLATFORM_METRICS } from '@/data/metrics'
import { Badge } from '@/components/ui/Badge'

const NAV: { to: string; label: string; icon: LucideIcon; end?: boolean }[] = [
  { to: '/platform', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/platform/requests', label: 'Business Requests', icon: Building2 },
  { to: '/platform/businesses', label: 'Businesses', icon: Wallet },
  { to: '/platform/plans', label: 'Plans & Pricing', icon: CircleDollarSign },
]

export function PlatformShell() {
  const logout = useSession((s) => s.logout)
  const navigate = useNavigate()

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="flex w-72 shrink-0 flex-col bg-slate-900">
        <div className="flex items-center gap-3 px-5 py-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">
            E
          </div>
          <div>
            <p className="text-sm font-bold text-white">EgukaSystem</p>
            <p className="text-[11px] text-slate-400">Platform Console</p>
          </div>
          <Badge tone="violet" className="ml-auto">Superadmin</Badge>
        </div>

        <nav className="flex-1 space-y-0.5 px-3">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive ? 'bg-emerald-500/10 text-emerald-300' : 'text-slate-300 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <item.icon className="h-[18px] w-[18px]" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-white/10 p-4">
          <div className="rounded-xl bg-white/5 p-3.5 ring-1 ring-white/10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-300" />
              <p className="text-xs font-semibold text-white">Platform status</p>
            </div>
            <div className="mt-2 space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between"><span>MRR</span><span className="font-semibold text-white">{formatRWF(PLATFORM_METRICS.monthlyRecurringRevenue, true)}</span></div>
              <div className="flex justify-between"><span>Businesses</span><span className="font-semibold text-white">{PLATFORM_METRICS.activeBusinesses}</span></div>
              <div className="flex justify-between"><span>Pending</span><span className="font-semibold text-amber-400">{PLATFORM_METRICS.pendingRequests}</span></div>
            </div>
          </div>
          <button
            className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-white/5 hover:text-white"
            onClick={() => {
              logout()
              navigate('/login')
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-6">
          <p className="text-sm font-semibold text-slate-700">EgukaSystem Platform Console</p>
          <span className="ml-auto rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            System Admin
          </span>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}