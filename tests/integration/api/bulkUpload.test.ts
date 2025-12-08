import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/access-grants/bulk/route';
import { prisma } from '@/server/db';

// Mock Prisma
vi.mock('@/server/db', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    system: {
      findFirst: vi.fn(),
    },
    accessTier: {
      findFirst: vi.fn(),
    },
    instance: {
      findFirst: vi.fn(),
    },
    accessGrant: {
      findMany: vi.fn(),
      create: vi.fn(),
    },
    $transaction: vi.fn(),
  },
}));

// Mock data
const mockUser1 = {
  id: 'user-1',
  name: 'John Doe',
  email: 'john@example.com',
  managerId: null,
};
const mockUser2 = {
  id: 'user-2',
  name: 'Jane Doe',
  email: 'jane@example.com',
  managerId: null,
};
const mockSystem = { id: 'sys-1', name: 'GitHub' };
const mockTierAdmin = { id: 'tier-admin', name: 'Admin' };
const mockTierViewer = { id: 'tier-viewer', name: 'Viewer' };
const mockInstanceProd = { id: 'inst-prod', name: 'Production' };

// Setup mocks
function setupMocks() {
  vi.mocked(prisma.user.findUnique).mockImplementation(async ({ where }) => {
    if (where.email === 'john@example.com') return mockUser1 as never;
    if (where.email === 'jane@example.com') return mockUser2 as never;
    return null;
  });

  vi.mocked(prisma.system.findFirst).mockImplementation(async ({ where }) => {
    const name =
      typeof where?.name === 'object' ? where.name.equals : where?.name;
    if (name?.toLowerCase() === 'github') return mockSystem as never;
    return null;
  });

  vi.mocked(prisma.accessTier.findFirst).mockImplementation(
    async ({ where }) => {
      const name =
        typeof where?.name === 'object' ? where.name.equals : where?.name;
      if (where?.systemId === 'sys-1') {
        if (name?.toLowerCase() === 'admin') return mockTierAdmin as never;
        if (name?.toLowerCase() === 'viewer') return mockTierViewer as never;
      }
      return null;
    }
  );

  vi.mocked(prisma.instance.findFirst).mockImplementation(async ({ where }) => {
    const name =
      typeof where?.name === 'object' ? where.name.equals : where?.name;
    if (where?.systemId === 'sys-1' && name?.toLowerCase() === 'production') {
      return mockInstanceProd as never;
    }
    return null;
  });

  vi.mocked(prisma.accessGrant.findMany).mockResolvedValue([]);

  vi.mocked(prisma.$transaction).mockImplementation(async (fn) => {
    const mockTx = {
      accessGrant: {
        create: vi.fn().mockImplementation(async ({ data }) => ({
          id: `grant-${Date.now()}`,
          ...data,
          grantedAt: new Date(),
          removedAt: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: data.userId === 'user-1' ? mockUser1 : mockUser2,
          system: mockSystem,
          instance: data.instanceId === 'inst-prod' ? mockInstanceProd : null,
          tier: data.tierId === 'tier-admin' ? mockTierAdmin : mockTierViewer,
        })),
      },
    };
    return fn(mockTx as never);
  });
}

// Note: FormData testing is complex in Vitest/Node environment
// We test CSV parsing via JSON with raw CSV content and the service directly

// Helper to create JSON request
function createJsonRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/access-grants/bulk', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'admin-1',
    },
  });
}

