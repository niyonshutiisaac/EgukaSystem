import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '@/lib/session'
import type { Role } from '@/lib/types'

export function RequireAuth({ children }: { children: ReactNode }) {
  const session = useSession((s) => s.session)
  if (!session) return <Navigate to="/login" replace />
  return <>{children}</>
}

export function RequirePlatform({ children }: { children: ReactNode }) {
  const session = useSession((s) => s.session)
  if (!session) return <Navigate to="/login" replace />
  if (session.role !== 'superadmin') return <Navigate to="/app" replace />
  return <>{children}</>
}

export function RequireRole({ role, children }: { role: Role; children: ReactNode }) {
  const session = useSession((s) => s.session)
  if (session?.role !== role) return <Navigate to="/app" replace />
  return <>{children}</>
}

export function RequireTenantUsable({ children }: { children: ReactNode }) {
  const session = useSession((s) => s.session)
  if (!session) return <Navigate to="/login" replace />
  if (session.role === 'superadmin') return <>{children}</>
  const status = session.tenant.status
  if (status === 'pending' || status === 'rejected') return <Navigate to="/pending" replace />
  if (status === 'suspended' || status === 'expired') return <Navigate to="/renew" replace />
  return <>{children}</>
}