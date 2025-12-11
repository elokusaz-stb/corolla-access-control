import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/access-grants/route';
import { GET as GET_BY_ID, PATCH } from '@/app/api/access-grants/[id]/route';
import { prisma } from '@/server/db';

// Mock Prisma
vi.mock('@/server/db', () => ({
  prisma: {
    accessGrant: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    accessTier: {
      count: vi.fn(),
    },
    instance: {
      count: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
    system: {
      count: vi.fn(),
    },
    systemOwner: {
      findMany: vi.fn(),
    },
  },
}));

// Helper to create NextRequest
function createRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    headers?: Record<string, string>;
  }
) {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  const headers: Record<string, string> = {
    ...(options?.body && { 'Content-Type': 'application/json' }),
    ...options?.headers,
  };

  return new NextRequest(fullUrl, {
    method: options?.method ?? 'GET',
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers,
  });
}

// Mock grant data
const mockGrant = {
  id: 'grant-1',
  userId: 'user-1',
  systemId: 'sys-1',
  instanceId: null,
  tierId: 'tier-1',
  status: 'active',
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

describe('Access Grants API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // GET /api/access-grants
  // ===========================================

  describe('GET /api/access-grants', () => {
    it('should return filtered access grants', async () => {
      vi.mocked(prisma.accessGrant.findMany).mockResolvedValue([
        mockGrant,
      ] as never);
      vi.mocked(prisma.accessGrant.count).mockResolvedValue(1);

      const request = createRequest('/api/access-grants?status=active');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].user.name).toBe('John Doe');
      expect(data.total).toBe(1);
    });

    it('should filter by userId', async () => {
      vi.mocked(prisma.accessGrant.findMany).mockResolvedValue([
        mockGrant,
      ] as never);
      vi.mocked(prisma.accessGrant.count).mockResolvedValue(1);

      const request = createRequest('/api/access-grants?userId=user-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(prisma.accessGrant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ userId: 'user-1' }),
        })
      );
    });

    it('should filter by systemId', async () => {
      vi.mocked(prisma.accessGrant.findMany).mockResolvedValue([
        mockGrant,
      ] as never);
      vi.mocked(prisma.accessGrant.count).mockResolvedValue(1);

      const request = createRequest('/api/access-grants?systemId=sys-1');
      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(prisma.accessGrant.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ systemId: 'sys-1' }),
        })
      );
    });

    it('should search by user name or email', async () => {
      vi.mocked(prisma.accessGrant.findMany).mockResolvedValue([
        mockGrant,
      ] as never);
      vi.mocked(prisma.accessGrant.count).mockResolvedValue(1);

      const request = createRequest('/api/access-grants?search=john');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
    });

    it('should return empty array when no grants match', async () => {
      vi.mocked(prisma.accessGrant.findMany).mockResolvedValue([]);
      vi.mocked(prisma.accessGrant.count).mockResolvedValue(0);

      const request = createRequest('/api/access-grants?userId=nonexistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
      expect(data.total).toBe(0);
    });

    it('should validate status parameter', async () => {
      const request = createRequest('/api/access-grants?status=invalid');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });
  });

  // ===========================================
  // POST /api/access-grants
  // ===========================================

  describe('POST /api/access-grants', () => {
    it('should create a valid grant', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.accessTier.count)
        .mockResolvedValueOnce(1) // tierExists
        .mockResolvedValueOnce(1); // tierBelongsToSystem
      vi.mocked(prisma.accessGrant.count).mockResolvedValue(0); // no existing grant
      vi.mocked(prisma.accessGrant.create).mockResolvedValue(
        mockGrant as never
      );

      const request = createRequest('/api/access-grants', {
        method: 'POST',
        body: {
          userId: 'user-1',
          systemId: 'sys-1',
          tierId: 'tier-1',
        },
        headers: { 'x-user-id': 'admin-1' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('grant-1');
      expect(data.status).toBe('active');
    });

    it('should reject duplicate active grants', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.accessTier.count)
        .mockResolvedValueOnce(1) // tierExists
        .mockResolvedValueOnce(1); // tierBelongsToSystem
      vi.mocked(prisma.accessGrant.count).mockResolvedValue(1); // existing active grant

      const request = createRequest('/api/access-grants', {
        method: 'POST',
        body: {
          userId: 'user-1',
          systemId: 'sys-1',
          tierId: 'tier-1',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('DUPLICATE_ACTIVE_GRANT');
    });

    it('should reject when tier does not belong to system', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.accessTier.count)
        .mockResolvedValueOnce(1) // tierExists
        .mockResolvedValueOnce(0); // tierBelongsToSystem - false

      const request = createRequest('/api/access-grants', {
        method: 'POST',
        body: {
          userId: 'user-1',
          systemId: 'sys-1',
          tierId: 'wrong-tier',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('TIER_SYSTEM_MISMATCH');
    });

    it('should reject when instance does not belong to system', async () => {
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.accessTier.count)
        .mockResolvedValueOnce(1) // tierExists
        .mockResolvedValueOnce(1); // tierBelongsToSystem
      vi.mocked(prisma.instance.count).mockResolvedValue(0); // instanceBelongsToSystem - false

      const request = createRequest('/api/access-grants', {
        method: 'POST',
        body: {
          userId: 'user-1',
          systemId: 'sys-1',
          tierId: 'tier-1',
          instanceId: 'wrong-instance',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('INSTANCE_SYSTEM_MISMATCH');
    });

    it('should validate required fields', async () => {
      const request = createRequest('/api/access-grants', {
        method: 'POST',
        body: {
          userId: 'user-1',
          // missing systemId and tierId
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });
  });

  // ===========================================
  // GET /api/access-grants/[id]
  // ===========================================

  describe('GET /api/access-grants/[id]', () => {
    it('should return grant by ID', async () => {
      vi.mocked(prisma.accessGrant.findUnique).mockResolvedValue(
        mockGrant as never
      );

      const request = createRequest('/api/access-grants/grant-1');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: 'grant-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe('grant-1');
    });

    it('should return 404 for non-existent grant', async () => {
      vi.mocked(prisma.accessGrant.findUnique).mockResolvedValue(null);

      const request = createRequest('/api/access-grants/nonexistent');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('GRANT_NOT_FOUND');
    });
  });

  // ===========================================
  // PATCH /api/access-grants/[id]
  // ===========================================

  describe('PATCH /api/access-grants/[id]', () => {
    it('should remove an active grant (authorized user)', async () => {
      const removedGrant = {
        ...mockGrant,
        status: 'removed',
        removedAt: new Date(),
      };

      vi.mocked(prisma.accessGrant.findUnique).mockResolvedValue(
        mockGrant as never
      );
      vi.mocked(prisma.systemOwner.findMany).mockResolvedValue([
        { userId: 'owner-1' },
      ] as never);
      vi.mocked(prisma.accessGrant.update).mockResolvedValue(
        removedGrant as never
      );

      const request = createRequest('/api/access-grants/grant-1', {
        method: 'PATCH',
        body: { status: 'removed' },
        headers: { 'x-user-id': 'owner-1' },
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'grant-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('removed');
    });

    it('should reject unauthorized users (non-system-owner)', async () => {
      vi.mocked(prisma.accessGrant.findUnique).mockResolvedValue(
        mockGrant as never
      );
      vi.mocked(prisma.systemOwner.findMany).mockResolvedValue([
        { userId: 'owner-1' },
      ] as never);

      const request = createRequest('/api/access-grants/grant-1', {
        method: 'PATCH',
        body: { status: 'removed' },
        headers: { 'x-user-id': 'non-owner' },
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'grant-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('NOT_SYSTEM_OWNER');
    });

    it('should reject if grant is already removed', async () => {
      const removedGrant = {
        ...mockGrant,
        status: 'removed',
        removedAt: new Date(),
      };

      vi.mocked(prisma.accessGrant.findUnique).mockResolvedValue(
        removedGrant as never
      );
      vi.mocked(prisma.systemOwner.findMany).mockResolvedValue([
        { userId: 'owner-1' },
      ] as never);

      const request = createRequest('/api/access-grants/grant-1', {
        method: 'PATCH',
        body: { status: 'removed' },
        headers: { 'x-user-id': 'owner-1' },
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'grant-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('GRANT_ALREADY_REMOVED');
    });

    it('should reject invalid status value', async () => {
      const request = createRequest('/api/access-grants/grant-1', {
        method: 'PATCH',
        body: { status: 'active' }, // Can only change to 'removed'
        headers: { 'x-user-id': 'owner-1' },
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'grant-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent grant', async () => {
      vi.mocked(prisma.accessGrant.findUnique).mockResolvedValue(null);

      const request = createRequest('/api/access-grants/nonexistent', {
        method: 'PATCH',
        body: { status: 'removed' },
        headers: { 'x-user-id': 'owner-1' },
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('GRANT_NOT_FOUND');
    });

    it('should accept notes when removing grant', async () => {
      const removedGrant = {
        ...mockGrant,
        status: 'removed',
        removedAt: new Date(),
        notes: 'Access revoked due to role change',
      };

      vi.mocked(prisma.accessGrant.findUnique).mockResolvedValue(
        mockGrant as never
      );
      vi.mocked(prisma.systemOwner.findMany).mockResolvedValue([
        { userId: 'owner-1' },
      ] as never);
      vi.mocked(prisma.accessGrant.update).mockResolvedValue(
        removedGrant as never
      );

      const request = createRequest('/api/access-grants/grant-1', {
        method: 'PATCH',
        body: { status: 'removed', notes: 'Access revoked due to role change' },
        headers: { 'x-user-id': 'owner-1' },
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'grant-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.notes).toBe('Access revoked due to role change');
    });
  });
});

