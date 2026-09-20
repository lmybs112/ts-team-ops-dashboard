/**
 * Ingest contract validation stubs (PRD §6.4).
 */

export type IngestPayload = {
  projectSlug: string;
  assigneeRole: string;
  title: string;
  status: string;
  source: string;
  sourceRef: string;
  blockedReason?: string | null;
};

export type IngestValidationResult =
  | { ok: true }
  | {
      ok: false;
      httpStatus: 400;
      code:
        | "BLOCKED_REASON_REQUIRED"
        | "INVALID_ENUM"
        | "IDEMPOTENCY_KEY_REQUIRED"
        | "SOURCE_NOT_ALLOWED"
        | "VALIDATION_FAILED";
      message: string;
    };

export const PROJECT_SLUGS = [
  "marketing",
  "iframe",
  "carousel",
  "try-on",
  "llm-chat",
  "team-ops",
] as const;

export const ASSIGNEE_ROLES = [
  "cto",
  "pm",
  "uiux",
  "frontend",
  "backend",
  "qa",
  "devops",
] as const;

/**
 * Validate ingest payload shape / enums / blocked reason.
 * Stub: always throws.
 */
export function validateIngestPayload(_payload: Partial<IngestPayload>): IngestValidationResult {
  throw new Error("not implemented: validateIngestPayload (PRD §6.4)");
}

/**
 * Idempotency key = source + sourceRef.
 * Stub: always throws.
 */
export function ingestIdempotencyKey(_source: string, _sourceRef: string): string {
  throw new Error("not implemented: ingestIdempotencyKey (PRD §6.4)");
}
