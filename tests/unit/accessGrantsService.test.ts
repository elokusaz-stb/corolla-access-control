import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  accessGrantsService,
  AuthorizationError,
} from '@/server/services/accessGrantsService';
import { accessGrantsRepo } from '@/server/repositories/accessGrantsRepo';
import { ServiceError } from '@/server/services/usersService';

// Mock repository
vi.mock('@/server/repositories/accessGrantsRepo', () => ({
  accessGrantsRepo: {
    findMany: vi.fn(),
    findById: vi.fn(),
    checkExistingActiveGrant: vi.fn(),
    create: vi.fn(),
    updateStatus: vi.fn(),
    getSystemOwners: vi.fn(),
    tierBelongsToSystem: vi.fn(),
    instanceBelongsToSystem: vi.fn(),
    userExists: vi.fn(),
    systemExists: vi.fn(),
    tierExists: vi.fn(),
  },
}));

// Mock grant data
const mockGrant = {
  id: 'grant-1',
  userId: 'user-1',
  systemId: 'sys-1',
  instanceId: null,
  tierId: 'tier-1',
  status: 'active' as const,
  grantedBy: 'admin-1',
  grantedAt: new Date(),
  removedAt: null,
  notes: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
  system: { id: 'sys-1', name: 'GitHub' },
  instance: null,
  tier: { id: 'tier-1', name: 'Admin' },
};

