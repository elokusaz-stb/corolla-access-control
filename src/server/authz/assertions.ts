import {
  fetchCurrentUser,
  isSystemOwner,
  isAdminEmail,
  isAdminOrSystemOwner,
} from './authorization';
import { AuthorizationError } from './errors';
import type { AuthUser } from './types';

/**
 * Assert that the request has a valid authenticated user
 * @throws AuthenticationError if not authenticated
 */
export async function assertAuthenticated(): Promise<AuthUser> {
  return fetchCurrentUser();
}

/**
 * Assert that the user is a system owner for the given system
 * @throws AuthorizationError if user is not a system owner
 */
export async function assertSystemOwner(
  userId: string,
  systemId: string
): Promise<void> {
  const owner = await isSystemOwner(userId, systemId);
  if (!owner) {
    throw new AuthorizationError(
      'You must be a system owner to perform this action',
      'NOT_SYSTEM_OWNER'
    );
  }
}

/**
 * Assert that the user is an admin
 * @throws AuthorizationError if user is not an admin
 */
export function assertAdmin(userEmail: string): void {
  if (!isAdminEmail(userEmail)) {
    throw new AuthorizationError(
      'You must be an administrator to perform this action',
      'NOT_ADMIN'
    );
  }
}

/**
 * Assert that the user is either an admin or a system owner
 * @throws AuthorizationError if user is neither
 */
export async function assertAdminOrSystemOwner(
  userId: string,
  userEmail: string,
  systemId: string
): Promise<void> {
  const allowed = await isAdminOrSystemOwner(userId, userEmail, systemId);
  if (!allowed) {
    throw new AuthorizationError(
      'You must be an administrator or system owner to perform this action',
      'NOT_ADMIN_OR_OWNER'
    );
  }
}

/**
 * Assert that the user can modify the given system
 * (Must be admin or system owner)
 */
export async function assertCanModifySystem(
  userId: string,
  userEmail: string,
  systemId: string
): Promise<void> {
  return assertAdminOrSystemOwner(userId, userEmail, systemId);
}

/**
 * Assert that the user can create a new system
 * (Must be admin in Phase 1)
 */
export function assertCanCreateSystem(userEmail: string): void {
  // In Phase 1, only admins can create new systems
  assertAdmin(userEmail);
}

/**
 * Assert that the user can manage access grants for a system
 * (Must be system owner)
 */
export async function assertCanManageGrants(
  userId: string,
  systemId: string
): Promise<void> {
  return assertSystemOwner(userId, systemId);
}
