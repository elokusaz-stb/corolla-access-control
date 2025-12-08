import { prisma } from '@/server/db';
import type { UserSearchParams, CreateUserInput } from '@/lib/validation/users';

/**
 * Users Repository
 * Handles all Prisma database operations for users.
 * No business logic - only data access.
 */
export const usersRepo = {
  /**
   * Find users with optional search, filtering, and pagination
   */
  async findMany(params: UserSearchParams) {
    const { search, managerId, limit, offset } = params;

    const where: Parameters<typeof prisma.user.findMany>[0]['where'] = {};

    // Search by name or email (case-insensitive partial match)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by manager
    if (managerId) {
      where.managerId = managerId;
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          managerId: true,
          _count: {
            select: {
              grants: {
                where: { status: 'active' },
              },
            },
          },
        },
        orderBy: { name: 'asc' },
        take: limit,
        skip: offset,
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total };
  },

  /**
   * Find a user by ID
   */
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Find a user by email
   */
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        managerId: true,
      },
    });
  },

  /**
   * Create a new user
   */
  async create(data: CreateUserInput) {
    return prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        managerId: data.managerId ?? null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        managerId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  },

  /**
   * Check if a user exists by ID
   */
  async exists(id: string) {
    const count = await prisma.user.count({
      where: { id },
    });
    return count > 0;
  },
};

export type UsersRepo = typeof usersRepo;
