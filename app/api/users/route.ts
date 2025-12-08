import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { usersService, ServiceError } from '@/server/services/usersService';
import {
  UserSearchSchema,
  CreateUserSchema,
  type ApiError,
} from '@/lib/validation/users';

/**
 * GET /api/users
 * Returns a paginated list of users with optional search and filtering.
 *
 * Query Parameters:
 * - search: string (optional) - Search by name or email
 * - managerId: string (optional) - Filter by manager ID
 * - limit: number (default 20, max 100) - Results per page
 * - offset: number (default 0) - Skip N results
 */
export async function GET(request: NextRequest) {
  try {
    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const rawParams = {
      search: searchParams.get('search') ?? undefined,
      managerId: searchParams.get('managerId') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      offset: searchParams.get('offset') ?? undefined,
    };

    // Validate with Zod
    const params = UserSearchSchema.parse(rawParams);

    // Call service
    const result = await usersService.searchUsers(params);

    return NextResponse.json(result);
  } catch (error) {
    return handleError(error);
  }
}

/**
 * POST /api/users
 * Creates a new user.
 *
 * Request Body:
 * - name: string (required) - User's full name
 * - email: string (required) - Unique email address
 * - managerId: string (optional) - ID of the user's manager
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Validate with Zod
    const input = CreateUserSchema.parse(body);

    // Call service
    const user = await usersService.createUser(input);

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

/**
 * Centralized error handler for API routes
 */
function handleError(error: unknown): NextResponse<ApiError> {
  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const issues = error.issues ?? error.errors ?? [];
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
  console.error('Unexpected error in /api/users:', error);

  // Generic error response
  return NextResponse.json(
    {
      error: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    { status: 500 }
  );
}
