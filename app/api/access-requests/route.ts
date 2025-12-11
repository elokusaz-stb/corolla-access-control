import { NextRequest, NextResponse } from 'next/server';
import { accessRequestsService } from '@/server/services/accessRequestsService';
import { CreateAccessRequestSchema } from '@/lib/validation/accessRequests';
import { handleApiError } from '@/lib/api/errors';
import { getUserFromRequest } from '@/lib/api/withAuth';

/**
 * POST /api/access-requests
 * Creates a new access request.
 *
 * Request Body:
 * - userId: string (required) - User requesting access
 * - systemId: string (required) - System being requested
 * - instanceId: string (optional) - Specific instance (null = all instances)
 * - tierId: string (required) - Access tier/permission level
 * - reason: string (optional) - Reason for the request
 *
 * Automatically sets:
 * - requestedBy: current user ID (from auth)
 * - status: 'requested' or 'manager_approved' if requester is manager
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const input = CreateAccessRequestSchema.parse(body);

        // Get current user from auth
        const currentUser = await getUserFromRequest(request);

        // Check if requester is manager of the target user
        const isManagerOfUser = await accessRequestsService.isManagerOf(
            currentUser.id,
            input.userId
        );

        // Create the request
        const accessRequest = await accessRequestsService.createAccessRequest(
            input,
            currentUser.id,
            isManagerOfUser
        );

        return NextResponse.json(accessRequest, { status: 201 });
    } catch (error) {
        return handleApiError(error);
    }
}
