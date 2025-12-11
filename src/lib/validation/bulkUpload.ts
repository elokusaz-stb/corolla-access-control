import { z } from 'zod';

// ===========================================
// CSV Row Schema
// ===========================================

/**
 * Schema for a single CSV row
 */
export const BulkUploadRowSchema = z.object({
  user_email: z
    .string()
    .min(1, 'user_email is required')
    .email('Invalid email format'),
  system_name: z.string().min(1, 'system_name is required'),
  instance_name: z.string().optional(),
  access_tier_name: z.string().min(1, 'access_tier_name is required'),
  notes: z.string().optional(),
});

export type BulkUploadRow = z.infer<typeof BulkUploadRowSchema>;

// ===========================================
// Request Schema (JSON fallback)
// ===========================================

/**
 * Schema for JSON-based bulk upload request
 */
export const BulkUploadRequestSchema = z.object({
  rows: z.array(BulkUploadRowSchema).min(1, 'At least one row is required'),
});

export type BulkUploadRequest = z.infer<typeof BulkUploadRequestSchema>;

// ===========================================
// Response Schemas
// ===========================================

/**
 * Error details for a single row
 */
export const RowErrorSchema = z.object({
  rowNumber: z.number(),
  rowData: BulkUploadRowSchema,
  errors: z.array(z.string()),
});

export type RowError = z.infer<typeof RowErrorSchema>;

/**
 * Valid row with resolved IDs
 */
export const ValidRowSchema = z.object({
  rowNumber: z.number(),
  rowData: BulkUploadRowSchema,
  resolvedData: z.object({
    userId: z.string(),
    systemId: z.string(),
    instanceId: z.string().nullable(),
    tierId: z.string(),
    notes: z.string().nullable(),
  }),
});

export type ValidRow = z.infer<typeof ValidRowSchema>;

/**
 * Created grant in response
 */
export const CreatedGrantSchema = z.object({
  id: z.string(),
  userId: z.string(),
  systemId: z.string(),
  instanceId: z.string().nullable(),
  tierId: z.string(),
  status: z.string(),
  grantedBy: z.string(),
  grantedAt: z.date(),
  notes: z.string().nullable(),
  user: z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
  }),
  system: z.object({
    id: z.string(),
    name: z.string(),
  }),
  tier: z.object({
    id: z.string(),
    name: z.string(),
  }),
});

export type CreatedGrant = z.infer<typeof CreatedGrantSchema>;

/**
 * Full response schema for bulk upload
 */
export const BulkUploadResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  summary: z.object({
    totalRows: z.number(),
    validRows: z.number(),
    errorRows: z.number(),
    insertedCount: z.number(),
  }),
  validRows: z.array(ValidRowSchema),
  errorRows: z.array(RowErrorSchema),
  createdGrants: z.array(CreatedGrantSchema).optional(),
  parseErrors: z.array(z.string()).optional(),
});

export type BulkUploadResponse = z.infer<typeof BulkUploadResponseSchema>;

// ===========================================
// Validation Result (Internal)
// ===========================================

export interface ValidationResult {
  validRows: ValidRow[];
  errorRows: RowError[];
}

// ===========================================
// Resolved Entities (Internal)
// ===========================================

export interface ResolvedUser {
  id: string;
  name: string;
  email: string;
}

export interface ResolvedSystem {
  id: string;
  name: string;
}

export interface ResolvedTier {
  id: string;
  name: string;
  systemId: string;
}

export interface ResolvedInstance {
  id: string;
  name: string;
  systemId: string;
}

