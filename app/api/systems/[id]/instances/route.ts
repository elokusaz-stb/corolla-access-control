import { NextRequest, NextResponse } from 'next/server';
import { systemsService } from '@/server/services/systemsService';
import { CreateInstanceSchema } from '@/lib/validation/systems';
import { handleApiError } from '@/lib/api/errors';
import { getUserFromRequest } from '@/lib/api/withAuth';
import { assertCanModifySystem } from '@/server/authz';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/systems/[id]/instances
 * Returns all instances for a system.
 *
 * Authorization: All authenticated users can read
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const instances = await systemsService.getInstancesBySystemId(id);

    return NextResponse.json({ data: instances });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/systems/[id]/instances
 * Creates a new instance for a system.
 *
 * Authorization: Only system owners or admins can create instances
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get current user
    const currentUser = await getUserFromRequest(request);

    // Authorization: Must be admin or system owner
    await assertCanModifySystem(currentUser.id, currentUser.email, id);

    const body = await request.json();
    const input = CreateInstanceSchema.parse(body);
    const instance = await systemsService.createInstance(id, input);

    return NextResponse.json(instance, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
