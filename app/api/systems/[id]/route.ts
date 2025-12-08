import { NextRequest, NextResponse } from 'next/server';
import { systemsService } from '@/server/services/systemsService';
import { UpdateSystemSchema } from '@/lib/validation/systems';
import { handleApiError } from '@/lib/api/errors';
import { getUserFromRequest } from '@/lib/api/withAuth';
import { assertCanModifySystem } from '@/server/authz';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/systems/[id]
 * Returns a single system by ID with optional includes.
 *
 * Authorization: All authenticated users can read
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    const options = {
      includeTiers: searchParams.get('includeTiers') === 'true',
      includeInstances: searchParams.get('includeInstances') === 'true',
      includeOwners: searchParams.get('includeOwners') === 'true',
    };

    const system = await systemsService.getSystemById(id, options);

    if (!system) {
      return NextResponse.json(
        {
          error: 'SYSTEM_NOT_FOUND',
          message: `System with ID '${id}' not found`,
        },
        { status: 404 }
      );
    }

    return NextResponse.json(system);
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * PATCH /api/systems/[id]
 * Updates a system's name and/or description.
 *
 * Authorization: Only system owners or admins can modify
 */
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get current user
    const currentUser = await getUserFromRequest(request);

    // Authorization: Must be admin or system owner
    await assertCanModifySystem(currentUser.id, currentUser.email, id);

    const body = await request.json();
    const input = UpdateSystemSchema.parse(body);
    const system = await systemsService.updateSystem(id, input);

    return NextResponse.json(system);
  } catch (error) {
    return handleApiError(error);
  }
}
