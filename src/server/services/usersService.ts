import { usersRepo } from '@/server/repositories/usersRepo';
import type {
  UserSearchParams,
  CreateUserInput,
  UserListResponse,
  UserResponse,
} from '@/lib/validation/users';

/**
 * Custom error class for service-level errors
 */
export class ServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ServiceError';
  }
}

/**
 * Users Service
 * Handles business logic for user operations.
 * Validates business rules and delegates to repository for data access.
 */
export const usersService = {
  /**
   * Search and list users with pagination
   * @param params - Search parameters including filters and pagination
   * @returns Paginated list of users
   */
  async searchUsers(params: UserSearchParams): Promise<UserListResponse> {
    const { users, total } = await usersRepo.findMany(params);

    return {
      data: users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        managerId: user.managerId,
        // Include grant count if available
        ...('_count' in user && { _count: user._count }),
      })),
      total,
      limit: params.limit,
      offset: params.offset,
    };
  },

  /**
   * Create a new user
   * @param input - User creation data
   * @returns Created user
   * @throws ServiceError if email already exists or manager doesn't exist
   */
  async createUser(input: CreateUserInput): Promise<UserResponse> {
    // Check if email already exists
    const existingUser = await usersRepo.findByEmail(input.email);
    if (existingUser) {
      throw new ServiceError(
        `User with email '${input.email}' already exists`,
        'EMAIL_EXISTS',
        400
      );
    }

    // If managerId provided, verify manager exists
    if (input.managerId) {
      const managerExists = await usersRepo.exists(input.managerId);
      if (!managerExists) {
        throw new ServiceError(
          `Manager with ID '${input.managerId}' not found`,
          'MANAGER_NOT_FOUND',
          400
        );
      }
    }

    // Create the user
    const user = await usersRepo.create(input);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      managerId: user.managerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },

  /**
   * Get a user by ID
   * @param id - User ID
   * @returns User or null if not found
   */
  async getUserById(id: string): Promise<UserResponse | null> {
    const user = await usersRepo.findById(id);
    if (!user) {
      return null;
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      managerId: user.managerId,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
};

export type UsersService = typeof usersService;
