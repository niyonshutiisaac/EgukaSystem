export type PlanId = 'starter' | 'growth' | 'professional' | 'enterprise'

export type TenantStatus = 'pending' | 'trial' | 'active' | 'expired' | 'suspended' | 'rejected'

export type BusinessType =
  | 'bakery'
  | 'restaurant'
  | 'retail'
  | 'supermarket'
  | 'pharmacy'
  | 'wholesaler'
  | 'boutique'
  | 'salon'
  | 'gym'
  | 'manufacturer'
  | 'clinic'
  | 'other'

export type Role = 'owner' | 'manager' | 'cashier' | 'production' | 'accountant' | 'superadmin'

export interface Plan {
  id: PlanId
  name: string
  priceMonthly: number
  priceAnnual: number
  seats: number
  description: string
  features: string[]
  featureFlags: FeatureFlag[]
  aiCredits: number
  tagline: string
}

export type FeatureFlag =
  | 'multiBranch'
  | 'warehouses'
  | 'production'
  | 'forecasting'
  | 'aiAssistant'
  | 'advancedReports'
  | 'expenses'
  | 'procurement'
  | 'auditLogs'
  | 'apiAccess'
  | 'bulkImport'

export interface Tenant {
  id: string
  name: string
  businessType: BusinessType
  status: TenantStatus
  planId: PlanId
  trialEndsAt?: string
  subscriptionEndsAt: string
  joinedAt: string
  branches: Branch[]
  address: string
  city: string
  phone: string
  email: string
  tin?: string
  users: TenantUser[]
  aiCreditsUsed: number
}

export interface Branch {
  id: string
  name: string
  city: string
  isHeadOffice: boolean
}

export interface TenantUser {
  id: string
  name: string
  email: string
  phone: string
  role: Role
  status: 'active' | 'invited' | 'inactive'
  joinedAt?: string
}

export interface RegistrationRequest {
  id: string
  companyName: string
  businessType: BusinessType
  planId: PlanId
  contactName: string
  contactEmail: string
  contactPhone: string
  city: string
  address: string
  message?: string
  submittedAt: string
  status: 'pending' | 'approved' | 'rejected'
  reviewedBy?: string
  reviewedAt?: string
  reviewNote?: string
  withTrial?: boolean
}

export interface Product {
  id: string
  name: string
  category: string
  sku: string
  price: number
  cost: number
  stock: number
  minStock: number
  unit: string
  barcode?: string
}

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
  type: 'walk-in' | 'credit' | 'wholesale'
  balance: number
  totalPurchases: number
  orderCount: number
  lastOrderAt: string
  avgOrderIntervalDays: number
  city: string
  notes?: string
}

export interface Sale {
  id: string
  invoiceNo: string
  customerId?: string
  customerName: string
  branchId: string
  items: { productId: string; name: string; qty: number; price: number }[]
  subtotal: number
  discount: number
  tax: number
  total: number
  paymentMethod: 'cash' | 'momo' | 'card' | 'credit'
  paymentStatus: 'paid' | 'partial' | 'credit' | 'refunded'
  createdAt: string
  cashierId?: string
}

export interface InventoryMovement {
  id: string
  productId: string
  productName: string
  type: 'purchase' | 'sale' | 'production' | 'waste' | 'transfer' | 'adjustment'
  qty: number
  balanceAfter: number
  branchId?: string
  by: string
  at: string
  note?: string
}

export interface Recipe {
  id: string
  productId: string
  productName: string
  batchSize: number
  ingredients: { productId: string; name: string; qtyPerBatch: number; unit: string }[]
  version: number
}

export interface Batch {
  id: string
  recipeId: string
  productName: string
  plannedQty: number
  producedQty: number
  wasteQty: number
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  plannedFor: string
  startedAt?: string
  completedAt?: string
  by?: string
}

export interface Expense {
  id: string
  category: string
  description: string
  amount: number
  branchId?: string
  by: string
  at: string
}

export interface Supplier {
  id: string
  name: string
  phone: string
  products: string[]
  totalPurchases: number
  outstanding: number
  rating: number
}

export interface Notification {
  id: string
  title: string
  body: string
  kind: 'info' | 'warning' | 'danger' | 'success'
  at: string
  read: boolean
}

export interface AiInsight {
  id: string
  kind: 'alert' | 'customer' | 'inventory' | 'production' | 'finance' | 'action'
  severity: 'info' | 'warning' | 'danger'
  title: string
  body: string
}

export interface AiRecommendation {
  id: string
  title: string
  detail: string
  impact: 'high' | 'medium' | 'low'
  kind: 'purchase' | 'production' | 'customer' | 'waste' | 'finance'
}