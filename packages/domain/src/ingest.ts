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

const STATUSES = ["todo", "doing", "blocked", "done"] as const;

export function ingestIdempotencyKey(source: string, sourceRef: string): string {
  return `${source}:${sourceRef}`;
}

export function validateIngestPayload(
  payload: Partial<IngestPayload>,
): IngestValidationResult {
  const source = payload.source ?? "";
  const sourceRef = payload.sourceRef ?? "";
  if (!source || !sourceRef) {
    return {
      ok: false,
      httpStatus: 400,
      code: "IDEMPOTENCY_KEY_REQUIRED",
      message: "source and sourceRef are required",
    };
  }
  if (source === "github") {
    return {
      ok: false,
      httpStatus: 400,
      code: "SOURCE_NOT_ALLOWED",
      message: "github source not allowed in MVP",
    };
  }
  if (
    !payload.projectSlug ||
    !(PROJECT_SLUGS as readonly string[]).includes(payload.projectSlug)
  ) {
    return {
      ok: false,
      httpStatus: 400,
      code: "INVALID_ENUM",
      message: "invalid projectSlug",
    };
  }
  if (
    !payload.assigneeRole ||
    !(ASSIGNEE_ROLES as readonly string[]).includes(payload.assigneeRole)
  ) {
    return {
      ok: false,
      httpStatus: 400,
      code: "INVALID_ENUM",
      message: "invalid assigneeRole",
    };
  }
  if (!payload.status || !(STATUSES as readonly string[]).includes(payload.status)) {
    return {
      ok: false,
      httpStatus: 400,
      code: "INVALID_ENUM",
      message: "invalid status",
    };
  }
  if (!payload.title || payload.title.trim().length === 0) {
    return {
      ok: false,
      httpStatus: 400,
      code: "VALIDATION_FAILED",
      message: "title is required",
    };
  }
  if (payload.status === "blocked") {
    const reason = payload.blockedReason;
    if (reason == null || reason.trim().length === 0) {
      return {
        ok: false,
        httpStatus: 400,
        code: "BLOCKED_REASON_REQUIRED",
        message: "blocked requires blockedReason",
      };
    }
  }
  return { ok: true };
}
