import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bulkUploadService } from '@/server/services/bulkUploadService';
import { usersRepo } from '@/server/repositories/usersRepo';
import { systemsRepo } from '@/server/repositories/systemsRepo';
import { accessGrantsRepo } from '@/server/repositories/accessGrantsRepo';

// Mock repositories
vi.mock('@/server/repositories/usersRepo', () => ({
  usersRepo: {
    findByEmail: vi.fn(),
  },
}));

vi.mock('@/server/repositories/systemsRepo', () => ({
  systemsRepo: {
    findByName: vi.fn(),
    findTierByName: vi.fn(),
    findInstanceByName: vi.fn(),
  },
}));

vi.mock('@/server/repositories/accessGrantsRepo', () => ({
  accessGrantsRepo: {
    checkExistingActiveGrantsBatch: vi.fn(),
    createMany: vi.fn(),
  },
}));

// Mock data
const mockUser1 = { id: 'user-1', name: 'John Doe', email: 'john@example.com' };
const mockUser2 = { id: 'user-2', name: 'Jane Doe', email: 'jane@example.com' };
const mockSystem = { id: 'sys-1', name: 'GitHub' };
const mockSystem2 = { id: 'sys-2', name: 'AWS' };
const mockTierAdmin = { id: 'tier-admin', name: 'Admin' };
const mockTierViewer = { id: 'tier-viewer', name: 'Viewer' };
const mockTierEditor = { id: 'tier-editor', name: 'Editor' };
const mockInstanceProd = { id: 'inst-prod', name: 'Production' };
const mockInstanceStaging = { id: 'inst-staging', name: 'Staging' };

// Helper to setup mocks for valid scenario
function setupValidMocks() {
  vi.mocked(usersRepo.findByEmail).mockImplementation(async (email) => {
    if (email === 'john@example.com') return mockUser1;
    if (email === 'jane@example.com') return mockUser2;
    return null;
  });

  vi.mocked(systemsRepo.findByName).mockImplementation(async (name) => {
    if (name.toLowerCase() === 'github') return mockSystem;
    if (name.toLowerCase() === 'aws') return mockSystem2;
    return null;
  });

  vi.mocked(systemsRepo.findTierByName).mockImplementation(
    async (systemId, name) => {
      if (systemId === 'sys-1') {
        if (name.toLowerCase() === 'admin') return mockTierAdmin;
        if (name.toLowerCase() === 'viewer') return mockTierViewer;
      }
      if (systemId === 'sys-2') {
        if (name.toLowerCase() === 'editor') return mockTierEditor;
      }
      return null;
    }
  );

  vi.mocked(systemsRepo.findInstanceByName).mockImplementation(
    async (systemId, name) => {
      if (systemId === 'sys-1') {
        if (name.toLowerCase() === 'production') return mockInstanceProd;
      }
      if (systemId === 'sys-2') {
        if (name.toLowerCase() === 'staging') return mockInstanceStaging;
      }
      return null;
    }
  );

  vi.mocked(accessGrantsRepo.checkExistingActiveGrantsBatch).mockResolvedValue(
    []
  );
  vi.mocked(accessGrantsRepo.createMany).mockImplementation(async (grants) => {
    return grants.map((g, i) => ({
      id: `grant-${i}`,
      userId: g.userId,
      systemId: g.systemId,
      instanceId: g.instanceId,
      tierId: g.tierId,
      status: g.status,
      grantedBy: g.grantedBy,
      grantedAt: new Date(),
      removedAt: null,
      notes: g.notes,
      user: g.userId === 'user-1' ? mockUser1 : mockUser2,
      system: g.systemId === 'sys-1' ? mockSystem : mockSystem2,
      instance:
        g.instanceId === 'inst-prod'
          ? mockInstanceProd
          : g.instanceId === 'inst-staging'
            ? mockInstanceStaging
            : null,
      tier:
        g.tierId === 'tier-admin'
          ? mockTierAdmin
          : g.tierId === 'tier-viewer'
            ? mockTierViewer
            : mockTierEditor,
    }));
  });
}

