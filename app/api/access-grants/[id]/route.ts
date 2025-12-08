import { NextRequest, NextResponse } from 'next/server';
import { accessGrantsService } from '@/server/services/accessGrantsService';
import { UpdateAccessGrantSchema } from '@/lib/validation/accessGrants';
import { handleApiError } from '@/lib/api/errors';
import { getUserFromRequest } from '@/lib/api/withAuth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/access-grants/[id]
 * Returns a single access grant by ID.
 *
 * Authorization: All authenticated users can read
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const grant = await accessGrantsService.getAccessGrantById(id);

    if (!grant) {
      return NextResponse.json(
        {
          error: 'GRANT_NOT_FOUND',
          message: `Access grant with ID '${id}' not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(grant);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/access-grants/[id]
 * Updates an access grant's status.
 *
 * In Phase 1, only supports marking grants as 'removed'.
 *
 * Authorization: Only system owners can modify grants
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const input = UpdateAccessGrantSchema.parse(body);

    // Get current user
    const currentUser = await getUserFromRequest(request);

    // Authorization check is done inside the service
    // (checks if user is owner of the grant's system)
    const grant = await accessGrantsService.updateAccessGrantStatus(
      id,
      input,
      currentUser.id
    );

    return NextResponse.json(grant);
  } catch (error) {
    return handleApiError(error);
  }
}
