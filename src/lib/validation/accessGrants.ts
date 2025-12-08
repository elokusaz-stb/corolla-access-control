import { z } from 'zod';

// ===========================================
// Enums
// ===========================================

export const GrantStatusEnum = z.enum(['active', 'removed']);
export type GrantStatus = z.infer<typeof GrantStatusEnum>;

// ===========================================
// Query/Filter Schemas
// ===========================================

/**
 * Schema for GET /api/access-grants query parameters
 */
export const AccessGrantFiltersSchema = z.object({
  userId: z.string().optional(),
  systemId: z.string().optional(),
  instanceId: z.string().optional(),
  tierId: z.string().optional(),
  status: GrantStatusEnum.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type AccessGrantFilters = z.infer<typeof AccessGrantFiltersSchema>;

// ===========================================
// Create Schema
// ===========================================

/**
 * Schema for POST /api/access-grants request body
 */
export const CreateAccessGrantSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  systemId: z.string().min(1, 'System ID is required'),
  instanceId: z.string().optional().nullable(),
  tierId: z.string().min(1, 'Tier ID is required'),
  notes: z.string().max(1000).optional().nullable(),
});

export type CreateAccessGrantInput = z.infer<typeof CreateAccessGrantSchema>;

// ===========================================
// Update Schema
// ===========================================

/**
 * Schema for PATCH /api/access-grants/[id] request body
 * In Phase 1, only status changes are supported (active → removed)
 */
export const UpdateAccessGrantSchema = z.object({
  status: z.literal('removed', {
    errorMap: () => ({ message: "Status can only be changed to 'removed'" }),
  }),
  notes: z.string().max(1000).optional().nullable(),
});

export type UpdateAccessGrantInput = z.infer<typeof UpdateAccessGrantSchema>;

// ===========================================
// Response Schemas
// ===========================================

/**
 * Nested user in access grant response
 */
export const GrantUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string(),
});

/**
 * Nested system in access grant response
 */
export const GrantSystemSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * Nested instance in access grant response
 */
export const GrantInstanceSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * Nested tier in access grant response
 */
export const GrantTierSchema = z.object({
  id: z.string(),
  name: z.string(),
});

/**
 * Full access grant response
 */
export const AccessGrantResponseSchema = z.object({
  id: z.string(),
  userId: z.string(),
  systemId: z.string(),
  instanceId: z.string().nullable(),
  tierId: z.string(),
  status: GrantStatusEnum,
  grantedBy: z.string(),
  grantedAt: z.date(),
  removedAt: z.date().nullable(),
  notes: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  user: GrantUserSchema,
  system: GrantSystemSchema,
  instance: GrantInstanceSchema.nullable().optional(),
  tier: GrantTierSchema,
});

export type AccessGrantResponse = z.infer<typeof AccessGrantResponseSchema>;

/**
 * Paginated access grants list response
 */
export const AccessGrantListResponseSchema = z.object({
  data: z.array(AccessGrantResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type AccessGrantListResponse = z.infer<
  typeof AccessGrantListResponseSchema
>;
