import { z } from 'zod';

// ===========================================
// System Schemas
// ===========================================

/**
 * Schema for GET /api/systems query parameters
 */
export const SystemSearchSchema = z.object({
  search: z.string().optional(),
  includeTiers: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  includeInstances: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  limit: z.coerce.number().min(1).max(100).default(20),
  offset: z.coerce.number().min(0).default(0),
});

export type SystemSearchParams = z.infer<typeof SystemSearchSchema>;

/**
 * Schema for POST /api/systems request body
 */
export const CreateSystemSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional().nullable(),
});

export type CreateSystemInput = z.infer<typeof CreateSystemSchema>;

/**
 * Schema for PATCH /api/systems/[id] request body
 */
export const UpdateSystemSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().max(1000).optional().nullable(),
});

export type UpdateSystemInput = z.infer<typeof UpdateSystemSchema>;

/**
 * Schema for system response
 */
export const SystemResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
  tiers: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .optional(),
  instances: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
      })
    )
    .optional(),
  owners: z
    .array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
      })
    )
    .optional(),
});

export type SystemResponse = z.infer<typeof SystemResponseSchema>;

/**
 * Schema for paginated system list response
 */
export const SystemListResponseSchema = z.object({
  data: z.array(SystemResponseSchema),
  total: z.number(),
  limit: z.number(),
  offset: z.number(),
});

export type SystemListResponse = z.infer<typeof SystemListResponseSchema>;

// ===========================================
// Access Tier Schemas
// ===========================================

/**
 * Schema for POST /api/systems/[id]/tiers
 */
export const CreateTierSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export type CreateTierInput = z.infer<typeof CreateTierSchema>;

/**
 * Schema for tier response
 */
export const TierResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  systemId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type TierResponse = z.infer<typeof TierResponseSchema>;

// ===========================================
// Instance Schemas
// ===========================================

/**
 * Schema for POST /api/systems/[id]/instances
 */
export const CreateInstanceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
});

export type CreateInstanceInput = z.infer<typeof CreateInstanceSchema>;

/**
 * Schema for instance response
 */
export const InstanceResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  systemId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type InstanceResponse = z.infer<typeof InstanceResponseSchema>;

// ===========================================
// System Owner Schemas
// ===========================================

/**
 * Schema for POST /api/systems/[id]/owners
 */
export const AddOwnersSchema = z.object({
  userIds: z.array(z.string()).min(1, 'At least one user ID is required'),
});

export type AddOwnersInput = z.infer<typeof AddOwnersSchema>;

/**
 * Schema for owner response
 */
export const OwnerResponseSchema = z.object({
  userId: z.string(),
  systemId: z.string(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
});

export type OwnerResponse = z.infer<typeof OwnerResponseSchema>;

