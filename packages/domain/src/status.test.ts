import { describe, expect, it } from "vitest";
import {
  ALLOWED_STATUSES,
  BLOCKED_REASON_MAX,
  isAllowedStatus,
  validateStatusAndReason,
} from "./status.js";

describe("PRD §6.1 Status + blockedReason", () => {
  it("allows only todo|doing|blocked|done", () => {
    expect(ALLOWED_STATUSES).toEqual(["todo", "doing", "blocked", "done"]);
    for (const s of ALLOWED_STATUSES) {
      expect(isAllowedStatus(s)).toBe(true);
    }
    expect(isAllowedStatus("cancelled")).toBe(false);
    expect(isAllowedStatus("in_progress")).toBe(false);
    expect(isAllowedStatus("")).toBe(false);
  });

  it("accepts non-blocked statuses without reason", () => {
    for (const status of ["todo", "doing", "done"] as const) {
      const result = validateStatusAndReason(status, null);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.status).toBe(status);
        expect(result.blockedReason).toBeNull();
      }
    }
  });

  it("requires non-empty blockedReason when status=blocked", () => {
    const result = validateStatusAndReason("blocked", "waiting on API key");
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.status).toBe("blocked");
      expect(result.blockedReason).toBe("waiting on API key");
    }
  });

  it("rejects empty blockedReason for blocked", () => {
    const result = validateStatusAndReason("blocked", "");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("BLOCKED_REASON_REQUIRED");
    }
  });

  it("rejects whitespace-only blockedReason for blocked", () => {
    const result = validateStatusAndReason("blocked", "   \t  ");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("BLOCKED_REASON_REQUIRED");
    }
  });

  it("rejects null/undefined blockedReason for blocked", () => {
    expect(validateStatusAndReason("blocked", null).ok).toBe(false);
    expect(validateStatusAndReason("blocked", undefined).ok).toBe(false);
  });

  it(`rejects blockedReason longer than ${BLOCKED_REASON_MAX} chars`, () => {
    const long = "x".repeat(BLOCKED_REASON_MAX + 1);
    const result = validateStatusAndReason("blocked", long);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("BLOCKED_REASON_TOO_LONG");
    }
  });

  it("rejects unknown status values", () => {
    const result = validateStatusAndReason("wip", "n/a");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("INVALID_STATUS");
    }
  });
});
