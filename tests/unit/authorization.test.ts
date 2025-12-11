import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  isSystemOwner,
  isAdminEmail,
  isAdminOrSystemOwner,
} from '@/server/authz/authorization';
import {
  assertSystemOwner,
  assertAdmin,
  assertAdminOrSystemOwner,
  assertCanCreateSystem,
} from '@/server/authz/assertions';
import { AuthorizationError } from '@/server/authz/errors';
import { prisma } from '@/server/db';

// Mock Prisma
vi.mock('@/server/db', () => ({
  prisma: {
    systemOwner: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
    },
  },
}));

describe('Authorization Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // isAdminEmail
  // ===========================================

  describe('isAdminEmail', () => {
    it('should return true for admin email', () => {
      expect(isAdminEmail('admin@corolla.com')).toBe(true);
      expect(isAdminEmail('admin@example.com')).toBe(true);
    });

    it('should return false for non-admin email', () => {
      expect(isAdminEmail('user@example.com')).toBe(false);
      expect(isAdminEmail('random@corolla.com')).toBe(false);
    });

    it('should be case-insensitive', () => {
      expect(isAdminEmail('ADMIN@COROLLA.COM')).toBe(true);
      expect(isAdminEmail('Admin@Example.com')).toBe(true);
    });
  });

  // ===========================================
  // isSystemOwner
  // ===========================================

  describe('isSystemOwner', () => {
    it('should return true when user is a system owner', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(1);

      const result = await isSystemOwner('user-1', 'sys-1');

      expect(result).toBe(true);
      expect(prisma.systemOwner.count).toHaveBeenCalledWith({
        where: { userId: 'user-1', systemId: 'sys-1' },
      });
    });

    it('should return false when user is not a system owner', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(0);

      const result = await isSystemOwner('user-1', 'sys-1');

      expect(result).toBe(false);
    });
  });

  // ===========================================
  // isAdminOrSystemOwner
  // ===========================================

  describe('isAdminOrSystemOwner', () => {
    it('should return true if user is admin', async () => {
      // Don't even need to check ownership if admin
      const result = await isAdminOrSystemOwner(
        'user-1',
        'admin@corolla.com',
        'sys-1'
      );

      expect(result).toBe(true);
      expect(prisma.systemOwner.count).not.toHaveBeenCalled();
    });

    it('should return true if user is system owner but not admin', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(1);

      const result = await isAdminOrSystemOwner(
        'user-1',
        'user@example.com',
        'sys-1'
      );

      expect(result).toBe(true);
      expect(prisma.systemOwner.count).toHaveBeenCalled();
    });

    it('should return false if user is neither admin nor owner', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(0);

      const result = await isAdminOrSystemOwner(
        'user-1',
        'user@example.com',
        'sys-1'
      );

      expect(result).toBe(false);
    });
  });

  // ===========================================
  // Assertion Helpers
  // ===========================================

  describe('assertSystemOwner', () => {
    it('should not throw when user is system owner', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(1);

      await expect(assertSystemOwner('user-1', 'sys-1')).resolves.not.toThrow();
    });

    it('should throw AuthorizationError when user is not system owner', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(0);

      await expect(assertSystemOwner('user-1', 'sys-1')).rejects.toThrow(
        AuthorizationError
      );
      await expect(assertSystemOwner('user-1', 'sys-1')).rejects.toMatchObject({
        code: 'NOT_SYSTEM_OWNER',
        status: 403,
      });
    });
  });

  describe('assertAdmin', () => {
    it('should not throw for admin email', () => {
      expect(() => assertAdmin('admin@corolla.com')).not.toThrow();
    });

    it('should throw AuthorizationError for non-admin email', () => {
      expect(() => assertAdmin('user@example.com')).toThrow(AuthorizationError);
    });

    it('should have NOT_ADMIN code', () => {
      try {
        assertAdmin('user@example.com');
        expect.fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(AuthorizationError);
        expect((error as AuthorizationError).code).toBe('NOT_ADMIN');
      }
    });
  });

  describe('assertAdminOrSystemOwner', () => {
    it('should not throw for admin', async () => {
      await expect(
        assertAdminOrSystemOwner('user-1', 'admin@corolla.com', 'sys-1')
      ).resolves.not.toThrow();
    });

    it('should not throw for system owner', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(1);

      await expect(
        assertAdminOrSystemOwner('user-1', 'user@example.com', 'sys-1')
      ).resolves.not.toThrow();
    });

    it('should throw for non-admin non-owner', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(0);

      await expect(
        assertAdminOrSystemOwner('user-1', 'user@example.com', 'sys-1')
      ).rejects.toThrow(AuthorizationError);
    });
  });

  describe('assertCanCreateSystem', () => {
    it('should not throw for admin', () => {
      expect(() => assertCanCreateSystem('admin@corolla.com')).not.toThrow();
    });

    it('should throw for non-admin', () => {
      expect(() => assertCanCreateSystem('user@example.com')).toThrow(
        AuthorizationError
      );
    });
  });
});