describe('AccessGrantsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // LIST ACCESS GRANTS
  // ===========================================

  describe('listAccessGrants', () => {
    it('should return filtered access grants', async () => {
      vi.mocked(accessGrantsRepo.findMany).mockResolvedValue({
        grants: [mockGrant],
        total: 1,
      });

      const result = await accessGrantsService.listAccessGrants({
        status: 'active',
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.data[0]?.user.name).toBe('John Doe');
    });

    it('should return empty array when no grants match', async () => {
      vi.mocked(accessGrantsRepo.findMany).mockResolvedValue({
        grants: [],
        total: 0,
      });

      const result = await accessGrantsService.listAccessGrants({
        userId: 'nonexistent',
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });
  });

  // ===========================================
  // CREATE ACCESS GRANT
  // ===========================================

  describe('createAccessGrant', () => {
    it('should create grant successfully (happy path)', async () => {
      vi.mocked(accessGrantsRepo.userExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.systemExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierBelongsToSystem).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.checkExistingActiveGrant).mockResolvedValue(
        false
      );
      vi.mocked(accessGrantsRepo.create).mockResolvedValue(mockGrant);

      const result = await accessGrantsService.createAccessGrant(
        {
          userId: 'user-1',
          systemId: 'sys-1',
          tierId: 'tier-1',
        },
        'admin-1'
      );

      expect(result.id).toBe('grant-1');
      expect(result.status).toBe('active');
      expect(accessGrantsRepo.create).toHaveBeenCalled();
    });

    it('should reject when tier does not belong to system', async () => {
      vi.mocked(accessGrantsRepo.userExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.systemExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierBelongsToSystem).mockResolvedValue(false);

      await expect(
        accessGrantsService.createAccessGrant(
          {
            userId: 'user-1',
            systemId: 'sys-1',
            tierId: 'wrong-tier',
          },
          'admin-1'
        )
      ).rejects.toMatchObject({
        code: 'TIER_SYSTEM_MISMATCH',
        statusCode: 400,
      });
    });

    it('should reject when instance does not belong to system', async () => {
      vi.mocked(accessGrantsRepo.userExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.systemExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierBelongsToSystem).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.instanceBelongsToSystem).mockResolvedValue(
        false
      );

      await expect(
        accessGrantsService.createAccessGrant(
          {
            userId: 'user-1',
            systemId: 'sys-1',
            tierId: 'tier-1',
            instanceId: 'wrong-instance',
          },
          'admin-1'
        )
      ).rejects.toMatchObject({
        code: 'INSTANCE_SYSTEM_MISMATCH',
        statusCode: 400,
      });
    });

    it('should prevent duplicate active grants', async () => {
      vi.mocked(accessGrantsRepo.userExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.systemExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierBelongsToSystem).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.checkExistingActiveGrant).mockResolvedValue(
        true
      );

      await expect(
        accessGrantsService.createAccessGrant(
          {
            userId: 'user-1',
            systemId: 'sys-1',
            tierId: 'tier-1',
          },
          'admin-1'
        )
      ).rejects.toMatchObject({
        code: 'DUPLICATE_ACTIVE_GRANT',
        statusCode: 400,
      });

      expect(accessGrantsRepo.create).not.toHaveBeenCalled();
    });

    it('should allow creation when previous grant is removed', async () => {
      vi.mocked(accessGrantsRepo.userExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.systemExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierBelongsToSystem).mockResolvedValue(true);
      // No active grant exists (previous was removed)
      vi.mocked(accessGrantsRepo.checkExistingActiveGrant).mockResolvedValue(
        false
      );
      vi.mocked(accessGrantsRepo.create).mockResolvedValue(mockGrant);

      const result = await accessGrantsService.createAccessGrant(
        {
          userId: 'user-1',
          systemId: 'sys-1',
          tierId: 'tier-1',
        },
        'admin-1'
      );

      expect(result.id).toBe('grant-1');
      expect(accessGrantsRepo.create).toHaveBeenCalled();
    });

    it('should reject when user does not exist', async () => {
      vi.mocked(accessGrantsRepo.userExists).mockResolvedValue(false);

      await expect(
        accessGrantsService.createAccessGrant(
          {
            userId: 'nonexistent',
            systemId: 'sys-1',
            tierId: 'tier-1',
          },
          'admin-1'
        )
      ).rejects.toMatchObject({
        code: 'USER_NOT_FOUND',
      });
    });

    it('should reject when system does not exist', async () => {
      vi.mocked(accessGrantsRepo.userExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.systemExists).mockResolvedValue(false);

      await expect(
        accessGrantsService.createAccessGrant(
          {
            userId: 'user-1',
            systemId: 'nonexistent',
            tierId: 'tier-1',
          },
          'admin-1'
        )
      ).rejects.toMatchObject({
        code: 'SYSTEM_NOT_FOUND',
      });
    });

    it('should reject when tier does not exist', async () => {
      vi.mocked(accessGrantsRepo.userExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.systemExists).mockResolvedValue(true);
      vi.mocked(accessGrantsRepo.tierExists).mockResolvedValue(false);

      await expect(
        accessGrantsService.createAccessGrant(
          {
            userId: 'user-1',
            systemId: 'sys-1',
            tierId: 'nonexistent',
          },
          'admin-1'
        )
      ).rejects.toMatchObject({
        code: 'TIER_NOT_FOUND',
      });
    });
  });

  // ===========================================
  // UPDATE ACCESS GRANT STATUS
  // ===========================================

  describe('updateAccessGrantStatus', () => {
    it('should transition status from active to removed', async () => {
      const removedGrant = {
        ...mockGrant,
        status: 'removed' as const,
        removedAt: new Date(),
      };

      vi.mocked(accessGrantsRepo.findById).mockResolvedValue(mockGrant);
      vi.mocked(accessGrantsRepo.getSystemOwners).mockResolvedValue([
        'owner-1',
      ]);
      vi.mocked(accessGrantsRepo.updateStatus).mockResolvedValue(removedGrant);

      const result = await accessGrantsService.updateAccessGrantStatus(
        'grant-1',
        { status: 'removed' },
        'owner-1'
      );

      expect(result.status).toBe('removed');
      expect(result.removedAt).toBeDefined();
      expect(accessGrantsRepo.updateStatus).toHaveBeenCalledWith(
        'grant-1',
        'removed',
        null,
        expect.any(Date)
      );
    });

    it('should reject removal by non-system-owner', async () => {
      vi.mocked(accessGrantsRepo.findById).mockResolvedValue(mockGrant);
      vi.mocked(accessGrantsRepo.getSystemOwners).mockResolvedValue([
        'owner-1',
        'owner-2',
      ]);

      await expect(
        accessGrantsService.updateAccessGrantStatus(
          'grant-1',
          { status: 'removed' },
          'non-owner'
        )
      ).rejects.toThrow(AuthorizationError);

      await expect(
        accessGrantsService.updateAccessGrantStatus(
          'grant-1',
          { status: 'removed' },
          'non-owner'
        )
      ).rejects.toMatchObject({
        code: 'NOT_SYSTEM_OWNER',
        status: 403,
      });
    });

    it('should reject if grant is already removed', async () => {
      const removedGrant = {
        ...mockGrant,
        status: 'removed' as const,
        removedAt: new Date(),
      };

      vi.mocked(accessGrantsRepo.findById).mockResolvedValue(removedGrant);
      vi.mocked(accessGrantsRepo.getSystemOwners).mockResolvedValue([
        'owner-1',
      ]);

      await expect(
        accessGrantsService.updateAccessGrantStatus(
          'grant-1',
          { status: 'removed' },
          'owner-1'
        )
      ).rejects.toMatchObject({
        code: 'GRANT_ALREADY_REMOVED',
        statusCode: 400,
      });
    });

    it('should reject if grant does not exist', async () => {
      vi.mocked(accessGrantsRepo.findById).mockResolvedValue(null);

      await expect(
        accessGrantsService.updateAccessGrantStatus(
          'nonexistent',
          { status: 'removed' },
          'owner-1'
        )
      ).rejects.toMatchObject({
        code: 'GRANT_NOT_FOUND',
        statusCode: 404,
      });
    });

    it('should preserve notes when updating with new notes', async () => {
      const removedGrant = {
        ...mockGrant,
        status: 'removed' as const,
        removedAt: new Date(),
        notes: 'Access revoked due to role change',
      };

      vi.mocked(accessGrantsRepo.findById).mockResolvedValue(mockGrant);
      vi.mocked(accessGrantsRepo.getSystemOwners).mockResolvedValue([
        'owner-1',
      ]);
      vi.mocked(accessGrantsRepo.updateStatus).mockResolvedValue(removedGrant);

      const result = await accessGrantsService.updateAccessGrantStatus(
        'grant-1',
        { status: 'removed', notes: 'Access revoked due to role change' },
        'owner-1'
      );

      expect(result.notes).toBe('Access revoked due to role change');
    });
  });

  // ===========================================
  // IS SYSTEM OWNER
  // ===========================================

  describe('isSystemOwner', () => {
    it('should return true when user is system owner', async () => {
      vi.mocked(accessGrantsRepo.getSystemOwners).mockResolvedValue([
        'owner-1',
        'owner-2',
      ]);

      const result = await accessGrantsService.isSystemOwner(
        'owner-1',
        'sys-1'
      );

      expect(result).toBe(true);
    });

    it('should return false when user is not system owner', async () => {
      vi.mocked(accessGrantsRepo.getSystemOwners).mockResolvedValue([
        'owner-1',
        'owner-2',
      ]);

      const result = await accessGrantsService.isSystemOwner(
        'non-owner',
        'sys-1'
      );

      expect(result).toBe(false);
    });
  });
});
