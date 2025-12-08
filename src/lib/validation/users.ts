import { z } from 'zod';

// ===========================================
// Query/Input Schemas
// ===========================================

/**
 * Schema for GET /api/users query parameters
 * Supports search, filtering by manager, and pagination
 */
export const UserSearchSchema = z.object({
  search: z.string().optional(),
  managerId: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type UserSearchParams = z.infer<typeof UserSearchSchema>;

/**
 * Schema for POST /api/users request body
 * Creates a new user with optional manager assignment
 */
export const CreateUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  email: z.string().email('Invalid email format'),
  managerId: z.string().optional().nullable(),
});

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// ===========================================
// Response Schemas
// ===========================================

/**
 * Schema for a single user in API responses
 */
export const UserResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
  managerId: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

/**
 * Schema for paginated user list response
 */
export const UserListResponseSchema = z.object({
  data: z.array(UserResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type UserListResponse = z.infer<typeof UserListResponseSchema>;

// ===========================================
// Error Schemas
// ===========================================

/**
 * Standard API error response
 */
export const ApiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  details: z.unknown().optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;
