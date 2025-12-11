import { describe, it, expect, vi, beforeEach } from 'vitest';
import { usersService, ServiceError } from '@/server/services/usersService';
import { usersRepo } from '@/server/repositories/usersRepo';

// Mock the repository
vi.mock('@/server/repositories/usersRepo', () => ({
  usersRepo: {
    findMany: vi.fn(),
    findById: vi.fn(),
    findByEmail: vi.fn(),
    create: vi.fn(),
    exists: vi.fn(),
  },
}));

describe('UsersService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('searchUsers', () => {
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

      vi.mocked(usersRepo.findMany).mockResolvedValue({
        users: mockUsers,
        total: 2,
      });

      const result = await usersService.searchUsers({
        search: 'Doe',
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(2);
      expect(result.data[0]?.name).toBe('John Doe');
      expect(result.total).toBe(2);
      expect(usersRepo.findMany).toHaveBeenCalledWith({
        search: 'Doe',
        limit: 20,
        offset: 0,
      });
    });

    it('should return empty array when no users match search', async () => {
      vi.mocked(usersRepo.findMany).mockResolvedValue({
        users: [],
        total: 0,
      });

      const result = await usersService.searchUsers({
        search: 'nonexistent',
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should filter users by managerId', async () => {
      const mockUsers = [
        {
          id: '2',
          name: 'Jane Doe',
          email: 'jane@example.com',
          managerId: '1',
        },
      ];

      vi.mocked(usersRepo.findMany).mockResolvedValue({
        users: mockUsers,
        total: 1,
      });

      const result = await usersService.searchUsers({
        managerId: '1',
        limit: 20,
        offset: 0,
      });

      expect(result.data).toHaveLength(1);
      expect(result.data[0]?.managerId).toBe('1');
      expect(usersRepo.findMany).toHaveBeenCalledWith({
        managerId: '1',
        limit: 20,
        offset: 0,
      });
    });

    it('should respect pagination parameters', async () => {
      vi.mocked(usersRepo.findMany).mockResolvedValue({
        users: [],
        total: 100,
      });

      const result = await usersService.searchUsers({
        limit: 10,
        offset: 50,
      });

      expect(result.limit).toBe(10);
      expect(result.offset).toBe(50);
      expect(usersRepo.findMany).toHaveBeenCalledWith({
        limit: 10,
        offset: 50,
      });
    });
  });

  describe('createUser', () => {
    it('should create a new user successfully', async () => {
      const mockCreatedUser = {
        id: 'new-user-id',
        name: 'New User',
        email: 'new@example.com',
        managerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(usersRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(usersRepo.create).mockResolvedValue(mockCreatedUser);

      const result = await usersService.createUser({
        name: 'New User',
        email: 'new@example.com',
      });

      expect(result.id).toBe('new-user-id');
      expect(result.name).toBe('New User');
      expect(result.email).toBe('new@example.com');
      expect(usersRepo.create).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
      });
    });

    it('should prevent duplicate email creation', async () => {
      vi.mocked(usersRepo.findByEmail).mockResolvedValue({
        id: 'existing-id',
        name: 'Existing User',
        email: 'existing@example.com',
        managerId: null,
      });

      await expect(
        usersService.createUser({
          name: 'New User',
          email: 'existing@example.com',
        })
      ).rejects.toThrow(ServiceError);

      await expect(
        usersService.createUser({
          name: 'New User',
          email: 'existing@example.com',
        })
      ).rejects.toMatchObject({
        code: 'EMAIL_EXISTS',
        statusCode: 400,
      });

      expect(usersRepo.create).not.toHaveBeenCalled();
    });

    it('should accept creation with valid managerId', async () => {
      const mockCreatedUser = {
        id: 'new-user-id',
        name: 'New User',
        email: 'new@example.com',
        managerId: 'manager-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(usersRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(usersRepo.exists).mockResolvedValue(true);
      vi.mocked(usersRepo.create).mockResolvedValue(mockCreatedUser);

      const result = await usersService.createUser({
        name: 'New User',
        email: 'new@example.com',
        managerId: 'manager-id',
      });

      expect(result.managerId).toBe('manager-id');
      expect(usersRepo.exists).toHaveBeenCalledWith('manager-id');
      expect(usersRepo.create).toHaveBeenCalledWith({
        name: 'New User',
        email: 'new@example.com',
        managerId: 'manager-id',
      });
    });

    it('should reject creation if manager does not exist', async () => {
      vi.mocked(usersRepo.findByEmail).mockResolvedValue(null);
      vi.mocked(usersRepo.exists).mockResolvedValue(false);

      await expect(
        usersService.createUser({
          name: 'New User',
          email: 'new@example.com',
          managerId: 'nonexistent-manager',
        })
      ).rejects.toThrow(ServiceError);

      await expect(
        usersService.createUser({
          name: 'New User',
          email: 'new@example.com',
          managerId: 'nonexistent-manager',
        })
      ).rejects.toMatchObject({
        code: 'MANAGER_NOT_FOUND',
        statusCode: 400,
      });

      expect(usersRepo.create).not.toHaveBeenCalled();
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 'user-id',
        name: 'Test User',
        email: 'test@example.com',
        managerId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      vi.mocked(usersRepo.findById).mockResolvedValue(mockUser);

      const result = await usersService.getUserById('user-id');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('user-id');
      expect(result?.name).toBe('Test User');
    });

    it('should return null when user not found', async () => {
      vi.mocked(usersRepo.findById).mockResolvedValue(null);

      const result = await usersService.getUserById('nonexistent-id');

      expect(result).toBeNull();
    });
  });
});

