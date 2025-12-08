import { NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { ServiceError } from '@/server/services/usersService';
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
} from '@/server/authz';

export interface ApiErrorResponse {
  error: string;
  message: string;
  details?: unknown;
}

/**
 * Centralized error handler for API routes
 * Handles all error types and returns appropriate HTTP responses
 */
export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const issues = error.issues ?? [];
    return NextResponse.json(
      {
        error: 'VALIDATION_ERROR',
        message: 'Invalid request parameters',
        details: issues.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
      { status: 400 }
    );
  }

  // Handle authentication errors (401)
  if (error instanceof AuthenticationError) {
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
      },
      { status: error.status }
    );
  }

  // Handle authorization errors (403)
  if (error instanceof AuthorizationError) {
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
      },
      { status: error.status }
    );
  }

  // Handle not found errors (404)
  if (error instanceof NotFoundError) {
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
      },
      { status: error.status }
    );
  }

  // Handle service-level errors
  if (error instanceof ServiceError) {
    return NextResponse.json(
      {
        error: error.code,
        message: error.message,
      },
      { status: error.statusCode }
    );
  }

  // Handle JSON parse errors
  if (error instanceof SyntaxError && error.message.includes('JSON')) {
    return NextResponse.json(
      {
        error: 'INVALID_JSON',
        message: 'Request body must be valid JSON',
      },
      { status: 400 }
    );
  }

  // Log unexpected errors
  console.error('Unexpected API error:', error);

  // Generic error response
  return NextResponse.json(
    {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}
