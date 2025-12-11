import { describe, it, expect, vi, beforeEach } from 'vitest';
import { systemsService } from '@/server/services/systemsService';
import { systemsRepo } from '@/server/repositories/systemsRepo';
import { usersRepo } from '@/server/repositories/usersRepo';
import { ServiceError } from '@/server/services/usersService';

// Mock repositories
vi.mock('@/server/repositories/systemsRepo', () => ({
  systemsRepo: {
    findMany: vi.fn(),
    findById: vi.fn(),
    findByName: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    exists: vi.fn(),
    findTiersBySystemId: vi.fn(),
    findTierByName: vi.fn(),
    createTier: vi.fn(),
    findInstancesBySystemId: vi.fn(),
    findInstanceByName: vi.fn(),
    createInstance: vi.fn(),
    findOwnersBySystemId: vi.fn(),
    isOwner: vi.fn(),
    addOwners: vi.fn(),
  },
}));

vi.mock('@/server/repositories/usersRepo', () => ({
  usersRepo: {
    exists: vi.fn(),
  },
}));

describe('SystemsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // SYSTEM OPERATIONS
  // ===========================================

  describe('searchSystems', () => {
    it('should return systems matching search query', async () => {
      const mockSystems = [
        {
          id: 'sys-1',
          name: 'GitHub',
          description: 'Source control',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'sys-2',
          name: 'GitLab',
          description: 'CI/CD',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(systemsRepo.findMany).mockResolvedValue({
        systems: mockSystems,
        total: 2,
      });

      const result = await systemsService.searchSystems({
        search: 'Git',
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
      expect(systemsRepo.findMany).toHaveBeenCalledWith({
        search: 'Git',
        limit: 20,
        offset: 0,
      });
    });

    it('should return empty array when no systems match', async () => {
      vi.mocked(systemsRepo.findMany).mockResolvedValue({
        systems: [],
        total: 0,
      });

      const result = await systemsService.searchSystems({
        search: 'nonexistent',
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  describe('createSystem', () => {
    it('should create a new system successfully', async () => {
      const mockSystem = {
        id: 'new-sys',
        name: 'New System',
        description: 'A new system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(systemsRepo.findByName).mockResolvedValue(null);
      vi.mocked(systemsRepo.create).mockResolvedValue(mockSystem);

      const result = await systemsService.createSystem({
        name: 'New System',
        description: 'A new system',
      });

      expect(result.id).toBe('new-sys');
      expect(result.name).toBe('New System');
      expect(systemsRepo.create).toHaveBeenCalled();
    });

    it('should reject duplicate system name', async () => {
      vi.mocked(systemsRepo.findByName).mockResolvedValue({
        id: 'existing',
        name: 'Existing System',
      });

      await expect(
        systemsService.createSystem({ name: 'Existing System' })
      ).rejects.toThrow(ServiceError);

      await expect(
        systemsService.createSystem({ name: 'Existing System' })
      ).rejects.toMatchObject({
        code: 'SYSTEM_NAME_EXISTS',
        statusCode: 400,
      });
    });
  });

  describe('updateSystem', () => {
    it('should update system name successfully', async () => {
      const mockUpdated = {
        id: 'sys-1',
        name: 'Updated Name',
        description: 'Original desc',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.findByName).mockResolvedValue(null);
      vi.mocked(systemsRepo.update).mockResolvedValue(mockUpdated);

      const result = await systemsService.updateSystem('sys-1', {
        name: 'Updated Name',
      });

      expect(result.name).toBe('Updated Name');
    });

    it('should update system description successfully', async () => {
      const mockUpdated = {
        id: 'sys-1',
        name: 'System',
        description: 'New description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.update).mockResolvedValue(mockUpdated);

      const result = await systemsService.updateSystem('sys-1', {
        description: 'New description',
      });

      expect(result.description).toBe('New description');
    });

    it('should reject update for non-existent system', async () => {
      vi.mocked(systemsRepo.exists).mockResolvedValue(false);

      await expect(
        systemsService.updateSystem('nonexistent', { name: 'New Name' })
      ).rejects.toMatchObject({
        code: 'SYSTEM_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should reject duplicate name on update', async () => {
      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.findByName).mockResolvedValue({
        id: 'other-sys',
        name: 'Taken Name',
      });

      await expect(
        systemsService.updateSystem('sys-1', { name: 'Taken Name' })
      ).rejects.toMatchObject({
        code: 'SYSTEM_NAME_EXISTS',
        statusCode: 400,
      });
    });
  });

  // ===========================================
  // TIER OPERATIONS
  // ===========================================

  describe('getTiersBySystemId', () => {
    it('should return tiers for a system', async () => {
      const mockTiers = [
        {
          id: 'tier-1',
          name: 'Admin',
          systemId: 'sys-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'tier-2',
          name: 'Viewer',
          systemId: 'sys-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.findTiersBySystemId).mockResolvedValue(mockTiers);

      const result = await systemsService.getTiersBySystemId('sys-1');

      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe('Admin');
    });

    it('should throw error for non-existent system', async () => {
      vi.mocked(systemsRepo.exists).mockResolvedValue(false);

      await expect(
        systemsService.getTiersBySystemId('nonexistent')
      ).rejects.toMatchObject({
        code: 'SYSTEM_NOT_FOUND',
      });
    });
  });

  describe('createTier', () => {
    it('should create a tier successfully', async () => {
      const mockTier = {
        id: 'tier-new',
        name: 'Editor',
        systemId: 'sys-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.findTierByName).mockResolvedValue(null);
      vi.mocked(systemsRepo.createTier).mockResolvedValue(mockTier);

      const result = await systemsService.createTier('sys-1', {
        name: 'Editor',
      });

      expect(result.name).toBe('Editor');
      expect(result.systemId).toBe('sys-1');
    });

    it('should enforce tier name uniqueness within system', async () => {
      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.findTierByName).mockResolvedValue({
        id: 'existing',
        name: 'Admin',
      });

      await expect(
        systemsService.createTier('sys-1', { name: 'Admin' })
      ).rejects.toMatchObject({
        code: 'TIER_NAME_EXISTS',
        statusCode: 400,
      });
    });
  });

  // ===========================================
  // INSTANCE OPERATIONS
  // ===========================================

  describe('getInstancesBySystemId', () => {
    it('should return instances for a system', async () => {
      const mockInstances = [
        {
          id: 'inst-1',
          name: 'Production',
          systemId: 'sys-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'inst-2',
          name: 'Staging',
          systemId: 'sys-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.findInstancesBySystemId).mockResolvedValue(
        mockInstances
      );

      const result = await systemsService.getInstancesBySystemId('sys-1');

      expect(result).toHaveLength(2);
      expect(result[0]?.name).toBe('Production');
    });
  });

  describe('createInstance', () => {
    it('should create an instance successfully', async () => {
      const mockInstance = {
        id: 'inst-new',
        name: 'Development',
        systemId: 'sys-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.findInstanceByName).mockResolvedValue(null);
      vi.mocked(systemsRepo.createInstance).mockResolvedValue(mockInstance);

      const result = await systemsService.createInstance('sys-1', {
        name: 'Development',
      });

      expect(result.name).toBe('Development');
      expect(result.systemId).toBe('sys-1');
    });

    it('should enforce instance name uniqueness within system', async () => {
      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.findInstanceByName).mockResolvedValue({
        id: 'existing',
        name: 'Production',
      });

      await expect(
        systemsService.createInstance('sys-1', { name: 'Production' })
      ).rejects.toMatchObject({
        code: 'INSTANCE_NAME_EXISTS',
        statusCode: 400,
      });
    });
  });

  // ===========================================
  // OWNER OPERATIONS
  // ===========================================

  describe('getOwnersBySystemId', () => {
    it('should return owners for a system', async () => {
      const mockOwners = [
        {
          userId: 'user-1',
          systemId: 'sys-1',
          user: { id: 'user-1', name: 'John', email: 'john@example.com' },
        },
      ];

      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.findOwnersBySystemId).mockResolvedValue(mockOwners);

      const result = await systemsService.getOwnersBySystemId('sys-1');

      expect(result).toHaveLength(1);
      expect(result[0]?.user.name).toBe('John');
    });
  });

  describe('addOwners', () => {
    it('should add owners to a system successfully', async () => {
      const mockOwners = [
        {
          userId: 'user-1',
          systemId: 'sys-1',
          user: { id: 'user-1', name: 'John', email: 'john@example.com' },
        },
        {
          userId: 'user-2',
          systemId: 'sys-1',
          user: { id: 'user-2', name: 'Jane', email: 'jane@example.com' },
        },
      ];

      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(usersRepo.exists).mockResolvedValue(true);
      vi.mocked(systemsRepo.addOwners).mockResolvedValue(mockOwners);

      const result = await systemsService.addOwners('sys-1', [
        'user-1',
        'user-2',
      ]);

      expect(result).toHaveLength(2);
      expect(systemsRepo.addOwners).toHaveBeenCalledWith('sys-1', [
        'user-1',
        'user-2',
      ]);
    });

    it('should reject if user does not exist', async () => {
      vi.mocked(systemsRepo.exists).mockResolvedValue(true);
      vi.mocked(usersRepo.exists).mockResolvedValue(false);

      await expect(
        systemsService.addOwners('sys-1', ['nonexistent-user'])
      ).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
        statusCode: 400,
      });
    });

    it('should reject if system does not exist', async () => {
      vi.mocked(systemsRepo.exists).mockResolvedValue(false);

      await expect(
        systemsService.addOwners('nonexistent', ['user-1'])
      ).rejects.toMatchObject({
        code: 'SYSTEM_NOT_FOUND',
        statusCode: 404,
      });
    });
  });
});

