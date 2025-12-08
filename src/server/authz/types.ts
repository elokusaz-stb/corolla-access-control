/**
 * Authorization Types for Corolla
 */

/**
 * Authenticated user context from Supabase Auth
 */
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
}

/**
 * Authorization context passed to handlers
 */
export interface AuthContext {
  user: AuthUser;
  isAdmin: boolean;
}

/**
 * Role definitions for future expansion
 */
export type Role = 'user' | 'admin' | 'auditor';

/**
 * Permission types
 */
export type Permission =
  | 'read:users'
  | 'read:systems'
  | 'read:grants'
  | 'create:grants'
  | 'update:grants'
  | 'delete:grants'
  | 'manage:system'
  | 'manage:tiers'
  | 'manage:instances'
  | 'manage:owners';

/**
 * System owner check result
 */
export interface OwnershipCheckResult {
  isOwner: boolean;
  systemId: string;
  userId: string;
}
