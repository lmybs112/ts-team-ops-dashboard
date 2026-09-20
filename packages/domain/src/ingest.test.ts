import { describe, expect, it } from "vitest";
import {
  ingestIdempotencyKey,
  validateIngestPayload,
  type IngestPayload,
} from "./ingest.js";

const valid: IngestPayload = {
  projectSlug: "marketing",
  assigneeRole: "frontend",
  title: "完成商品卡 hover 狀態",
  status: "done",
  source: "bot_report",
  sourceRef: "agent:frontend:task-123",
  blockedReason: null,
};

describe("PRD §6.4 Ingest contract", () => {
  it("accepts a well-shaped payload", () => {
    const result = validateIngestPayload(valid);
    expect(result.ok).toBe(true);
  });

  it("idempotency key is source + sourceRef", () => {
    expect(ingestIdempotencyKey("bot_report", "agent:frontend:task-123")).toBe(
      "bot_report:agent:frontend:task-123",
    );
  });

  it("blocked without reason → 400 BLOCKED_REASON_REQUIRED", () => {
    const result = validateIngestPayload({
      ...valid,
      status: "blocked",
      blockedReason: "",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(400);
      expect(result.code).toBe("BLOCKED_REASON_REQUIRED");
    }
  });

  it("illegal projectSlug → 400 INVALID_ENUM", () => {
    const result = validateIngestPayload({
      ...valid,
      projectSlug: "not-a-real-project",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(400);
      expect(result.code).toBe("INVALID_ENUM");
    }
  });

  it("illegal assigneeRole → 400 INVALID_ENUM", () => {
    const result = validateIngestPayload({
      ...valid,
      assigneeRole: " intern ",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.httpStatus).toBe(400);
      expect(result.code).toBe("INVALID_ENUM");
    }
  });

  it("missing source or sourceRef → 400 IDEMPOTENCY_KEY_REQUIRED", () => {
    const missingSource = validateIngestPayload({ ...valid, source: "" });
    expect(missingSource.ok).toBe(false);
    if (!missingSource.ok) {
      expect(missingSource.code).toBe("IDEMPOTENCY_KEY_REQUIRED");
    }
    const missingRef = validateIngestPayload({ ...valid, sourceRef: "" });
    expect(missingRef.ok).toBe(false);
    if (!missingRef.ok) {
      expect(missingRef.code).toBe("IDEMPOTENCY_KEY_REQUIRED");
    }
  });

  it("github source → 400 SOURCE_NOT_ALLOWED (MVP)", () => {
    const result = validateIngestPayload({
      ...valid,
      source: "github",
      sourceRef: "gh:1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.code).toBe("SOURCE_NOT_ALLOWED");
    }
  });
});
