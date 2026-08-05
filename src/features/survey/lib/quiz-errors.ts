import { ApiError } from "@/core/api/errors";

/**
 * A survey completed by an earlier attempt is not a user-facing failure — the
 * backend rejects a second complete with 400 "already completed".
 */
export function isAlreadyCompletedError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return (
    error.status === 400 &&
    error.message.toLowerCase().includes("already completed")
  );
}

/** The session no longer exists (deleted or belongs to another customer). */
export function isSessionGoneError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
