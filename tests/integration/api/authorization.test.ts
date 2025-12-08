import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST as POST_SYSTEM } from '@/app/api/systems/route';
import { PATCH as PATCH_SYSTEM } from '@/app/api/systems/[id]/route';
import { POST as POST_TIER } from '@/app/api/systems/[id]/tiers/route';
import { POST as POST_INSTANCE } from '@/app/api/systems/[id]/instances/route';
import { POST as POST_OWNER } from '@/app/api/systems/[id]/owners/route';
import { PATCH as PATCH_GRANT } from '@/app/api/access-grants/[id]/route';
import { prisma } from '@/server/db';

// Mock Prisma
vi.mock('@/server/db', () => ({
  prisma: {
    system: {
      findFirst: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      count: vi.fn(),
    },
    systemOwner: {
      count: vi.fn(),
      findMany: vi.fn(),
      createMany: vi.fn(),
    },
    accessTier: {
      findFirst: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
    },
    instance: {
      findFirst: vi.fn(),
      create: vi.fn(),
    },
    accessGrant: {
      findUnique: vi.fn(),
      update: vi.fn(),
    },
    user: {
      findUnique: vi.fn(),
      count: vi.fn(),
    },
  },
}));

// Mock Supabase (to avoid actual auth calls)
vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated'),
      }),
    },
  })),
}));

// Helper to create request with user headers
function createRequest(
  url: string,
  options?: {
    method?: string;
    body?: unknown;
    userId?: string;
    userEmail?: string;
  }
) {
  const headers: Record<string, string> = {
    ...(options?.body && { 'Content-Type': 'application/json' }),
    ...(options?.userId && { 'x-user-id': options.userId }),
    ...(options?.userEmail && { 'x-user-email': options.userEmail }),
  };

  return new NextRequest(`http://localhost:3000${url}`, {
    method: options?.method ?? 'GET',
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers,
  });
}

