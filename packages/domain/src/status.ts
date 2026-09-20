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

export function isAllowedStatus(value: string): boolean {
  return (ALLOWED_STATUSES as readonly string[]).includes(value);
}

export function validateStatusAndReason(
  status: string,
  blockedReason?: string | null,
): StatusValidationResult {
  if (!isAllowedStatus(status)) {
    return { ok: false, code: "INVALID_STATUS", message: `Invalid status: ${status}` };
  }
  const s = status as IssueStatus;
  if (s !== "blocked") {
    return { ok: true, status: s, blockedReason: null };
  }
  if (blockedReason == null || blockedReason.trim().length === 0) {
    return {
      ok: false,
      code: "BLOCKED_REASON_REQUIRED",
      message: "blocked requires non-empty blockedReason",
    };
  }
  if (blockedReason.length > BLOCKED_REASON_MAX) {
    return {
      ok: false,
      code: "BLOCKED_REASON_TOO_LONG",
      message: `blockedReason must be ≤ ${BLOCKED_REASON_MAX}`,
    };
  }
  return { ok: true, status: "blocked", blockedReason: blockedReason.trim() };
}
