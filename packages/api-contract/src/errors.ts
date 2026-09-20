import type { ApiErrorBody, ErrorCode } from "./types.js";

export function apiError(
  code: ErrorCode,
  message: string,
  details?: Record<string, unknown>,
): ApiErrorBody {
  return {
    error: {
      code,
      message,
      ...(details ? { details } : {}),
    },
  };
}
