import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/systems/route';
import { GET as GET_BY_ID, PATCH } from '@/app/api/systems/[id]/route';
import {
  GET as GET_TIERS,
  POST as POST_TIER,
} from '@/app/api/systems/[id]/tiers/route';
import {
  GET as GET_INSTANCES,
  POST as POST_INSTANCE,
} from '@/app/api/systems/[id]/instances/route';
import {
  GET as GET_OWNERS,
  POST as POST_OWNER,
} from '@/app/api/systems/[id]/owners/route';
import { prisma } from '@/server/db';

// Mock Prisma
vi.mock('@/server/db', () => ({
  prisma: {
    system: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    accessTier: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    instance: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    systemOwner: {
      findMany: vi.fn(),
      createMany: vi.fn(),
      count: vi.fn(),
    },
    user: {
      count: vi.fn(),
    },
  },
}));

// Helper to create NextRequest with auth headers
function createRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    asAdmin?: boolean;
    asOwner?: boolean;
  }
) {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  // Default to admin for write operations to pass auth checks in existing tests
  const headers: Record<string, string> = {
    ...(options?.body && { 'Content-Type': 'application/json' }),
    'x-user-id': options?.asOwner ? 'owner-1' : 'admin-1',
    'x-user-email':
      options?.asAdmin !== false ? 'admin@corolla.com' : 'owner@example.com',
  };

  return new NextRequest(fullUrl, {
    method: options?.method ?? 'GET',
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers,
  });
}

// Setup owner mock for write operations
function setupOwnerMock() {
  vi.mocked(prisma.systemOwner.count).mockResolvedValue(1);
}

