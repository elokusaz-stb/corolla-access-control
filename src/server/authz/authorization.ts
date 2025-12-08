import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { prisma } from '@/server/db';
import { AuthenticationError } from './errors';
import type { AuthUser, AuthContext } from './types';

/**
 * Admin emails for Phase 1
 * In production, this would come from a database or config
 */
const ADMIN_EMAILS = new Set([
  'admin@corolla.com',
  'admin@example.com',
  'elokusaz@silvertreebrands.com',
  'elokusaz@silvertree.cloud',
  // Add more admin emails as needed
]);

/**
 * Check if an email is an admin
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.has(email.toLowerCase());
}

/**
 * Create Supabase server client for auth checks
 */
function createSupabaseServerClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore errors from Server Components
          }
        },
      },
    }
  );
}

/**
 * Fetch the currently authenticated user from Supabase
 * @throws AuthenticationError if not authenticated
 */
export async function fetchCurrentUser(): Promise<AuthUser> {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    throw new AuthenticationError(
      'You must be logged in to perform this action'
    );
  }

  // Try to find the user in our database
  const dbUser = await prisma.user.findUnique({
    where: { email: user.email! },
    select: { id: true, email: true, name: true },
  });

  // Return database user if found, otherwise use Supabase user data
  return {
    id: dbUser?.id ?? user.id,
    email: user.email!,
    name: dbUser?.name ?? user.user_metadata?.name ?? undefined,
  };
}

/**
 * Get the full auth context for the current user
 * @throws AuthenticationError if not authenticated
 */
export async function getAuthContext(): Promise<AuthContext> {
  const user = await fetchCurrentUser();

  return {
    user,
    isAdmin: isAdminEmail(user.email),
  };
}

/**
 * Try to get the current user without throwing
 * Returns null if not authenticated
 */
export async function tryGetCurrentUser(): Promise<AuthUser | null> {
  try {
    return await fetchCurrentUser();
  } catch {
    return null;
  }
}

/**
 * Check if a user is a system owner
 * @param userId - The user ID to check
 * @param systemId - The system ID to check ownership for
 */
export async function isSystemOwner(
  userId: string,
  systemId: string
): Promise<boolean> {
  const count = await prisma.systemOwner.count({
    where: {
      userId,
      systemId,
    },
  });
  return count > 0;
}

/**
 * Check if a user is an admin or system owner
 */
export async function isAdminOrSystemOwner(
  userId: string,
  userEmail: string,
  systemId: string
): Promise<boolean> {
  if (isAdminEmail(userEmail)) {
    return true;
  }
  return isSystemOwner(userId, systemId);
}

/**
 * Get all system IDs that a user owns
 */
export async function getUserOwnedSystems(userId: string): Promise<string[]> {
  const ownerships = await prisma.systemOwner.findMany({
    where: { userId },
    select: { systemId: true },
  });
  return ownerships.map((o) => o.systemId);
}
