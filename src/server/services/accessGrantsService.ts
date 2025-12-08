import { accessGrantsRepo } from '@/server/repositories/accessGrantsRepo';
import { ServiceError } from './usersService';
import { AuthorizationError } from '@/server/authz';
import { webhookService } from './webhookService';
import type {
  AccessGrantFilters,
  CreateAccessGrantInput,
  UpdateAccessGrantInput,
  AccessGrantListResponse,
  AccessGrantResponse,
} from '@/lib/validation/accessGrants';

// Re-export for backwards compatibility
export { AuthorizationError } from '@/server/authz';

/**
 * Assert that a user is a system owner
 * @throws AuthorizationError if user is not an owner
 */
async function assertUserIsSystemOwner(
  userId: string,
  systemId: string
): Promise<void> {
  const owners = await accessGrantsRepo.getSystemOwners(systemId);
  if (!owners.includes(userId)) {
    throw new AuthorizationError(
      'You do not have permission to modify access grants for this system',
      'NOT_SYSTEM_OWNER'
    );
  }
}

/**
 * Transform database grant to response format
 */
function transformGrantToResponse(
  grant: Awaited<ReturnType<typeof accessGrantsRepo.findById>>
): AccessGrantResponse {
  if (!grant) {
    throw new Error('Grant not found');
  }

  return {
    id: grant.id,
    userId: grant.userId,
    systemId: grant.systemId,
    instanceId: grant.instanceId,
    tierId: grant.tierId,
    status: grant.status,
    grantedBy: grant.grantedBy,
    grantedAt: grant.grantedAt,
    removedAt: grant.removedAt,
    notes: grant.notes,
    createdAt: grant.createdAt,
    updatedAt: grant.updatedAt,
    user: grant.user,
    system: grant.system,
    instance: grant.instance,
    tier: grant.tier,
  };
}

/**
 * Access Grants Service
 * Handles business logic for access grant operations.
 */
export const accessGrantsService = {
  /**
   * Search and list access grants with filters
   */
  async listAccessGrants(
    filters: AccessGrantFilters
  ): Promise<AccessGrantListResponse> {
    const { grants, total } = await accessGrantsRepo.findMany(filters);

    return {
      data: grants.map((grant) => transformGrantToResponse(grant)),
      total,
      limit: filters.limit,
      offset: filters.offset,
    };
  },

  /**
   * Get a single access grant by ID
   */
  async getAccessGrantById(id: string): Promise<AccessGrantResponse | null> {
    const grant = await accessGrantsRepo.findById(id);
    if (!grant) {
      return null;
    }
    return transformGrantToResponse(grant);
  },

  /**
   * Create a new access grant
   * @param input - Grant creation data
   * @param grantedBy - ID of the user creating the grant
   */
  async createAccessGrant(
    input: CreateAccessGrantInput,
    grantedBy: string
  ): Promise<AccessGrantResponse> {
    // 1. Validate user exists
    const userExists = await accessGrantsRepo.userExists(input.userId);
    if (!userExists) {
      throw new ServiceError(
        `User with ID '${input.userId}' not found`,
        'USER_NOT_FOUND',
        400
      );
    }

    // 2. Validate system exists
    const systemExists = await accessGrantsRepo.systemExists(input.systemId);
    if (!systemExists) {
      throw new ServiceError(
        `System with ID '${input.systemId}' not found`,
        'SYSTEM_NOT_FOUND',
        400
      );
    }

    // 3. Validate tier exists
    const tierExists = await accessGrantsRepo.tierExists(input.tierId);
    if (!tierExists) {
      throw new ServiceError(
        `Tier with ID '${input.tierId}' not found`,
        'TIER_NOT_FOUND',
        400
      );
    }

    // 4. Validate tier belongs to system
    const tierBelongsToSystem = await accessGrantsRepo.tierBelongsToSystem(
      input.tierId,
      input.systemId
    );
    if (!tierBelongsToSystem) {
      throw new ServiceError(
        'The specified tier does not belong to this system',
        'TIER_SYSTEM_MISMATCH',
        400
      );
    }

    // 5. If instanceId provided, validate it belongs to system
    if (input.instanceId) {
      const instanceBelongsToSystem =
        await accessGrantsRepo.instanceBelongsToSystem(
          input.instanceId,
          input.systemId
        );
      if (!instanceBelongsToSystem) {
        throw new ServiceError(
          'The specified instance does not belong to this system',
          'INSTANCE_SYSTEM_MISMATCH',
          400
        );
      }
    }

    // 6. Check for existing active grant (duplicate prevention)
    const hasExistingGrant = await accessGrantsRepo.checkExistingActiveGrant(
      input.userId,
      input.systemId,
      input.tierId,
      input.instanceId
    );
    if (hasExistingGrant) {
      throw new ServiceError(
        'User already has active access for this tier on this system',
        'DUPLICATE_ACTIVE_GRANT',
        400
      );
    }

    // 7. Create the grant
    const grant = await accessGrantsRepo.create({
      ...input,
      grantedBy,
      status: 'active',
    });

    // 8. Send webhook notification (async, don't block)
    try {
      const grantedByUser = await accessGrantsRepo.getUserById(grantedBy);

      // Send webhook even if we can't find the granting user (use ID as fallback)
      const grantorInfo = grantedByUser
        ? { name: grantedByUser.name, email: grantedByUser.email }
        : { name: 'System Admin', email: grantedBy };

      if (grant.user && grant.system && grant.tier) {
        void webhookService.notifyAccessGranted({
          grantedByUser: grantorInfo,
          grantedToUser: {
            name: grant.user.name,
            email: grant.user.email,
          },
          system: {
            name: grant.system.name,
            description: grant.system.description,
          },
          tier: {
            name: grant.tier.name,
          },
          instance: grant.instance ? { name: grant.instance.name } : null,
          notes: input.notes,
          grantedAt: grant.grantedAt,
        });
      }
    } catch (webhookError) {
      // Don't throw - webhook errors shouldn't break the grant flow
      console.error('[Webhook] Error preparing notification:', webhookError);
    }

    return transformGrantToResponse(grant);
  },

  /**
   * Update access grant status (Phase 1: only active → removed)
   * @param id - Grant ID
   * @param input - Update data
   * @param currentUserId - ID of the user making the request
   */
  async updateAccessGrantStatus(
    id: string,
    input: UpdateAccessGrantInput,
    currentUserId: string
  ): Promise<AccessGrantResponse> {
    // 1. Find the grant
    const grant = await accessGrantsRepo.findById(id);
    if (!grant) {
      throw new ServiceError(
        `Access grant with ID '${id}' not found`,
        'GRANT_NOT_FOUND',
        404
      );
    }

    // 2. Authorization: Check if user is system owner
    await assertUserIsSystemOwner(currentUserId, grant.systemId);

    // 3. Validate status transition
    if (grant.status === 'removed') {
      throw new ServiceError(
        'This access grant has already been removed',
        'GRANT_ALREADY_REMOVED',
        400
      );
    }

    // 4. Update the grant
    const updatedGrant = await accessGrantsRepo.updateStatus(
      id,
      input.status,
      input.notes ?? grant.notes,
      new Date() // removedAt
    );

    return transformGrantToResponse(updatedGrant);
  },

  /**
   * Check if a user is a system owner (exposed for route handlers)
   */
  async isSystemOwner(userId: string, systemId: string): Promise<boolean> {
    const owners = await accessGrantsRepo.getSystemOwners(systemId);
    return owners.includes(userId);
  },
};

export type AccessGrantsService = typeof accessGrantsService;
