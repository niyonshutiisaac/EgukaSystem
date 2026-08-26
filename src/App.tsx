import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { useSession } from '@/lib/session'
import { RequireAuth, RequirePlatform, RequireTenantUsable } from '@/components/guards'
import { BusinessShell } from '@/components/layout/BusinessShell'
import { PlatformShell } from '@/components/layout/PlatformShell'
import { Spinner } from '@/components/ui/Spinner'

const LoginPage = lazy(() => import('@/pages/auth/LoginPage').then((m) => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })))
const PendingPage = lazy(() => import('@/pages/auth/PendingPage').then((m) => ({ default: m.PendingPage })))
const RenewPage = lazy(() => import('@/pages/auth/RenewPage').then((m) => ({ default: m.RenewPage })))
const LandingPage = lazy(() => import('@/pages/public/LandingPage').then((m) => ({ default: m.LandingPage })))
const OwnerDashboard = lazy(() => import('@/pages/dashboards/OwnerDashboard').then((m) => ({ default: m.OwnerDashboard })))
const ManagerDashboard = lazy(() => import('@/pages/dashboards/ManagerDashboard').then((m) => ({ default: m.ManagerDashboard })))
const CashierDashboard = lazy(() => import('@/pages/dashboards/CashierDashboard').then((m) => ({ default: m.CashierDashboard })))
const ProductionDashboard = lazy(() => import('@/pages/dashboards/ProductionDashboard').then((m) => ({ default: m.ProductionDashboard })))
const AccountantDashboard = lazy(() => import('@/pages/dashboards/AccountantDashboard').then((m) => ({ default: m.AccountantDashboard })))
const PlatformDashboard = lazy(() => import('@/pages/platform/PlatformDashboard').then((m) => ({ default: m.PlatformDashboard })))
const PlatformRequests = lazy(() => import('@/pages/platform/PlatformRequests').then((m) => ({ default: m.PlatformRequests })))
const PlatformBusinesses = lazy(() => import('@/pages/platform/PlatformBusinesses').then((m) => ({ default: m.PlatformBusinesses })))
const PlatformPlans = lazy(() => import('@/pages/platform/PlatformPlans').then((m) => ({ default: m.PlatformPlans })))
const PosPage = lazy(() => import('@/pages/app/PosPage').then((m) => ({ default: m.PosPage })))
const InventoryPage = lazy(() => import('@/pages/app/InventoryPage').then((m) => ({ default: m.InventoryPage })))
const CustomersPage = lazy(() => import('@/pages/app/CustomersPage').then((m) => ({ default: m.CustomersPage })))
const CustomerDetailPage = lazy(() => import('@/pages/app/CustomerDetailPage').then((m) => ({ default: m.CustomerDetailPage })))
const ProductionPage = lazy(() => import('@/pages/app/ProductionPage').then((m) => ({ default: m.ProductionPage })))
const ReportsPage = lazy(() => import('@/pages/app/ReportsPage').then((m) => ({ default: m.ReportsPage })))
const UsersPage = lazy(() => import('@/pages/app/UsersPage').then((m) => ({ default: m.UsersPage })))
const SuppliersPage = lazy(() => import('@/pages/app/SuppliersPage').then((m) => ({ default: m.SuppliersPage })))
const ExpensesPage = lazy(() => import('@/pages/app/ExpensesPage').then((m) => ({ default: m.ExpensesPage })))
const BillingPage = lazy(() => import('@/pages/app/BillingPage').then((m) => ({ default: m.BillingPage })))
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage').then((m) => ({ default: m.SettingsPage })))

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Spinner />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<RouteFallback />}>
        <AnimatedRoutes />
      </Suspense>
    </BrowserRouter>
  )
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <div key={location.pathname} className="animate-page-in">
      <Routes location={location}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/pending" element={<PendingPage />} />
        <Route path="/renew" element={<RenewPage />} />

        <Route
          path="/platform"
          element={
            <RequirePlatform>
              <PlatformShell />
            </RequirePlatform>
          }
        >
          <Route index element={<PlatformDashboard />} />
          <Route path="requests" element={<PlatformRequests />} />
          <Route path="businesses" element={<PlatformBusinesses />} />
          <Route path="plans" element={<PlatformPlans />} />
        </Route>

        <Route
          path="/app"
          element={
            <RequireAuth>
              <RequireTenantUsable>
                <BusinessShell />
              </RequireTenantUsable>
            </RequireAuth>
          }
        >
          <Route index element={<RoleHome />} />
          <Route path="pos" element={<PosPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="production" element={<ProductionPage />} />
          <Route path="customers" element={<CustomersPage />} />
          <Route path="customers/:id" element={<CustomerDetailPage />} />
          <Route path="suppliers" element={<SuppliersPage />} />
          <Route path="expenses" element={<ExpensesPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="billing" element={<BillingPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

function RoleHome() {
  const role = useSession((s) => s.session?.role)
  switch (role) {
    case 'superadmin':
      return <Navigate to="/platform" replace />
    case 'manager':
      return <ManagerDashboard />
    case 'cashier':
      return <CashierDashboard />
    case 'production':
      return <ProductionDashboard />
    case 'accountant':
      return <AccountantDashboard />
    default:
      return <OwnerDashboard />
  }
}