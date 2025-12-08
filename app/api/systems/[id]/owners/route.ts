import { NextRequest, NextResponse } from 'next/server';
import { systemsService } from '@/server/services/systemsService';
import { AddOwnersSchema } from '@/lib/validation/systems';
import { handleApiError } from '@/lib/api/errors';
import { getUserFromRequest } from '@/lib/api/withAuth';
import { assertCanModifySystem } from '@/server/authz';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/systems/[id]/owners
 * Returns all owners for a system.
 *
 * Authorization: All authenticated users can read
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const owners = await systemsService.getOwnersBySystemId(id);

    return NextResponse.json({ data: owners });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/systems/[id]/owners
 * Adds owners to a system (appends, does not replace).
 *
 * Authorization: Only existing system owners or admins can add new owners
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get current user
    const currentUser = await getUserFromRequest(request);

    // Authorization: Must be admin or existing system owner
    await assertCanModifySystem(currentUser.id, currentUser.email, id);

    const body = await request.json();
    const input = AddOwnersSchema.parse(body);
    const owners = await systemsService.addOwners(id, input.userIds);

    return NextResponse.json({ data: owners }, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
