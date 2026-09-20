/**
 * Status machine stubs (PRD §6.1).
 * Real validation is intentionally NOT implemented — Sprint 0 TDD red gate.
 */

export type IssueStatus = "todo" | "doing" | "blocked" | "done";

export const ALLOWED_STATUSES: readonly IssueStatus[] = [
  "todo",
  "doing",
  "blocked",
  "done",
] as const;

export const BLOCKED_REASON_MAX = 120;

export type StatusValidationResult =
  | { ok: true; status: IssueStatus; blockedReason: string | null }
  | {
      ok: false;
      code: "INVALID_STATUS" | "BLOCKED_REASON_REQUIRED" | "BLOCKED_REASON_TOO_LONG";
      message: string;
    };

/**
 * Validate status + blockedReason pair per PRD §6.1.
 * Stub: always throws — domain logic not implemented yet.
 */
export function validateStatusAndReason(
  _status: string,
  _blockedReason?: string | null,
): StatusValidationResult {
  throw new Error("not implemented: validateStatusAndReason (PRD §6.1)");
}

/**
 * Whether a value is one of the four fixed statuses.
 * Stub: always throws.
 */
export function isAllowedStatus(_value: string): boolean {
  throw new Error("not implemented: isAllowedStatus (PRD §6.1)");
}