describe('BulkUploadService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // VALID ROWS - HAPPY PATH
  // ===========================================

  describe('Valid rows - Happy path', () => {
    it('should process multiple valid rows successfully', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GitHub,Production,Admin,Initial admin access
jane@example.com,GitHub,Production,Viewer,Read-only access`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.summary.totalRows).toBe(2);
      expect(result.summary.validRows).toBe(2);
      expect(result.summary.errorRows).toBe(0);
      expect(result.summary.insertedCount).toBe(2);
      expect(result.createdGrants).toHaveLength(2);
      expect(accessGrantsRepo.createMany).toHaveBeenCalled();
    });

    it('should handle optional instance correctly', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GitHub,,Admin,No instance specified`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.validRows[0]?.resolvedData.instanceId).toBeNull();
    });

    it('should handle optional notes correctly', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GitHub,Production,Admin,`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.validRows[0]?.resolvedData.notes).toBeNull();
    });
  });

  // ===========================================
  // INVALID ROWS - ERROR HANDLING
  // ===========================================

  describe('Invalid rows - Error handling', () => {
    it('should reject unknown user email', async () => {
      setupValidMocks();
      vi.mocked(usersRepo.findByEmail).mockImplementation(async (email) => {
        if (email === 'unknown@example.com') return null;
        return mockUser1;
      });

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
unknown@example.com,GitHub,Production,Admin,Unknown user`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.errorRows).toHaveLength(1);
      expect(result.errorRows[0]?.errors).toContain(
        'Unknown user_email: unknown@example.com'
      );
      expect(accessGrantsRepo.createMany).not.toHaveBeenCalled();
    });

    it('should reject unknown system name', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,UnknownSystem,,Admin,Unknown system`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.errorRows).toHaveLength(1);
      expect(result.errorRows[0]?.errors).toContain(
        'Unknown system_name: UnknownSystem'
      );
    });

    it('should reject unknown tier for system', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GitHub,Production,UnknownTier,Unknown tier`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.errorRows).toHaveLength(1);
      expect(result.errorRows[0]?.errors[0]).toContain(
        'Unknown access_tier_name'
      );
    });

    it('should reject instance not belonging to system', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GitHub,WrongInstance,Admin,Wrong instance`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.errorRows).toHaveLength(1);
      expect(result.errorRows[0]?.errors[0]).toContain(
        'does not belong to system'
      );
    });

    it('should reject duplicate active grant (existing in DB)', async () => {
      setupValidMocks();
      vi.mocked(
        accessGrantsRepo.checkExistingActiveGrantsBatch
      ).mockResolvedValue([
        {
          userId: 'user-1',
          systemId: 'sys-1',
          tierId: 'tier-admin',
          instanceId: 'inst-prod',
        },
      ]);

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GitHub,Production,Admin,Already has access`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.errorRows).toHaveLength(1);
      expect(result.errorRows[0]?.errors[0]).toContain(
        'already has an active grant'
      );
    });

    it('should reject duplicate rows within same file', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GitHub,Production,Admin,First entry
john@example.com,GitHub,Production,Admin,Duplicate entry`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.errorRows).toHaveLength(1);
      expect(result.errorRows[0]?.errors[0]).toContain('Duplicate row');
    });

    it('should reject missing required fields', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
,GitHub,Production,Admin,No email
john@example.com,,Production,Admin,No system
john@example.com,GitHub,Production,,No tier`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.errorRows).toHaveLength(3);
    });
  });

  // ===========================================
  // MIXED VALID + INVALID ROWS
  // ===========================================

  describe('Mixed valid + invalid rows', () => {
    it('should not insert any rows when there are errors', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GitHub,Production,Admin,Valid row
unknown@example.com,GitHub,Production,Viewer,Invalid user`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.summary.validRows).toBe(1);
      expect(result.summary.errorRows).toBe(1);
      expect(result.summary.insertedCount).toBe(0);
      expect(accessGrantsRepo.createMany).not.toHaveBeenCalled();
    });

    it('should report all errors when multiple rows are invalid', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
unknown1@example.com,GitHub,,Admin,Unknown user 1
unknown2@example.com,GitHub,,Admin,Unknown user 2
john@example.com,UnknownSystem,,Admin,Unknown system`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.errorRows).toHaveLength(3);
      expect(result.summary.insertedCount).toBe(0);
    });
  });

  // ===========================================
  // JSON INPUT
  // ===========================================

  describe('JSON input', () => {
    it('should process JSON rows successfully', async () => {
      setupValidMocks();

      const rows = [
        {
          user_email: 'john@example.com',
          system_name: 'GitHub',
          instance_name: 'Production',
          access_tier_name: 'Admin',
          notes: 'JSON upload',
        },
      ];

      const result = await bulkUploadService.processJsonUpload(rows, 'admin-1');

      expect(result.success).toBe(true);
      expect(result.summary.insertedCount).toBe(1);
    });
  });

  // ===========================================
  // EDGE CASES
  // ===========================================

  describe('Edge cases', () => {
    it('should handle empty CSV', async () => {
      const result = await bulkUploadService.processCsvUpload('', 'admin-1');

      expect(result.success).toBe(false);
      expect(result.parseErrors).toContain('CSV file is empty');
    });

    it('should handle CSV with only headers', async () => {
      const csvContent =
        'user_email,system_name,instance_name,access_tier_name,notes';

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(false);
      expect(result.summary.totalRows).toBe(0);
    });

    it('should handle case-insensitive matching for system names', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GITHUB,PRODUCTION,ADMIN,Uppercase test`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(true);
    });

    it('should handle quoted values in CSV', async () => {
      setupValidMocks();

      const csvContent = `user_email,system_name,instance_name,access_tier_name,notes
john@example.com,GitHub,Production,Admin,"Notes with, comma inside"`;

      const result = await bulkUploadService.processCsvUpload(
        csvContent,
        'admin-1'
      );

      expect(result.success).toBe(true);
      expect(result.validRows[0]?.rowData.notes).toBe(
        'Notes with, comma inside'
      );
    });
  });
});

