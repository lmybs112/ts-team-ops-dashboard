/** Shared Ops API types aligned with docs/api/openapi.yaml + permissions-and-errors.md */

export type ProjectSlug =
  | "marketing"
  | "iframe"
  | "carousel"
  | "try-on"
  | "llm-chat"
  | "team-ops";

export type AssigneeRole =
  | "cto"
  | "pm"
  | "uiux"
  | "frontend"
  | "backend"
  | "qa"
  | "devops";

export type IssueStatus = "todo" | "doing" | "blocked" | "done";

export type IssueSource = "manual" | "bot_report" | "github";

export type ErrorCode =
  | "BLOCKED_REASON_REQUIRED"
  | "BLOCKED_REASON_TOO_LONG"
  | "INVALID_ENUM"
  | "VALIDATION_FAILED"
  | "IDEMPOTENCY_KEY_REQUIRED"
  | "SOURCE_NOT_ALLOWED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN_ASSIGNEE"
  | "FORBIDDEN_OPERATION"
  | "ISSUE_NOT_FOUND"
  | "IDEMPOTENCY_CONFLICT"
  | "NOT_IMPLEMENTED";

export type ApiErrorBody = {
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, unknown>;
  };
};

export type Issue = {
  id: string;
  title: string;
  projectSlug: ProjectSlug;
  assigneeRole: AssigneeRole;
  status: IssueStatus;
  blockedReason: string | null;
  source: IssueSource;
  sourceRef: string | null;
  updatedAt: string;
  updatedBy: string;
};

export type CreateIssueBody = {
  title: string;
  projectSlug: ProjectSlug;
  assigneeRole: AssigneeRole;
  status: IssueStatus;
  blockedReason?: string | null;
};

export type PatchIssueBody = {
  title?: string;
  status?: IssueStatus;
  blockedReason?: string | null;
  assigneeRole?: AssigneeRole;
};

export type IngestBody = {
  projectSlug: ProjectSlug;
  assigneeRole?: AssigneeRole;
  title: string;
  status: IssueStatus;
  source: "bot_report";
  sourceRef: string;
  blockedReason?: string | null;
};

export type AuthContext = {
  /** Bearer token string (opaque). Omit / empty = unauthenticated. */
  authorization?: string | null;
  /** Forbidden as auth — FU-H2a; stubs must ignore. */
  headers?: Record<string, string>;
};

export type ApiResult<T> =
  | { ok: true; status: number; body: T }
  | { ok: false; status: number; body: ApiErrorBody };

export type IssueStoreSnapshot = ReadonlyArray<Issue>;