describe('Systems API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // GET /api/systems
  // ===========================================

  describe('GET /api/systems', () => {
    it('should return systems with search filter', async () => {
      const mockSystems = [
        {
          id: 'sys-1',
          name: 'GitHub',
          description: 'Source control',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.system.findMany).mockResolvedValue(mockSystems as never);
      vi.mocked(prisma.system.count).mockResolvedValue(1);

      const request = createRequest('/api/systems?search=Git');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].name).toBe('GitHub');
    });

    it('should return systems with tiers included', async () => {
      const mockSystems = [
        {
          id: 'sys-1',
          name: 'GitHub',
          description: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          tiers: [{ id: 'tier-1', name: 'Admin' }],
        },
      ];

      vi.mocked(prisma.system.findMany).mockResolvedValue(mockSystems as never);
      vi.mocked(prisma.system.count).mockResolvedValue(1);

      const request = createRequest('/api/systems?includeTiers=true');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data[0].tiers).toBeDefined();
      expect(data.data[0].tiers).toHaveLength(1);
    });

    it('should return empty array when no systems match', async () => {
      vi.mocked(prisma.system.findMany).mockResolvedValue([]);
      vi.mocked(prisma.system.count).mockResolvedValue(0);

      const request = createRequest('/api/systems?search=nonexistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
    });
  });

  // ===========================================
  // POST /api/systems
  // ===========================================

  describe('POST /api/systems', () => {
    it('should create a new system successfully', async () => {
      const newSystem = {
        id: 'new-sys',
        name: 'New System',
        description: 'A description',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.system.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.system.create).mockResolvedValue(newSystem as never);

      const request = createRequest('/api/systems', {
        method: 'POST',
        body: { name: 'New System', description: 'A description' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('New System');
    });

    it('should reject duplicate system name', async () => {
      vi.mocked(prisma.system.findFirst).mockResolvedValue({
        id: 'existing',
        name: 'Existing System',
      } as never);

      const request = createRequest('/api/systems', {
        method: 'POST',
        body: { name: 'Existing System' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('SYSTEM_NAME_EXISTS');
    });

    it('should validate required name field', async () => {
      const request = createRequest('/api/systems', {
        method: 'POST',
        body: { description: 'No name provided' },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });
  });

  // ===========================================
  // GET /api/systems/[id]
  // ===========================================

  describe('GET /api/systems/[id]', () => {
    it('should return system by ID', async () => {
      const mockSystem = {
        id: 'sys-1',
        name: 'GitHub',
        description: 'Source control',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.system.findUnique).mockResolvedValue(
        mockSystem as never
      );

      const request = createRequest('/api/systems/sys-1');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('GitHub');
    });

    it('should return 404 for non-existent system', async () => {
      vi.mocked(prisma.system.findUnique).mockResolvedValue(null);

      const request = createRequest('/api/systems/nonexistent');
      const response = await GET_BY_ID(request, {
        params: Promise.resolve({ id: 'nonexistent' }),
      });
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('SYSTEM_NOT_FOUND');
    });
  });

  // ===========================================
  // PATCH /api/systems/[id]
  // ===========================================

  describe('PATCH /api/systems/[id]', () => {
    it('should update system successfully', async () => {
      const updatedSystem = {
        id: 'sys-1',
        name: 'Updated Name',
        description: 'Updated desc',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.system.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.system.update).mockResolvedValue(updatedSystem as never);

      const request = createRequest('/api/systems/sys-1', {
        method: 'PATCH',
        body: { name: 'Updated Name' },
      });

      const response = await PATCH(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Updated Name');
    });
  });

  // ===========================================
  // Tiers Endpoints
  // ===========================================

  describe('GET /api/systems/[id]/tiers', () => {
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

      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.accessTier.findMany).mockResolvedValue(
        mockTiers as never
      );

      const request = createRequest('/api/systems/sys-1/tiers');
      const response = await GET_TIERS(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
    });
  });

  describe('POST /api/systems/[id]/tiers', () => {
    it('should create a tier successfully', async () => {
      const newTier = {
        id: 'tier-new',
        name: 'Editor',
        systemId: 'sys-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.accessTier.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.accessTier.create).mockResolvedValue(newTier as never);

      const request = createRequest('/api/systems/sys-1/tiers', {
        method: 'POST',
        body: { name: 'Editor' },
      });

      const response = await POST_TIER(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Editor');
    });

    it('should reject duplicate tier name', async () => {
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.accessTier.findFirst).mockResolvedValue({
        id: 'existing',
        name: 'Admin',
      } as never);

      const request = createRequest('/api/systems/sys-1/tiers', {
        method: 'POST',
        body: { name: 'Admin' },
      });

      const response = await POST_TIER(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('TIER_NAME_EXISTS');
    });
  });

  // ===========================================
  // Instances Endpoints
  // ===========================================

  describe('GET /api/systems/[id]/instances', () => {
    it('should return instances for a system', async () => {
      const mockInstances = [
        {
          id: 'inst-1',
          name: 'Production',
          systemId: 'sys-1',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.instance.findMany).mockResolvedValue(
        mockInstances as never
      );

      const request = createRequest('/api/systems/sys-1/instances');
      const response = await GET_INSTANCES(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
    });
  });

  describe('POST /api/systems/[id]/instances', () => {
    it('should create an instance successfully', async () => {
      const newInstance = {
        id: 'inst-new',
        name: 'Staging',
        systemId: 'sys-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.instance.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.instance.create).mockResolvedValue(newInstance as never);

      const request = createRequest('/api/systems/sys-1/instances', {
        method: 'POST',
        body: { name: 'Staging' },
      });

      const response = await POST_INSTANCE(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('Staging');
    });

    it('should reject duplicate instance name', async () => {
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.instance.findFirst).mockResolvedValue({
        id: 'existing',
        name: 'Production',
      } as never);

      const request = createRequest('/api/systems/sys-1/instances', {
        method: 'POST',
        body: { name: 'Production' },
      });

      const response = await POST_INSTANCE(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('INSTANCE_NAME_EXISTS');
    });
  });

  // ===========================================
  // Owners Endpoints
  // ===========================================

  describe('GET /api/systems/[id]/owners', () => {
    it('should return owners for a system', async () => {
      const mockOwners = [
        {
          userId: 'user-1',
          systemId: 'sys-1',
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        },
      ];

      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.systemOwner.findMany).mockResolvedValue(
        mockOwners as never
      );

      const request = createRequest('/api/systems/sys-1/owners');
      const response = await GET_OWNERS(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].user.name).toBe('John Doe');
    });
  });

  describe('POST /api/systems/[id]/owners', () => {
    it('should add owners successfully', async () => {
      const mockOwners = [
        {
          userId: 'user-1',
          systemId: 'sys-1',
          user: { id: 'user-1', name: 'John Doe', email: 'john@example.com' },
        },
      ];

      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      vi.mocked(prisma.systemOwner.createMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.systemOwner.findMany).mockResolvedValue(
        mockOwners as never
      );

      const request = createRequest('/api/systems/sys-1/owners', {
        method: 'POST',
        body: { userIds: ['user-1'] },
      });

      const response = await POST_OWNER(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.data).toHaveLength(1);
    });

    it('should reject non-existent user', async () => {
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      const request = createRequest('/api/systems/sys-1/owners', {
        method: 'POST',
        body: { userIds: ['nonexistent'] },
      });

      const response = await POST_OWNER(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('USER_NOT_FOUND');
    });

    it('should validate userIds array', async () => {
      const request = createRequest('/api/systems/sys-1/owners', {
        method: 'POST',
        body: { userIds: [] },
      });

      const response = await POST_OWNER(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });
  });
});
