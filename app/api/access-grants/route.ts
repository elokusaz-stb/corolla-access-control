import { NextRequest, NextResponse } from 'next/server';
import { accessGrantsService } from '@/server/services/accessGrantsService';
import {
  AccessGrantFiltersSchema,
  CreateAccessGrantSchema,
} from '@/lib/validation/accessGrants';
import { handleApiError } from '@/lib/api/errors';

/**
 * GET /api/access-grants
 * Returns a filtered, paginated list of access grants.
 *
 * Query Parameters:
 * - userId: string (optional) - Filter by user
 * - systemId: string (optional) - Filter by system
 * - instanceId: string (optional) - Filter by instance
 * - tierId: string (optional) - Filter by tier
 * - status: 'active' | 'removed' (optional) - Filter by status
 * - search: string (optional) - Search user name or email
 * - limit: number (default 20, max 100) - Results per page
 * - offset: number (default 0) - Skip N results
 *
 * Response includes nested: user, system, instance, tier
 * Sorted by grantedAt descending (newest first)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      userId: searchParams.get('userId') ?? undefined,
      systemId: searchParams.get('systemId') ?? undefined,
      instanceId: searchParams.get('instanceId') ?? undefined,
      tierId: searchParams.get('tierId') ?? undefined,
      status: searchParams.get('status') ?? undefined,
      search: searchParams.get('search') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    };

    const filters = AccessGrantFiltersSchema.parse(rawParams);
    const result = await accessGrantsService.listAccessGrants(filters);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/access-grants
 * Creates a new access grant.
 *
 * Request Body:
 * - userId: string (required) - User receiving access
 * - systemId: string (required) - System being accessed
 * - instanceId: string (optional) - Specific instance (null = all instances)
 * - tierId: string (required) - Access tier/permission level
 * - notes: string (optional) - Notes about the grant
 *
 * Automatically sets:
 * - grantedBy: current user ID (from header/auth)
 * - grantedAt: current timestamp
 * - status: 'active'
 *
 * Validations:
 * - Tier must belong to the specified system
 * - Instance (if provided) must belong to the specified system
 * - No duplicate active grants for same user/system/tier/instance
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const input = CreateAccessGrantSchema.parse(body);

    // In production, get this from auth session
    // For now, use a header or default for development
    const grantedBy = request.headers.get('x-user-id') ?? 'system-admin';

    const grant = await accessGrantsService.createAccessGrant(input, grantedBy);

    return NextResponse.json(grant, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

