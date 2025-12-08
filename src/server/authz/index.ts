// Types
export type {
  AuthUser,
  AuthContext,
  Role,
  Permission,
  OwnershipCheckResult,
} from './types';

// Errors
export {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from './errors';

// Authorization helpers
export {
  fetchCurrentUser,
  getAuthContext,
  tryGetCurrentUser,
  isSystemOwner,
  isAdminOrSystemOwner,
  isAdminEmail,
  getUserOwnedSystems,
} from './authorization';

// Assertion helpers
export {
  assertAuthenticated,
  assertSystemOwner,
  assertAdmin,
  assertAdminOrSystemOwner,
  assertCanModifySystem,
  assertCanCreateSystem,
  assertCanManageGrants,
} from './assertions';