describe('Authorization Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ===========================================
  // POST /api/systems - Create System
  // ===========================================

  describe('POST /api/systems (Create System)', () => {
    it('should allow admin to create system', async () => {
      vi.mocked(prisma.system.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.system.create).mockResolvedValue({
        id: 'sys-new',
        name: 'New System',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const request = createRequest('/api/systems', {
        method: 'POST',
        body: { name: 'New System' },
        userId: 'admin-1',
        userEmail: 'admin@corolla.com', // Admin email
      });

      const response = await POST_SYSTEM(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.name).toBe('New System');
    });

    it('should reject non-admin creating system', async () => {
      const request = createRequest('/api/systems', {
        method: 'POST',
        body: { name: 'New System' },
        userId: 'user-1',
        userEmail: 'user@example.com', // Not admin
      });

      const response = await POST_SYSTEM(request);
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('NOT_ADMIN');
    });
  });

  // ===========================================
  // PATCH /api/systems/[id] - Update System
  // ===========================================

  describe('PATCH /api/systems/[id] (Update System)', () => {
    it('should allow system owner to update', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(1); // Is owner
      vi.mocked(prisma.system.count).mockResolvedValue(1); // System exists
      vi.mocked(prisma.system.findFirst).mockResolvedValue(null); // No name conflict
      vi.mocked(prisma.system.update).mockResolvedValue({
        id: 'sys-1',
        name: 'Updated Name',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const request = createRequest('/api/systems/sys-1', {
        method: 'PATCH',
        body: { name: 'Updated Name' },
        userId: 'owner-1',
        userEmail: 'owner@example.com',
      });

      const response = await PATCH_SYSTEM(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.name).toBe('Updated Name');
    });

    it('should allow admin to update any system', async () => {
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.system.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.system.update).mockResolvedValue({
        id: 'sys-1',
        name: 'Admin Updated',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const request = createRequest('/api/systems/sys-1', {
        method: 'PATCH',
        body: { name: 'Admin Updated' },
        userId: 'admin-1',
        userEmail: 'admin@corolla.com', // Admin
      });

      const response = await PATCH_SYSTEM(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });

      expect(response.status).toBe(200);
      // Should not have checked ownership since admin
      expect(prisma.systemOwner.count).not.toHaveBeenCalled();
    });

    it('should reject non-owner updating system', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(0); // Not owner

      const request = createRequest('/api/systems/sys-1', {
        method: 'PATCH',
        body: { name: 'Unauthorized Update' },
        userId: 'user-1',
        userEmail: 'user@example.com',
      });

      const response = await PATCH_SYSTEM(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('NOT_ADMIN_OR_OWNER');
    });
  });

  // ===========================================
  // POST /api/systems/[id]/tiers - Create Tier
  // ===========================================

  describe('POST /api/systems/[id]/tiers (Create Tier)', () => {
    it('should allow system owner to create tier', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(1);
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.accessTier.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.accessTier.create).mockResolvedValue({
        id: 'tier-new',
        name: 'New Tier',
        systemId: 'sys-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const request = createRequest('/api/systems/sys-1/tiers', {
        method: 'POST',
        body: { name: 'New Tier' },
        userId: 'owner-1',
        userEmail: 'owner@example.com',
      });

      const response = await POST_TIER(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });

      expect(response.status).toBe(201);
    });

    it('should reject non-owner creating tier', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(0);

      const request = createRequest('/api/systems/sys-1/tiers', {
        method: 'POST',
        body: { name: 'Unauthorized Tier' },
        userId: 'user-1',
        userEmail: 'user@example.com',
      });

      const response = await POST_TIER(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('NOT_ADMIN_OR_OWNER');
    });
  });

  // ===========================================
  // POST /api/systems/[id]/instances - Create Instance
  // ===========================================

  describe('POST /api/systems/[id]/instances (Create Instance)', () => {
    it('should allow system owner to create instance', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(1);
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.instance.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.instance.create).mockResolvedValue({
        id: 'inst-new',
        name: 'Production',
        systemId: 'sys-1',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as never);

      const request = createRequest('/api/systems/sys-1/instances', {
        method: 'POST',
        body: { name: 'Production' },
        userId: 'owner-1',
        userEmail: 'owner@example.com',
      });

      const response = await POST_INSTANCE(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });

      expect(response.status).toBe(201);
    });

    it('should reject non-owner creating instance', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(0);

      const request = createRequest('/api/systems/sys-1/instances', {
        method: 'POST',
        body: { name: 'Unauthorized Instance' },
        userId: 'user-1',
        userEmail: 'user@example.com',
      });

      const response = await POST_INSTANCE(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
    });
  });

  // ===========================================
  // POST /api/systems/[id]/owners - Add Owners
  // ===========================================

  describe('POST /api/systems/[id]/owners (Add Owners)', () => {
    it('should allow existing owner to add new owners', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(1); // Is owner
      vi.mocked(prisma.system.count).mockResolvedValue(1);
      vi.mocked(prisma.user.count).mockResolvedValue(1); // New user exists
      vi.mocked(prisma.systemOwner.createMany).mockResolvedValue({ count: 1 });
      vi.mocked(prisma.systemOwner.findMany).mockResolvedValue([
        {
          userId: 'owner-1',
          systemId: 'sys-1',
          user: { id: 'owner-1', name: 'Owner', email: 'owner@example.com' },
        },
        {
          userId: 'user-2',
          systemId: 'sys-1',
          user: { id: 'user-2', name: 'New Owner', email: 'new@example.com' },
        },
      ] as never);

      const request = createRequest('/api/systems/sys-1/owners', {
        method: 'POST',
        body: { userIds: ['user-2'] },
        userId: 'owner-1',
        userEmail: 'owner@example.com',
      });

      const response = await POST_OWNER(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });

      expect(response.status).toBe(201);
    });

    it('should reject non-owner adding owners', async () => {
      vi.mocked(prisma.systemOwner.count).mockResolvedValue(0);

      const request = createRequest('/api/systems/sys-1/owners', {
        method: 'POST',
        body: { userIds: ['user-2'] },
        userId: 'user-1',
        userEmail: 'user@example.com',
      });

      const response = await POST_OWNER(request, {
        params: Promise.resolve({ id: 'sys-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
    });
  });

  // ===========================================
  // PATCH /api/access-grants/[id] - Remove Grant
  // ===========================================

  describe('PATCH /api/access-grants/[id] (Remove Grant)', () => {
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
      user: { id: 'user-1', name: 'User', email: 'user@example.com' },
      system: { id: 'sys-1', name: 'GitHub' },
      instance: null,
      tier: { id: 'tier-1', name: 'Admin' },
    };

    it('should allow system owner to remove grant', async () => {
      vi.mocked(prisma.accessGrant.findUnique).mockResolvedValue(
        mockGrant as never
      );
      vi.mocked(prisma.systemOwner.findMany).mockResolvedValue([
        { userId: 'owner-1' },
      ] as never);
      vi.mocked(prisma.accessGrant.update).mockResolvedValue({
        ...mockGrant,
        status: 'removed',
        removedAt: new Date(),
      } as never);

      const request = createRequest('/api/access-grants/grant-1', {
        method: 'PATCH',
        body: { status: 'removed' },
        userId: 'owner-1',
        userEmail: 'owner@example.com',
      });

      const response = await PATCH_GRANT(request, {
        params: Promise.resolve({ id: 'grant-1' }),
      });

      expect(response.status).toBe(200);
    });

    it('should reject non-owner removing grant', async () => {
      vi.mocked(prisma.accessGrant.findUnique).mockResolvedValue(
        mockGrant as never
      );
      vi.mocked(prisma.systemOwner.findMany).mockResolvedValue([
        { userId: 'owner-1' }, // Different owner
      ] as never);

      const request = createRequest('/api/access-grants/grant-1', {
        method: 'PATCH',
        body: { status: 'removed' },
        userId: 'non-owner',
        userEmail: 'nonowner@example.com',
      });

      const response = await PATCH_GRANT(request, {
        params: Promise.resolve({ id: 'grant-1' }),
      });
      const data = await response.json();

      expect(response.status).toBe(403);
      expect(data.error).toBe('NOT_SYSTEM_OWNER');
    });
  });
});
