import { NextRequest, NextResponse } from 'next/server';
import { systemsService } from '@/server/services/systemsService';
import {
  SystemSearchSchema,
  CreateSystemSchema,
} from '@/lib/validation/systems';
import { handleApiError } from '@/lib/api/errors';
import { getUserFromRequest } from '@/lib/api/withAuth';
import { assertCanCreateSystem } from '@/server/authz';

/**
 * GET /api/systems
 * Returns a paginated list of systems with optional search and includes.
 *
 * Authorization: All authenticated users can read
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      search: searchParams.get('search') ?? undefined,
      includeTiers: searchParams.get('includeTiers') ?? undefined,
      includeInstances: searchParams.get('includeInstances') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    };

    const params = SystemSearchSchema.parse(rawParams);
    const result = await systemsService.searchSystems(params);

    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/systems
 * Creates a new system.
 *
 * Authorization: Only admins can create new systems (Phase 1)
 */
export async function POST(request: NextRequest) {
  try {
    // Get current user
    const currentUser = await getUserFromRequest(request);

    // Authorization: Only admins can create systems
    assertCanCreateSystem(currentUser.email);

    const body = await request.json();
    const input = CreateSystemSchema.parse(body);
    const system = await systemsService.createSystem(input);

    return NextResponse.json(system, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
