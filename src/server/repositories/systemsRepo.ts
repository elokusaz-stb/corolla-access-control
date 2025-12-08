import { prisma } from '@/server/db';
import type {
  SystemSearchParams,
  CreateSystemInput,
  UpdateSystemInput,
  CreateTierInput,
  CreateInstanceInput,
} from '@/lib/validation/systems';

/**
 * Systems Repository
 * Handles all Prisma database operations for systems, tiers, instances, and owners.
 */
export const systemsRepo = {
  // ===========================================
  // SYSTEM OPERATIONS
  // ===========================================

  /**
   * Find systems with optional search, includes, and pagination
   */
  async findMany(params: SystemSearchParams) {
    const { search, includeTiers, includeInstances, limit, offset } = params;

    const where: Parameters<typeof prisma.system.findMany>[0]['where'] = {};

    if (search) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [systems, total] = await Promise.all([
      prisma.system.findMany({
        where,
        select: {
          id: true,
          name: true,
          description: true,
          createdAt: true,
          updatedAt: true,
          tiers: includeTiers
            ? {
                select: { id: true, name: true },
                orderBy: { name: 'asc' },
              }
            : false,
          instances: includeInstances
            ? {
                select: { id: true, name: true },
                orderBy: { name: 'asc' },
              }
            : false,
          owners: {
            select: {
              user: {
                select: { id: true, name: true, email: true },
              },
            },
          },
          _count: {
            select: {
              tiers: true,
              instances: true,
            },
          },
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.system.count({ where }),
    ]);

    return { systems, total };
  },

  /**
   * Find a system by ID with optional includes
   */
  async findById(
    id: string,
    options?: {
      includeTiers?: boolean;
      includeInstances?: boolean;
      includeOwners?: boolean;
    }
  ) {
    return prisma.system.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        tiers: options?.includeTiers
          ? {
              select: { id: true, name: true },
              orderBy: { name: 'asc' },
            }
          : false,
        instances: options?.includeInstances
          ? {
              select: { id: true, name: true },
              orderBy: { name: 'asc' },
            }
          : false,
        owners: options?.includeOwners
          ? {
              select: {
                userId: true,
                user: {
                  select: { id: true, name: true, email: true },
                },
              },
            }
          : false,
      },
    });
  },

  /**
   * Find a system by name
   */
  async findByName(name: string) {
    return prisma.system.findFirst({
      where: { name: { equals: name, mode: 'insensitive' } },
      select: { id: true, name: true },
    });
  },

  /**
   * Create a new system
   */
  async create(data: CreateSystemInput) {
    return prisma.system.create({
      data: {
        name: data.name,
        description: data.description ?? null,
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Update a system
   */
  async update(id: string, data: UpdateSystemInput) {
    return prisma.system.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
      },
      select: {
        id: true,
        name: true,
        description: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Check if a system exists by ID
   */
  async exists(id: string) {
    const count = await prisma.system.count({ where: { id } });
    return count > 0;
  },

  // ===========================================
  // TIER OPERATIONS
  // ===========================================

  /**
   * Find all tiers for a system
   */
  async findTiersBySystemId(systemId: string) {
    return prisma.accessTier.findMany({
      where: { systemId },
      select: {
        id: true,
        name: true,
        systemId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Find a tier by name within a system
   */
  async findTierByName(systemId: string, name: string) {
    return prisma.accessTier.findFirst({
      where: {
        systemId,
        name: { equals: name, mode: 'insensitive' },
      },
      select: { id: true, name: true },
    });
  },

  /**
   * Create a new tier for a system
   */
  async createTier(systemId: string, data: CreateTierInput) {
    return prisma.accessTier.create({
      data: {
        name: data.name,
        systemId,
      },
      select: {
        id: true,
        name: true,
        systemId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // ===========================================
  // INSTANCE OPERATIONS
  // ===========================================

  /**
   * Find all instances for a system
   */
  async findInstancesBySystemId(systemId: string) {
    return prisma.instance.findMany({
      where: { systemId },
      select: {
        id: true,
        name: true,
        systemId: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { name: 'asc' },
    });
  },

  /**
   * Find an instance by name within a system
   */
  async findInstanceByName(systemId: string, name: string) {
    return prisma.instance.findFirst({
      where: {
        systemId,
        name: { equals: name, mode: 'insensitive' },
      },
      select: { id: true, name: true },
    });
  },

  /**
   * Create a new instance for a system
   */
  async createInstance(systemId: string, data: CreateInstanceInput) {
    return prisma.instance.create({
      data: {
        name: data.name,
        systemId,
      },
      select: {
        id: true,
        name: true,
        systemId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  // ===========================================
  // OWNER OPERATIONS
  // ===========================================

  /**
   * Find all owners for a system
   */
  async findOwnersBySystemId(systemId: string) {
    return prisma.systemOwner.findMany({
      where: { systemId },
      select: {
        userId: true,
        systemId: true,
        user: {
          select: { id: true, name: true, email: true },
        },
      },
    });
  },

  /**
   * Check if a user is an owner of a system
   */
  async isOwner(systemId: string, userId: string) {
    const count = await prisma.systemOwner.count({
      where: { systemId, userId },
    });
    return count > 0;
  },

  /**
   * Add owners to a system (upsert to avoid duplicates)
   */
  async addOwners(systemId: string, userIds: string[]) {
    // Use createMany with skipDuplicates to add new owners without failing on existing
    await prisma.systemOwner.createMany({
      data: userIds.map((userId) => ({
        systemId,
        userId,
      })),
      skipDuplicates: true,
    });

    // Return all owners after addition
    return this.findOwnersBySystemId(systemId);
  },
};

export type SystemsRepo = typeof systemsRepo;
