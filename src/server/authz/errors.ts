/**
 * Authorization Errors for Corolla
 */

/**
 * Thrown when user is not authenticated
 */
export class AuthenticationError extends Error {
  public readonly status = 401;
  public readonly code = 'UNAUTHENTICATED';

  constructor(message = 'Authentication required') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

/**
 * Thrown when user lacks permission for an action
 */
export class AuthorizationError extends Error {
  public readonly status = 403;
  public readonly code: string;

  constructor(
    message = 'You do not have permission to perform this action',
    code = 'FORBIDDEN'
  ) {
    super(message);
    this.name = 'AuthorizationError';
    this.code = code;
  }
}

/**
 * Thrown when a resource is not found
 */
export class NotFoundError extends Error {
  public readonly status = 404;
  public readonly code = 'NOT_FOUND';

  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

