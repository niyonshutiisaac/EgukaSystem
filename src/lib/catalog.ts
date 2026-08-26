import type { LucideIcon } from 'lucide-react'
import {
  Building2,
  Croissant,
  Dumbbell,
  Factory,
  Package,
  Pill,
  Scissors,
  Shirt,
  ShoppingBag,
  ShoppingCart,
  Stethoscope,
  UtensilsCrossed,
} from 'lucide-react'
import type { FeatureFlag, Plan, PlanId, Role } from './types'

export const PLANS: Plan[] = [
  {
    id: 'starter',
    name: 'Starter',
    priceMonthly: 15000,
    priceAnnual: 150000,
    seats: 2,
    description: 'For very small businesses getting started with digital operations.',
    tagline: 'POS, inventory and basic reports',
    features: [
      'Basic POS & sales',
      'Products & inventory',
      'Customers',
      'Basic reports',
      '2 user seats',
      'Cloud access',
      'WhatsApp support',
    ],
    featureFlags: ['bulkImport'],
    aiCredits: 0,
  },
  {
    id: 'growth',
    name: 'Growth',
    priceMonthly: 35000,
    priceAnnual: 350000,
    seats: 5,
    description: 'For growing businesses that need employees, expenses and smarter reports.',
    tagline: 'The full operational toolkit',
    features: [
      'Everything in Starter',
      'Suppliers & expenses',
      'Production & recipes',
      'Advanced reports',
      'Employee roles & permissions',
      'AI assistant (limited)',
      'Business insights',
      '5 user seats',
    ],
    featureFlags: ['production', 'expenses', 'procurement', 'advancedReports', 'aiAssistant'],
    aiCredits: 200,
  },
  {
    id: 'professional',
    name: 'Professional',
    priceMonthly: 75000,
    priceAnnual: 750000,
    seats: 15,
    description: 'For larger businesses with multiple branches, warehouses and forecasting.',
    tagline: 'Multi-branch operations & predictive AI',
    features: [
      'Everything in Growth',
      'Multiple branches',
      'Warehouses & transfers',
      'Advanced production',
      'Demand forecasting',
      'AI business intelligence',
      'Audit logs',
      'API access',
      '15 user seats',
      'Priority support',
    ],
    featureFlags: [
      'production',
      'expenses',
      'procurement',
      'advancedReports',
      'aiAssistant',
      'forecasting',
      'multiBranch',
      'warehouses',
      'auditLogs',
      'apiAccess',
      'bulkImport',
    ],
    aiCredits: 2000,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    priceMonthly: 0,
    priceAnnual: 0,
    seats: Infinity,
    description: 'Custom solutions for chains, manufacturers and distributors.',
    tagline: 'Custom everything',
    features: [
      'Everything in Professional',
      'Unlimited user seats',
      'Custom modules & workflows',
      'Advanced integrations',
      'Dedicated infrastructure',
      'Data migration',
      'Enterprise support & SLA',
      'Custom AI workflows',
    ],
    featureFlags: [
      'production',
      'expenses',
      'procurement',
      'advancedReports',
      'aiAssistant',
      'forecasting',
      'multiBranch',
      'warehouses',
      'auditLogs',
      'apiAccess',
      'bulkImport',
    ],
    aiCredits: Infinity,
  },
]

export function getPlan(id: PlanId): Plan {
  const plan = PLANS.find((p) => p.id === id)
  if (!plan) throw new Error(`Unknown plan: ${id}`)
  return plan
}

export const FEATURE_LABELS: Record<FeatureFlag, string> = {
  multiBranch: 'Multiple branches',
  warehouses: 'Warehouses & transfers',
  production: 'Production & recipes',
  forecasting: 'Demand forecasting',
  aiAssistant: 'AI assistant',
  advancedReports: 'Advanced reports',
  expenses: 'Expense management',
  procurement: 'Procurement',
  auditLogs: 'Audit logs',
  apiAccess: 'API access',
  bulkImport: 'Bulk CSV import',
}

export function planHasFeature(planId: PlanId, feature: FeatureFlag): boolean {
  const plan = getPlan(planId)
  return plan.featureFlags.includes(feature)
}

