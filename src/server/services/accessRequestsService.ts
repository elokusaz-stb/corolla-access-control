import { prisma } from '@/lib/prisma';
import type { CreateAccessRequestInput } from '@/lib/validation/accessRequests';
import { ServiceError } from './usersService';

/**
 * Access Requests Service
 * Handles business logic for access request operations.
 */
export const accessRequestsService = {
    /**
     * Create a new access request
     * @param input - Request creation data
     * @param requestedBy - ID of the user creating the request
     * @param isManagerOfUser - Whether the requester is the manager of the target user
     */
    async createAccessRequest(
        input: CreateAccessRequestInput,
        requestedBy: string,
        isManagerOfUser: boolean = false
    ) {
        // 1. Validate user exists
        const user = await prisma.user.findUnique({
            where: { id: input.userId },
            include: { manager: true },
        });
        if (!user) {
            throw new ServiceError(
                `User with ID '${input.userId}' not found`,
                'USER_NOT_FOUND',
                400
            );
        }

        // 2. Validate system exists
        const system = await prisma.system.findUnique({
            where: { id: input.systemId },
        });
        if (!system) {
            throw new ServiceError(
                `System with ID '${input.systemId}' not found`,
                'SYSTEM_NOT_FOUND',
                400
            );
        }

        // 3. Validate tier exists and belongs to system
        const tier = await prisma.accessTier.findUnique({
            where: { id: input.tierId },
        });
        if (!tier) {
            throw new ServiceError(
                `Tier with ID '${input.tierId}' not found`,
                'TIER_NOT_FOUND',
                400
            );
        }
        if (tier.systemId !== input.systemId) {
            throw new ServiceError(
                'The specified tier does not belong to this system',
                'TIER_SYSTEM_MISMATCH',
                400
            );
        }

        // 4. If instanceId provided, validate it belongs to system
        let instance = null;
        if (input.instanceId) {
            instance = await prisma.instance.findUnique({
                where: { id: input.instanceId },
            });
            if (!instance || instance.systemId !== input.systemId) {
                throw new ServiceError(
                    'The specified instance does not belong to this system',
                    'INSTANCE_SYSTEM_MISMATCH',
                    400
                );
            }
        }

        // 5. Determine initial status based on requester role
        const status = isManagerOfUser ? 'manager_approved' : 'requested';

        // 6. Create the request
        const request = await prisma.accessRequest.create({
            data: {
                userId: input.userId,
                requestedBy,
                systemId: input.systemId,
                instanceId: input.instanceId ?? null,
                tierId: input.tierId,
                status,
                reason: input.reason ?? null,
            },
            include: {
                user: { select: { id: true, name: true, email: true } },
                requester: { select: { id: true, name: true, email: true } },
                system: { select: { id: true, name: true } },
                instance: { select: { id: true, name: true } },
                tier: { select: { id: true, name: true } },
            },
        });

        return {
            ...request,
            isAutoApproved: isManagerOfUser,
        };
    },

    /**
     * Check if requester is the manager of the target user
     */
    async isManagerOf(requesterId: string, userId: string): Promise<boolean> {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { managerId: true },
        });
        return user?.managerId === requesterId;
    },
};

export type AccessRequestsService = typeof accessRequestsService;
