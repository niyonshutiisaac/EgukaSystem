import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';

/** Restricts a route to specific roles. Superadmin always bypasses. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
