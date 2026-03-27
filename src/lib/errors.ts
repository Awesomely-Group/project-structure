export type Result<T, E = AppError> =
  | { ok: true; value: T }
  | { ok: false; error: E };

export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value };
}

export function err<E>(error: E): Result<never, E> {
  return { ok: false, error };
}

export type AppErrorCode =
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "CONFLICT"
  | "EXTERNAL_API_ERROR"
  | "DB_ERROR"
  | "ENCRYPTION_ERROR"
  | "SYNC_ERROR"
  | "UNKNOWN";

export interface AppError {
  code: AppErrorCode;
  message: string;
  cause?: unknown;
}

export function appError(
  code: AppErrorCode,
  message: string,
  cause?: unknown,
): AppError {
  return { code, message, cause };
}

export function httpStatus(code: AppErrorCode): number {
  const map: Record<AppErrorCode, number> = {
    NOT_FOUND: 404,
    VALIDATION_ERROR: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    CONFLICT: 409,
    EXTERNAL_API_ERROR: 502,
    DB_ERROR: 500,
    ENCRYPTION_ERROR: 500,
    SYNC_ERROR: 500,
    UNKNOWN: 500,
  };
  return map[code];
}
