import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/users/route';
import { prisma } from '@/server/db';

// Mock Prisma
vi.mock('@/server/db', () => ({
  prisma: {
    user: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      count: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

// Helper to create NextRequest
function createRequest(
  url: string,
  options?: { method?: string; body?: unknown }
) {
  const baseUrl = 'http://localhost:3000';
  const fullUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  return new NextRequest(fullUrl, {
    method: options?.method ?? 'GET',
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
  });
}

describe('Users API Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/users', () => {
    it('should return users matching search query', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          managerId: null,
        },
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          managerId: '1',
        },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as never);
      vi.mocked(prisma.user.count).mockResolvedValue(2);

      const request = createRequest('/api/users?search=Doe');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(2);
      expect(data.total).toBe(2);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { name: { contains: 'Doe', mode: 'insensitive' } },
              { email: { contains: 'Doe', mode: 'insensitive' } },
            ],
          },
        })
      );
    });

    it('should return empty array when no users match', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      const request = createRequest('/api/users?search=nonexistent');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(0);
      expect(data.total).toBe(0);
    });

    it('should use default pagination when not provided', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      const request = createRequest('/api/users');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limit).toBe(20);
      expect(data.offset).toBe(0);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 20,
          skip: 0,
        })
      );
    });

    it('should validate pagination parameters', async () => {
      vi.mocked(prisma.user.findMany).mockResolvedValue([]);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      const request = createRequest('/api/users?limit=50&offset=100');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.limit).toBe(50);
      expect(data.offset).toBe(100);
    });

    it('should reject invalid limit parameter', async () => {
      const request = createRequest('/api/users?limit=500');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });

    it('should filter by managerId', async () => {
      const mockUsers = [
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          managerId: 'mgr-1',
        },
      ];

      vi.mocked(prisma.user.findMany).mockResolvedValue(mockUsers as never);
      vi.mocked(prisma.user.count).mockResolvedValue(1);

      const request = createRequest('/api/users?managerId=mgr-1');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(prisma.user.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            managerId: 'mgr-1',
          }),
        })
      );
    });
  });

  describe('POST /api/users', () => {
    it('should create a new user successfully', async () => {
      const newUser = {
        id: 'new-user-id',
        name: 'New User',
        email: 'new@example.com',
        managerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(newUser as never);

      const request = createRequest('/api/users', {
        method: 'POST',
        body: {
          name: 'New User',
          email: 'new@example.com',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBe('new-user-id');
      expect(data.name).toBe('New User');
      expect(data.email).toBe('new@example.com');
    });

    it('should reject duplicate email addresses', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        id: 'existing-id',
        name: 'Existing User',
        email: 'existing@example.com',
        managerId: null,
      } as never);

      const request = createRequest('/api/users', {
        method: 'POST',
        body: {
          name: 'New User',
          email: 'existing@example.com',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('EMAIL_EXISTS');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should validate required fields', async () => {
      const request = createRequest('/api/users', {
        method: 'POST',
        body: {
          name: 'New User',
          // missing email
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });

    it('should validate email format', async () => {
      const request = createRequest('/api/users', {
        method: 'POST',
        body: {
          name: 'New User',
          email: 'invalid-email',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });

    it('should create user with valid managerId', async () => {
      const newUser = {
        id: 'new-user-id',
        name: 'New User',
        email: 'new@example.com',
        managerId: 'manager-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // First call is for email check, returns null
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      // Count check for manager existence
      vi.mocked(prisma.user.count).mockResolvedValue(1);
      vi.mocked(prisma.user.create).mockResolvedValue(newUser as never);

      const request = createRequest('/api/users', {
        method: 'POST',
        body: {
          name: 'New User',
          email: 'new@example.com',
          managerId: 'manager-id',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.managerId).toBe('manager-id');
    });

    it('should reject non-existent managerId', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.count).mockResolvedValue(0);

      const request = createRequest('/api/users', {
        method: 'POST',
        body: {
          name: 'New User',
          email: 'new@example.com',
          managerId: 'nonexistent-manager',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('MANAGER_NOT_FOUND');
      expect(prisma.user.create).not.toHaveBeenCalled();
    });

    it('should reject empty name', async () => {
      const request = createRequest('/api/users', {
        method: 'POST',
        body: {
          name: '',
          email: 'test@example.com',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('VALIDATION_ERROR');
    });
  });
});