export const ROLE_LABELS: Record<Role, string> = {
  superadmin: 'Superadmin',
  owner: 'Owner',
  manager: 'Manager',
  cashier: 'Cashier',
  production: 'Production Manager',
  accountant: 'Accountant',
}

/** Which roles a plan is allowed to create (seat-based role gating). */
export const PLAN_ROLES: Record<PlanId, Role[]> = {
  starter: ['owner', 'cashier'],
  growth: ['owner', 'manager', 'cashier', 'production', 'accountant'],
  professional: ['owner', 'manager', 'cashier', 'production', 'accountant'],
  enterprise: ['owner', 'manager', 'cashier', 'production', 'accountant'],
}

export interface ModuleDef {
  key: string
  label: string
  path: string
  feature?: FeatureFlag
  roles: Role[]
  planFrom?: PlanId
}

const ALL_BUSINESS_ROLES: Role[] = ['owner', 'manager', 'cashier', 'production', 'accountant']

export const BUSINESS_MODULES: ModuleDef[] = [
  { key: 'dashboard', label: 'Dashboard', path: '/app', roles: ALL_BUSINESS_ROLES },
  { key: 'pos', label: 'POS / Sales', path: '/app/pos', roles: ['owner', 'manager', 'cashier'] },
  { key: 'inventory', label: 'Inventory', path: '/app/inventory', roles: ['owner', 'manager', 'production'] },
  { key: 'production', label: 'Production', path: '/app/production', roles: ['owner', 'production'], feature: 'production' },
  { key: 'customers', label: 'Customers', path: '/app/customers', roles: ['owner', 'manager', 'cashier'] },
  { key: 'suppliers', label: 'Suppliers', path: '/app/suppliers', roles: ['owner', 'manager'], feature: 'procurement' },
  { key: 'expenses', label: 'Expenses', path: '/app/expenses', roles: ['owner', 'accountant'], feature: 'expenses' },
  { key: 'reports', label: 'Reports', path: '/app/reports', roles: ['owner', 'manager', 'accountant'], feature: 'advancedReports' },
  { key: 'branches', label: 'Branches', path: '/app/branches', roles: ['owner'], feature: 'multiBranch' },
  { key: 'users', label: 'Users & Roles', path: '/app/users', roles: ['owner'] },
  { key: 'billing', label: 'Subscription', path: '/app/billing', roles: ['owner'] },
  { key: 'settings', label: 'Settings', path: '/app/settings', roles: ['owner'] },
]

/** True when the role may open the module. */
export function roleCanAccess(module: ModuleDef, role: Role): boolean {
  return module.roles.includes(role)
}

/** True when the module's plan feature is unlocked. */
export function planCanAccess(module: ModuleDef, planId: PlanId): boolean {
  if (!module.feature) return true
  return planHasFeature(planId, module.feature)
}

/** Combined gate: role permission AND plan entitlement. */
export function canAccess(module: ModuleDef, role: Role, planId: PlanId): boolean {
  return roleCanAccess(module, role) && planCanAccess(module, planId)
}

/** Human explanation for the upgrade paywall. */
export function planRequirementFor(module: ModuleDef): PlanId | null {
  if (!module.feature) return null
  for (const plan of PLANS) {
    if (plan.featureFlags.includes(module.feature)) return plan.id
  }
  return null
}

export const BUSINESS_TYPES: { value: string; label: string; icon: LucideIcon }[] = [
  { value: 'bakery', label: 'Bakery & food production', icon: Croissant },
  { value: 'restaurant', label: 'Restaurant & café', icon: UtensilsCrossed },
  { value: 'retail', label: 'Retail shop', icon: ShoppingBag },
  { value: 'supermarket', label: 'Supermarket', icon: ShoppingCart },
  { value: 'pharmacy', label: 'Pharmacy', icon: Pill },
  { value: 'wholesaler', label: 'Wholesaler & distributor', icon: Package },
  { value: 'boutique', label: 'Boutique & fashion', icon: Shirt },
  { value: 'salon', label: 'Salon & services', icon: Scissors },
  { value: 'gym', label: 'Gym & fitness', icon: Dumbbell },
  { value: 'manufacturer', label: 'Small manufacturer', icon: Factory },
  { value: 'clinic', label: 'Clinic', icon: Stethoscope },
  { value: 'other', label: 'Other', icon: Building2 },
]