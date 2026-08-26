import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Role, Tenant } from './types'
import { abcBakery, imaneSupermarket, karibuCafe } from '@/data/tenants'

export interface DemoAccount {
  label: string
  role: Role
  tenant: Tenant
  userName: string
}

export const DEMO_ACCOUNTS: DemoAccount[] = [
  { label: 'Platform Owner', role: 'superadmin', tenant: abcBakery, userName: 'System Admin' },
  { label: 'Business Owner', role: 'owner', tenant: abcBakery, userName: 'Jean Bosco Habimana' },
  { label: 'Manager', role: 'manager', tenant: abcBakery, userName: 'Alissa Uwase' },
  { label: 'Cashier', role: 'cashier', tenant: abcBakery, userName: 'Eric Niyonsaba' },
  { label: 'Production Manager', role: 'production', tenant: abcBakery, userName: 'Claudine Mukamana' },
  { label: 'Accountant', role: 'accountant', tenant: abcBakery, userName: 'Patrick Mugisha' },
  { label: 'Trial Business Owner (Imane)', role: 'owner', tenant: imaneSupermarket, userName: 'Fidele Nkurunziza' },
  { label: 'Pending Business (Karibu Café)', role: 'owner', tenant: karibuCafe, userName: 'Aline Mukeshimana' },
]

interface SessionState {
  session: {
    userName: string
    role: Role
    tenant: Tenant
  } | null
  login: (account: DemoAccount) => void
  logout: () => void
}

export const useSession = create<SessionState>()(
  persist(
    (set) => ({
      session: null,
      login: (account) =>
        set({
          session: {
            userName: account.userName,
            role: account.role,
            tenant: account.tenant,
          },
        }),
      logout: () => set({ session: null }),
    }),
    { name: 'egukasystem-session' },
  ),
)