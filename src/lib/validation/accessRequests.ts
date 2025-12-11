import { z } from 'zod';

// ===========================================
// Enums
// ===========================================

export const RequestStatusEnum = z.enum([
    'requested',
    'manager_approved',
    'owner_approved',
    'rejected',
    'completed',
]);
export type RequestStatus = z.infer<typeof RequestStatusEnum>;

// ===========================================
// Create Schema
// ===========================================

/**
 * Schema for POST /api/access-requests request body
 */
export const CreateAccessRequestSchema = z.object({
    userId: z.string().min(1, 'User ID is required'),
    systemId: z.string().min(1, 'System ID is required'),
    instanceId: z.string().optional().nullable(),
    tierId: z.string().min(1, 'Tier ID is required'),
    reason: z.string().max(1000).optional().nullable(),
});

export type CreateAccessRequestInput = z.infer<typeof CreateAccessRequestSchema>;

// ===========================================
// Response Schemas
// ===========================================

/**
 * Full access request response
 */
export const AccessRequestResponseSchema = z.object({
    id: z.string(),
    userId: z.string(),
    requestedBy: z.string(),
    systemId: z.string(),
    instanceId: z.string().nullable(),
    tierId: z.string(),
    status: RequestStatusEnum,
    reason: z.string().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    user: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
    }),
    requester: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
    }),
    system: z.object({
        id: z.string(),
        name: z.string(),
    }),
    instance: z.object({
        id: z.string(),
        name: z.string(),
    }).nullable().optional(),
    tier: z.object({
        id: z.string(),
        name: z.string(),
    }),
});

export type AccessRequestResponse = z.infer<typeof AccessRequestResponseSchema>;
