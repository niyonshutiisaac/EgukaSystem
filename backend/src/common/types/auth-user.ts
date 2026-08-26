import { Role } from '@prisma/client';
import { PlanId } from '@prisma/client';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tenantId: string | null;
  planId: PlanId | null;
  tenantStatus?: string | null;
  isSuperadmin: boolean;
}

export interface RequestWithUser extends Request {
  user: AuthUser;
}
