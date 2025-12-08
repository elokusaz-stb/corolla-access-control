import { NextRequest, NextResponse } from 'next/server';
import { systemsService } from '@/server/services/systemsService';
import { CreateTierSchema } from '@/lib/validation/systems';
import { handleApiError } from '@/lib/api/errors';
import { getUserFromRequest } from '@/lib/api/withAuth';
import { assertCanModifySystem } from '@/server/authz';

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/systems/[id]/tiers
 * Returns all access tiers for a system.
 *
 * Authorization: All authenticated users can read
 */
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const tiers = await systemsService.getTiersBySystemId(id);

    return NextResponse.json({ data: tiers });
  } catch (error) {
    return handleApiError(error);
  }
}

/**
 * POST /api/systems/[id]/tiers
 * Creates a new access tier for a system.
 *
 * Authorization: Only system owners or admins can create tiers
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    // Get current user
    const currentUser = await getUserFromRequest(request);

    // Authorization: Must be admin or system owner
    await assertCanModifySystem(currentUser.id, currentUser.email, id);

    const body = await request.json();
    const input = CreateTierSchema.parse(body);
    const tier = await systemsService.createTier(id, input);

    return NextResponse.json(tier, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
