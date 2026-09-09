export class AuthenticationError extends Error {
  status = 401 as const;
  constructor(message = "Authentication required") {
    super(message);
    this.name = "AuthenticationError";
  }
}

export class AuthorizationError extends Error {
  status = 403 as const;
  constructor(message = "Not authorized") {
    super(message);
    this.name = "AuthorizationError";
  }
}



