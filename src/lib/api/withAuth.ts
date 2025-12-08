import { NextRequest, NextResponse } from 'next/server';
import {
  fetchCurrentUser,
  getAuthContext,
  type AuthUser,
  type AuthContext,
} from '@/server/authz';
import { handleApiError } from './errors';

/**
 * Handler type for authenticated routes
 */
type AuthenticatedHandler<T = unknown> = (
  request: NextRequest,
  context: T,
  user: AuthUser
) => Promise<NextResponse>;

/**
 * Handler type for routes with full auth context
 */
type AuthContextHandler<T = unknown> = (
  request: NextRequest,
  context: T,
  authContext: AuthContext
) => Promise<NextResponse>;

/**
 * Wrap a route handler to require authentication
 * Extracts user from Supabase Auth and passes to handler
 *
 * @example
 * export const POST = withAuth(async (req, ctx, user) => {
 *   // user is guaranteed to be authenticated
 *   return NextResponse.json({ userId: user.id });
 * });
 */
export function withAuth<T = unknown>(handler: AuthenticatedHandler<T>) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    try {
      const user = await fetchCurrentUser();
      return await handler(request, context, user);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Wrap a route handler to require authentication and provide full context
 * Includes admin status check
 *
 * @example
 * export const POST = withAuthContext(async (req, ctx, { user, isAdmin }) => {
 *   if (!isAdmin) throw new AuthorizationError();
 *   return NextResponse.json({ success: true });
 * });
 */
export function withAuthContext<T = unknown>(handler: AuthContextHandler<T>) {
  return async (request: NextRequest, context: T): Promise<NextResponse> => {
    try {
      const authContext = await getAuthContext();
      return await handler(request, context, authContext);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Get user ID from request headers (for development/testing)
 * Falls back to Supabase auth in production
 */
export async function getUserIdFromRequest(
  request: NextRequest
): Promise<string> {
  // Check for x-user-id header (development/testing)
  const headerUserId = request.headers.get('x-user-id');
  if (headerUserId) {
    return headerUserId;
  }

  // Fall back to Supabase auth
  const user = await fetchCurrentUser();
  return user.id;
}

/**
 * Get user from request (supports header override for testing)
 */
export async function getUserFromRequest(
  request: NextRequest
): Promise<AuthUser> {
  // Check for x-user-id header (development/testing)
  const headerUserId = request.headers.get('x-user-id');
  const headerUserEmail = request.headers.get('x-user-email');

  if (headerUserId) {
    return {
      id: headerUserId,
      email: headerUserEmail ?? `${headerUserId}@test.local`,
      name: undefined,
    };
  }

  // Fall back to Supabase auth
  return fetchCurrentUser();
}

/**
 * Try to get user from request without throwing
 * Returns null if not authenticated
 */
export async function tryGetUserFromRequest(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    return await getUserFromRequest(request);
  } catch {
    return null;
  }
}