describe('Bulk Upload API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setupMocks();
  });

  // ===========================================
  // GET /api/access-grants/bulk (Template)
  // ===========================================

  describe('GET /api/access-grants/bulk', () => {
    it('should return CSV template', async () => {
      const response = await GET();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('text/csv');
      expect(response.headers.get('Content-Disposition')).toContain(
        'access_grants_template.csv'
      );

      const content = await response.text();
      expect(content).toContain('user_email');
      expect(content).toContain('system_name');
      expect(content).toContain('access_tier_name');
    });
  });

  // ===========================================
  // POST with JSON - Valid rows
  // ===========================================

  describe('POST /api/access-grants/bulk (JSON)', () => {
    it('should process valid JSON rows successfully', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'john@example.com',
            system_name: 'GitHub',
            instance_name: 'Production',
            access_tier_name: 'Admin',
            notes: 'Test access',
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.summary.insertedCount).toBe(1);
      expect(data.createdGrants).toHaveLength(1);
    });

    it('should reject invalid JSON structure', async () => {
      const request = createJsonRequest({
        invalid: 'structure',
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });

    it('should return errors for invalid rows without inserting', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'unknown@example.com',
            system_name: 'GitHub',
            access_tier_name: 'Admin',
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200); // 200 with errors, not 400
      expect(data.success).toBe(false);
      expect(data.errorRows).toHaveLength(1);
      expect(data.summary.insertedCount).toBe(0);
    });
  });

  // ===========================================
  // Additional JSON tests (covering CSV-like scenarios)
  // ===========================================

  describe('POST /api/access-grants/bulk (Additional scenarios)', () => {
    it('should handle multiple valid rows', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'john@example.com',
            system_name: 'GitHub',
            instance_name: 'Production',
            access_tier_name: 'Admin',
            notes: 'Test access 1',
          },
          {
            user_email: 'jane@example.com',
            system_name: 'GitHub',
            instance_name: 'Production',
            access_tier_name: 'Viewer',
            notes: 'Test access 2',
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.summary.insertedCount).toBe(2);
    });

    it('should handle rows without optional instance', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'john@example.com',
            system_name: 'GitHub',
            access_tier_name: 'Admin',
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
    });

    it('should handle mixed valid and invalid rows', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'john@example.com',
            system_name: 'GitHub',
            access_tier_name: 'Admin',
          },
          {
            user_email: 'unknown@example.com',
            system_name: 'GitHub',
            access_tier_name: 'Viewer',
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.summary.validRows).toBe(1);
      expect(data.summary.errorRows).toBe(1);
      expect(data.summary.insertedCount).toBe(0);
    });

    it('should handle duplicate rows in same request', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'john@example.com',
            system_name: 'GitHub',
            instance_name: 'Production',
            access_tier_name: 'Admin',
          },
          {
            user_email: 'john@example.com',
            system_name: 'GitHub',
            instance_name: 'Production',
            access_tier_name: 'Admin',
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.errorRows).toHaveLength(1);
      expect(data.errorRows[0].errors[0]).toContain('Duplicate row');
    });
  });

  // ===========================================
  // Error Response Structure
  // ===========================================

  describe('Error response structure', () => {
    it('should return proper error structure with row details', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'unknown@example.com',
            system_name: 'UnknownSystem',
            access_tier_name: 'Admin',
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.success).toBe(false);
      expect(data.errorRows[0]).toMatchObject({
        rowNumber: expect.any(Number),
        rowData: expect.objectContaining({
          user_email: 'unknown@example.com',
        }),
        errors: expect.arrayContaining([expect.any(String)]),
      });
    });

    it('should include summary in all responses', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'john@example.com',
            system_name: 'GitHub',
            access_tier_name: 'Admin',
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.summary).toMatchObject({
        totalRows: expect.any(Number),
        validRows: expect.any(Number),
        errorRows: expect.any(Number),
        insertedCount: expect.any(Number),
      });
    });
  });

  // ===========================================
  // DB Insert Verification
  // ===========================================

  describe('Database insert verification', () => {
    it('should call $transaction for batch insert', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'john@example.com',
            system_name: 'GitHub',
            instance_name: 'Production',
            access_tier_name: 'Admin',
          },
          {
            user_email: 'jane@example.com',
            system_name: 'GitHub',
            instance_name: 'Production',
            access_tier_name: 'Viewer',
          },
        ],
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.success).toBe(true);
      expect(data.summary.insertedCount).toBe(2);
      expect(prisma.$transaction).toHaveBeenCalled();
    });

    it('should NOT call $transaction when there are errors', async () => {
      const request = createJsonRequest({
        rows: [
          {
            user_email: 'unknown@example.com',
            system_name: 'GitHub',
            access_tier_name: 'Admin',
          },
        ],
      });

      await POST(request);

      expect(prisma.$transaction).not.toHaveBeenCalled();
    });
  });
});
