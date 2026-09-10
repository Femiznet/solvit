// lib/errors.ts

export abstract class BaseAppError extends Error {
  abstract readonly status: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class AuthenticationError extends BaseAppError {
  readonly status = 401;

  constructor(message: string = "Authentication required. Please log in.") {
    super(message);
  }
}

export class AuthorizationError extends BaseAppError {
  readonly status = 403;

  constructor(message: string = "You do not have permission to perform this action.") {
    super(message);
  }
}

export class RateLimitError extends BaseAppError {
  readonly status = 429;

  constructor(message: string = "Daily project creation limit reached. Please try again later.") {
    super(message);
  }
}

export class ClientError extends BaseAppError {
  status = 400;
}

export class AppError extends BaseAppError {
  readonly status: number;

  constructor(status: number = 500, message: string = "An unexpected error occurred.") {
    super(message);
    this.status = status;
  }
}