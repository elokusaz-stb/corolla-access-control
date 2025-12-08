import { systemsRepo } from '@/server/repositories/systemsRepo';
import { usersRepo } from '@/server/repositories/usersRepo';
import { ServiceError } from './usersService';
import type {
  SystemSearchParams,
  CreateSystemInput,
  UpdateSystemInput,
  CreateTierInput,
  CreateInstanceInput,
  SystemListResponse,
  SystemResponse,
  TierResponse,
  InstanceResponse,
} from '@/lib/validation/systems';

/**
 * Systems Service
 * Handles business logic for system, tier, instance, and owner operations.
 */
export const systemsService = {
  // ===========================================
  // SYSTEM OPERATIONS
  // ===========================================

  /**
   * Search and list systems with pagination
   */
  async searchSystems(params: SystemSearchParams): Promise<SystemListResponse> {
    const { systems, total } = await systemsRepo.findMany(params);

    return {
      data: systems.map((system) => ({
        id: system.id,
        name: system.name,
        description: system.description,
        createdAt: system.createdAt,
        updatedAt: system.updatedAt,
        ...(system.tiers && { tiers: system.tiers }),
        ...(system.instances && { instances: system.instances }),
        // Include owners (mapped from join table format)
        ...('owners' in system && system.owners && {
          owners: system.owners.map((o: { user: { id: string; name: string; email: string } }) => ({
            user: {
              id: o.user.id,
              name: o.user.name,
              email: o.user.email,
            },
          })),
        }),
        // Include counts
        ...('_count' in system && { _count: system._count }),
      })),
      total,
      limit: params.limit,
      offset: params.offset,
    };
  },

  /**
   * Get a system by ID
   */
  async getSystemById(
    id: string,
    options?: {
      includeTiers?: boolean;
      includeInstances?: boolean;
      includeOwners?: boolean;
    }
  ): Promise<SystemResponse | null> {
    const system = await systemsRepo.findById(id, options);
    if (!system) {
      return null;
    }

    const response: SystemResponse = {
      id: system.id,
      name: system.name,
      description: system.description,
      createdAt: system.createdAt,
      updatedAt: system.updatedAt,
    };

    if (system.tiers) {
      response.tiers = system.tiers;
    }

    if (system.instances) {
      response.instances = system.instances;
    }

    if (system.owners) {
      response.owners = system.owners.map((o) => ({
        id: o.user.id,
        name: o.user.name,
        email: o.user.email,
      }));
    }

    return response;
  },

  /**
   * Create a new system
   */
  async createSystem(input: CreateSystemInput): Promise<SystemResponse> {
    // Check if name already exists
    const existing = await systemsRepo.findByName(input.name);
    if (existing) {
      throw new ServiceError(
        `System with name '${input.name}' already exists`,
        'SYSTEM_NAME_EXISTS',
        400
      );
    }

    const system = await systemsRepo.create(input);

    return {
      id: system.id,
      name: system.name,
      description: system.description,
      createdAt: system.createdAt,
      updatedAt: system.updatedAt,
    };
  },

  /**
   * Update a system
   */
  async updateSystem(
    id: string,
    input: UpdateSystemInput
  ): Promise<SystemResponse> {
    // Verify system exists
    const exists = await systemsRepo.exists(id);
    if (!exists) {
      throw new ServiceError(
        `System with ID '${id}' not found`,
        'SYSTEM_NOT_FOUND',
        404
      );
    }

    // If updating name, check for uniqueness
    if (input.name) {
      const existing = await systemsRepo.findByName(input.name);
      if (existing && existing.id !== id) {
        throw new ServiceError(
          `System with name '${input.name}' already exists`,
          'SYSTEM_NAME_EXISTS',
          400
        );
      }
    }

    const system = await systemsRepo.update(id, input);

    return {
      id: system.id,
      name: system.name,
      description: system.description,
      createdAt: system.createdAt,
      updatedAt: system.updatedAt,
    };
  },

  /**
   * Check if a user is an owner of a system
   */
  async isSystemOwner(systemId: string, userId: string): Promise<boolean> {
    return systemsRepo.isOwner(systemId, userId);
  },

  // ===========================================
  // TIER OPERATIONS
  // ===========================================

  /**
   * Get all tiers for a system
   */
  async getTiersBySystemId(systemId: string): Promise<TierResponse[]> {
    // Verify system exists
    const exists = await systemsRepo.exists(systemId);
    if (!exists) {
      throw new ServiceError(
        `System with ID '${systemId}' not found`,
        'SYSTEM_NOT_FOUND',
        404
      );
    }

    const tiers = await systemsRepo.findTiersBySystemId(systemId);
    return tiers.map((tier) => ({
      id: tier.id,
      name: tier.name,
      systemId: tier.systemId,
      createdAt: tier.createdAt,
      updatedAt: tier.updatedAt,
    }));
  },

  /**
   * Create a new tier for a system
   */
  async createTier(
    systemId: string,
    input: CreateTierInput
  ): Promise<TierResponse> {
    // Verify system exists
    const exists = await systemsRepo.exists(systemId);
    if (!exists) {
      throw new ServiceError(
        `System with ID '${systemId}' not found`,
        'SYSTEM_NOT_FOUND',
        404
      );
    }

    // Check if tier name already exists for this system
    const existing = await systemsRepo.findTierByName(systemId, input.name);
    if (existing) {
      throw new ServiceError(
        `Tier '${input.name}' already exists for this system`,
        'TIER_NAME_EXISTS',
        400
      );
    }

    const tier = await systemsRepo.createTier(systemId, input);

    return {
      id: tier.id,
      name: tier.name,
      systemId: tier.systemId,
      createdAt: tier.createdAt,
      updatedAt: tier.updatedAt,
    };
  },

  // ===========================================
  // INSTANCE OPERATIONS
  // ===========================================

  /**
   * Get all instances for a system
   */
  async getInstancesBySystemId(systemId: string): Promise<InstanceResponse[]> {
    // Verify system exists
    const exists = await systemsRepo.exists(systemId);
    if (!exists) {
      throw new ServiceError(
        `System with ID '${systemId}' not found`,
        'SYSTEM_NOT_FOUND',
        404
      );
    }

    const instances = await systemsRepo.findInstancesBySystemId(systemId);
    return instances.map((instance) => ({
      id: instance.id,
      name: instance.name,
      systemId: instance.systemId,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
    }));
  },

  /**
   * Create a new instance for a system
   */
  async createInstance(
    systemId: string,
    input: CreateInstanceInput
  ): Promise<InstanceResponse> {
    // Verify system exists
    const exists = await systemsRepo.exists(systemId);
    if (!exists) {
      throw new ServiceError(
        `System with ID '${systemId}' not found`,
        'SYSTEM_NOT_FOUND',
        404
      );
    }

    // Check if instance name already exists for this system
    const existing = await systemsRepo.findInstanceByName(systemId, input.name);
    if (existing) {
      throw new ServiceError(
        `Instance '${input.name}' already exists for this system`,
        'INSTANCE_NAME_EXISTS',
        400
      );
    }

    const instance = await systemsRepo.createInstance(systemId, input);

    return {
      id: instance.id,
      name: instance.name,
      systemId: instance.systemId,
      createdAt: instance.createdAt,
      updatedAt: instance.updatedAt,
    };
  },

  // ===========================================
  // OWNER OPERATIONS
  // ===========================================

  /**
   * Get all owners for a system
   */
  async getOwnersBySystemId(systemId: string) {
    // Verify system exists
    const exists = await systemsRepo.exists(systemId);
    if (!exists) {
      throw new ServiceError(
        `System with ID '${systemId}' not found`,
        'SYSTEM_NOT_FOUND',
        404
      );
    }

    const owners = await systemsRepo.findOwnersBySystemId(systemId);
    return owners.map((owner) => ({
      userId: owner.userId,
      systemId: owner.systemId,
      user: owner.user,
    }));
  },

  /**
   * Add owners to a system
   */
  async addOwners(systemId: string, userIds: string[]) {
    // Verify system exists
    const exists = await systemsRepo.exists(systemId);
    if (!exists) {
      throw new ServiceError(
        `System with ID '${systemId}' not found`,
        'SYSTEM_NOT_FOUND',
        404
      );
    }

    // Verify all users exist
    for (const userId of userIds) {
      const userExists = await usersRepo.exists(userId);
      if (!userExists) {
        throw new ServiceError(
          `User with ID '${userId}' not found`,
          'USER_NOT_FOUND',
          400
        );
      }
    }

    const owners = await systemsRepo.addOwners(systemId, userIds);
    return owners.map((owner) => ({
      userId: owner.userId,
      systemId: owner.systemId,
      user: owner.user,
    }));
  },
};

export type SystemsService = typeof systemsService;
