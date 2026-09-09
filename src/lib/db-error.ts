import { ClientError } from "@/lib/errors";

interface DbError extends Error {
  code?: string;
  constraint?: string;
  detail?: string;
  cause?: DbError;
}

export function handleDbError(err: unknown, constraintErrors?: Record<string, string>): void {
  const dbErr = err as DbError;
  const actualDbErr = dbErr.cause || dbErr;

  if (actualDbErr.constraint && constraintErrors && constraintErrors[actualDbErr.constraint]) {
    throw new ClientError(constraintErrors[actualDbErr.constraint]);
  }
}
