import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ChevronsUpDown,
  CircleDollarSign,
  CreditCard,
  Factory,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  ScanBarcode,
  Settings,
  ShoppingCart,
  Sparkles,
  Truck,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react'
import { BUSINESS_MODULES, canAccess, getPlan, ROLE_LABELS, type ModuleDef } from '@/lib/catalog'
import { useSession } from '@/lib/session'
import { daysUntil } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { UserAvatar } from '@/components/ui/UserAvatar'

const MODULE_ICONS: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  pos: ScanBarcode,
  inventory: Boxes,
  production: Factory,
  customers: Users,
  suppliers: Truck,
  expenses: CircleDollarSign,
  reports: BarChart3,
  branches: Building2,
  users: ShoppingCart,
  billing: CreditCard,
  settings: Settings,
}

function NavItem({ module, locked, onClick }: { module: ModuleDef; locked: boolean; onClick?: () => void }) {
  const Icon = MODULE_ICONS[module.key] ?? Package
  return (
    <NavLink
      to={module.path}
      end={module.path === '/app'}
      className={({ isActive }) =>
        cn(
          'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-emerald-500/10 text-emerald-300'
            : locked
              ? 'text-slate-500'
              : 'text-slate-300 hover:bg-white/5 hover:text-white',
        )
      }
      onClick={(e) => {
        if (locked) {
          e.preventDefault()
          return
        }
        onClick?.()
      }}
    >
      <Icon className="h-[18px] w-[18px] shrink-0" />
      <span className="flex-1 truncate">{module.label}</span>
      {locked && <span className="text-[10px] font-semibold text-slate-600">PLAN</span>}
    </NavLink>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const session = useSession((s) => s.session)!
  const { role, tenant } = session
  const plan = getPlan(tenant.planId)
  const usedSeats = tenant.users.filter((u) => u.status !== 'inactive').length
  const renewalDays = daysUntil(tenant.subscriptionEndsAt)

  const visibleModules = BUSINESS_MODULES.filter(
    (m) => m.roles.includes(role) && (m.key === 'dashboard' || canAccess(m, role, tenant.planId) || !m.feature),
  )
  const lockedModules = BUSINESS_MODULES.filter(
    (m) => m.roles.includes(role) && m.feature && !canAccess(m, role, tenant.planId),
  )

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500 font-bold text-white">
          E
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">EgukaSystem</p>
          <p className="truncate text-[11px] text-slate-400">Business Operating System</p>
        </div>
      </div>

      <div className="mx-4 mb-4 rounded-xl border border-white/10 bg-white/5 p-3">
        <div className="flex items-center gap-2.5">
          <UserAvatar name={tenant.name} className="h-8 w-8" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{tenant.name}</p>
            <div className="flex items-center gap-1.5">
              <Badge tone="emerald">{plan.name}</Badge>
              {tenant.status === 'trial' && <Badge tone="blue">Trial</Badge>}
            </div>
          </div>
          <ChevronsUpDown className="h-4 w-4 text-slate-500" />
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-widest text-slate-500">Modules</p>
        {visibleModules.map((module) => (
          <NavItem key={module.key} module={module} locked={false} onClick={onNavigate} />
        ))}
        {lockedModules.length > 0 && (
          <>
            <p className="px-3 pb-1.5 pt-4 text-[10px] font-semibold uppercase tracking-widest text-slate-600">
              Locked on {plan.name}
            </p>
            {lockedModules.map((module) => (
              <NavItem key={module.key} module={module} locked onClick={onNavigate} />
            ))}
          </>
        )}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 p-3.5 ring-1 ring-emerald-400/20">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-emerald-300" />
            <p className="text-xs font-semibold text-emerald-200">Seats used</p>
          </div>
          <p className="mt-1 text-lg font-bold text-white">
            {usedSeats}
            <span className="text-sm font-medium text-slate-400"> / {plan.seats === Infinity ? '∞' : plan.seats}</span>
          </p>
          {renewalDays > 0 && (
            <p className="mt-1 text-[11px] text-slate-400">Renews in {renewalDays} days</p>
          )}
        </div>
        {tenant.aiCreditsUsed > 0 && (
          <p className="mt-3 text-center text-[11px] text-slate-500">
            AI credits used: {tenant.aiCreditsUsed.toLocaleString()} / {plan.aiCredits === Infinity ? '∞' : plan.aiCredits.toLocaleString()}
          </p>
        )}
      </div>
    </div>
  )
}

export function BusinessShell() {
  const session = useSession((s) => s.session)!
  const navigate = useNavigate()
  const logout = useSession((s) => s.logout)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { role, tenant } = session
  const plan = getPlan(tenant.planId)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <aside className="hidden w-72 shrink-0 bg-slate-900 lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 bg-slate-900">
            <button
              className="absolute right-3 top-4 rounded-md p-1 text-slate-400 hover:bg-white/10"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-3 border-b border-slate-200 bg-white px-4 sm:px-6">
          <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <div className="hidden items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-500 sm:flex">
            <Building2 className="h-4 w-4 text-slate-400" />
            <span className="font-medium text-slate-700">{tenant.branches[0]?.name ?? tenant.name}</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Button variant="ghost" size="icon" onClick={() => setNotifOpen((v) => !v)}>
                <Bell className="h-[18px] w-[18px]" />
                <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
              </Button>
              {notifOpen && (
                <div className="absolute right-0 top-12 z-30 w-80 rounded-xl border border-slate-200 bg-white p-2 shadow-xl">
                  <p className="px-3 py-2 text-xs font-semibold text-slate-400">Notifications</p>
                  <div className="space-y-1">
                    <div className="rounded-lg bg-red-50 p-3">
                      <p className="text-xs font-semibold text-red-700">ABC Hotel overdue invoice</p>
                      <p className="mt-0.5 text-xs text-red-600">430,000 RWF — 4 days overdue</p>
                    </div>
                    <div className="rounded-lg bg-amber-50 p-3">
                      <p className="text-xs font-semibold text-amber-700">Yeast stock running low</p>
                      <p className="mt-0.5 text-xs text-amber-600">18 kg left, forecast to run out tomorrow</p>
                    </div>
                    <div className="rounded-lg p-3">
                      <p className="text-xs font-semibold text-slate-700">Subscription renewal</p>
                      <p className="mt-0.5 text-xs text-slate-500">{plan.name} renews in {daysUntil(tenant.subscriptionEndsAt)} days</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <button
              className="flex items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-slate-100"
              onClick={() => {
                logout()
                navigate('/login')
              }}
              title={`Signed in as ${session.userName} (${ROLE_LABELS[role]})`}
            >
              <UserAvatar name={session.userName} />
              <div className="hidden text-left md:block">
                <p className="text-sm font-semibold text-slate-900">{session.userName}</p>
                <p className="text-[11px] text-slate-500">{ROLE_LABELS[role]}</p>
              </div>
              <LogOut className="h-4 w-4 text-slate-400" />
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}