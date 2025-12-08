import { prisma } from '@/server/db';
import type {
  AccessGrantFilters,
  CreateAccessGrantInput,
  GrantStatus,
} from '@/lib/validation/accessGrants';

/**
 * Access Grants Repository
 * Handles all Prisma database operations for access grants.
 */
export const accessGrantsRepo = {
  /**
   * Find access grants with filters and pagination
   */
  async findMany(filters: AccessGrantFilters) {
    const {
      userId,
      systemId,
      instanceId,
      tierId,
      status,
      search,
      limit,
      offset,
    } = filters;

    const where: Parameters<typeof prisma.accessGrant.findMany>[0]['where'] =
      {};

    // Direct filters
    if (userId) where.userId = userId;
    if (systemId) where.systemId = systemId;
    if (instanceId) where.instanceId = instanceId;
    if (tierId) where.tierId = tierId;
    if (status) where.status = status;

    // Search by user name or email
    if (search) {
      where.user = {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      };
    }

    const [grants, total] = await Promise.all([
      prisma.accessGrant.findMany({
        where,
        select: {
          id: true,
          userId: true,
          systemId: true,
          instanceId: true,
          tierId: true,
          status: true,
          grantedBy: true,
          grantedAt: true,
          removedAt: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { id: true, name: true, email: true },
          },
          system: {
            select: { id: true, name: true },
          },
          instance: {
            select: { id: true, name: true },
          },
          tier: {
            select: { id: true, name: true },
          },
        },
        orderBy: { grantedAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      prisma.accessGrant.count({ where }),
    ]);

    return { grants, total };
  },

  /**
   * Find a single access grant by ID with all relations
   */
  async findById(id: string) {
    return prisma.accessGrant.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
        systemId: true,
        instanceId: true,
        tierId: true,
        status: true,
        grantedBy: true,
        grantedAt: true,
        removedAt: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        system: {
          select: { id: true, name: true },
        },
        instance: {
          select: { id: true, name: true },
        },
        tier: {
          select: { id: true, name: true },
        },
      },
    });
  },

  /**
   * Check if an active grant already exists for user/system/tier/instance combination
   */
  async checkExistingActiveGrant(
    userId: string,
    systemId: string,
    tierId: string,
    instanceId: string | null | undefined
  ) {
    const count = await prisma.accessGrant.count({
      where: {
        userId,
        systemId,
        tierId,
        instanceId: instanceId ?? null,
        status: 'active',
      },
    });
    return count > 0;
  },

  /**
   * Create a new access grant
   */
  async create(
    data: CreateAccessGrantInput & { grantedBy: string; status: GrantStatus }
  ) {
    return prisma.accessGrant.create({
      data: {
        userId: data.userId,
        systemId: data.systemId,
        instanceId: data.instanceId ?? null,
        tierId: data.tierId,
        status: data.status,
        grantedBy: data.grantedBy,
        grantedAt: new Date(),
        notes: data.notes ?? null,
      },
      select: {
        id: true,
        userId: true,
        systemId: true,
        instanceId: true,
        tierId: true,
        status: true,
        grantedBy: true,
        grantedAt: true,
        removedAt: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        system: {
          select: { id: true, name: true, description: true },
        },
        instance: {
          select: { id: true, name: true },
        },
        tier: {
          select: { id: true, name: true },
        },
      },
    });
  },

  /**
   * Update access grant status
   */
  async updateStatus(
    id: string,
    status: GrantStatus,
    notes?: string | null,
    removedAt?: Date | null
  ) {
    return prisma.accessGrant.update({
      where: { id },
      data: {
        status,
        ...(notes !== undefined && { notes }),
        ...(removedAt !== undefined && { removedAt }),
      },
      select: {
        id: true,
        userId: true,
        systemId: true,
        instanceId: true,
        tierId: true,
        status: true,
        grantedBy: true,
        grantedAt: true,
        removedAt: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: { id: true, name: true, email: true },
        },
        system: {
          select: { id: true, name: true },
        },
        instance: {
          select: { id: true, name: true },
        },
        tier: {
          select: { id: true, name: true },
        },
      },
    });
  },

  /**
   * Get system owners for authorization check
   */
  async getSystemOwners(systemId: string) {
    const owners = await prisma.systemOwner.findMany({
      where: { systemId },
      select: { userId: true },
    });
    return owners.map((o) => o.userId);
  },

  /**
   * Get a user by ID (for webhook notifications)
   */
  async getUserById(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
  },

  /**
   * Check if tier belongs to system
   */
  async tierBelongsToSystem(tierId: string, systemId: string) {
    const count = await prisma.accessTier.count({
      where: { id: tierId, systemId },
    });
    return count > 0;
  },

  /**
   * Check if instance belongs to system
   */
  async instanceBelongsToSystem(instanceId: string, systemId: string) {
    const count = await prisma.instance.count({
      where: { id: instanceId, systemId },
    });
    return count > 0;
  },

  /**
   * Check if user exists
   */
  async userExists(userId: string) {
    const count = await prisma.user.count({
      where: { id: userId },
    });
    return count > 0;
  },

  /**
   * Check if system exists
   */
  async systemExists(systemId: string) {
    const count = await prisma.system.count({
      where: { id: systemId },
    });
    return count > 0;
  },

  /**
   * Check if tier exists
   */
  async tierExists(tierId: string) {
    const count = await prisma.accessTier.count({
      where: { id: tierId },
    });
    return count > 0;
  },

  // ===========================================
  // BULK OPERATIONS
  // ===========================================

  /**
   * Batch insert multiple access grants in a transaction
   */
  async createMany(
    grants: Array<{
      userId: string;
      systemId: string;
      instanceId: string | null;
      tierId: string;
      status: GrantStatus;
      grantedBy: string;
      notes: string | null;
    }>
  ) {
    const now = new Date();

    return prisma.$transaction(async (tx) => {
      // Create all grants
      const createdGrants = await Promise.all(
        grants.map((grant) =>
          tx.accessGrant.create({
            data: {
              userId: grant.userId,
              systemId: grant.systemId,
              instanceId: grant.instanceId,
              tierId: grant.tierId,
              status: grant.status,
              grantedBy: grant.grantedBy,
              grantedAt: now,
              notes: grant.notes,
            },
            select: {
              id: true,
              userId: true,
              systemId: true,
              instanceId: true,
              tierId: true,
              status: true,
              grantedBy: true,
              grantedAt: true,
              removedAt: true,
              notes: true,
              user: {
                select: { id: true, name: true, email: true },
              },
              system: {
                select: { id: true, name: true },
              },
              instance: {
                select: { id: true, name: true },
              },
              tier: {
                select: { id: true, name: true },
              },
            },
          })
        )
      );

      return createdGrants;
    });
  },

  /**
   * Check for existing active grants for multiple user/system/tier/instance combinations
   * Returns array of combinations that already have active grants
   */
  async checkExistingActiveGrantsBatch(
    combinations: Array<{
      userId: string;
      systemId: string;
      tierId: string;
      instanceId: string | null;
    }>
  ) {
    const existingGrants = await prisma.accessGrant.findMany({
      where: {
        OR: combinations.map((c) => ({
          userId: c.userId,
          systemId: c.systemId,
          tierId: c.tierId,
          instanceId: c.instanceId,
          status: 'active',
        })),
      },
      select: {
        userId: true,
        systemId: true,
        tierId: true,
        instanceId: true,
      },
    });

    return existingGrants;
  },
};

export type AccessGrantsRepo = typeof accessGrantsRepo;
