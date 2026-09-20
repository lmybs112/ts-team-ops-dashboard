/**
 * In-memory Ops API — Sprint 0 green implementation (P1–P20).
 */

import { apiError } from "./errors.js";
import type {
  ApiResult,
  AssigneeRole,
  AuthContext,
  CreateIssueBody,
  ErrorCode,
  IngestBody,
  Issue,
  IssueStoreSnapshot,
  PatchIssueBody,
  ProjectSlug,
} from "./types.js";

export type OpsApi = {
  seedIssue: (issue: Issue) => void;
  listIssues: () => IssueStoreSnapshot;
  reset: () => void;

  postIssues: (auth: AuthContext, body: CreateIssueBody) => ApiResult<Issue>;
  patchIssue: (
    auth: AuthContext,
    id: string,
    body: PatchIssueBody,
  ) => ApiResult<Issue>;
  deleteIssue: (auth: AuthContext, id: string) => ApiResult<null>;
  postIngest: (
    auth: AuthContext,
    body: IngestBody,
  ) => ApiResult<{ issue: Issue; idempotentReplay: boolean }>;

  issueSharedGodToken: (roles: string[]) => {
    rejected: boolean;
    token?: string;
    reason?: string;
  };
};

/** Well-known opaque tokens used only in tests (not real secrets). */
export const TEST_TOKENS = {
  mei: "test-token-mei",
  cto: "test-token-cto",
  frontend: "test-token-frontend",
  backend: "test-token-backend",
  qa: "test-token-qa",
} as const;

type Principal =
  | { kind: "human"; actorId: "mei" | "cto" }
  | { kind: "bot"; actorId: AssigneeRole; roleId: AssigneeRole };

const PROJECT_SLUGS: readonly ProjectSlug[] = [
  "marketing",
  "iframe",
  "carousel",
  "try-on",
  "llm-chat",
  "team-ops",
];

const ASSIGNEE_ROLES: readonly AssigneeRole[] = [
  "cto",
  "pm",
  "uiux",
  "frontend",
  "backend",
  "qa",
  "devops",
];

const STATUSES = ["todo", "doing", "blocked", "done"] as const;

function fail(status: number, code: ErrorCode, message: string): ApiResult<never> {
  return { ok: false, status, body: apiError(code, message) };
}

function ok<T>(status: number, body: T): ApiResult<T> {
  return { ok: true, status, body };
}

function extractBearer(auth: AuthContext): string | null {
  // FU-H2a: ignore X-Role / X-Actor* headers — Bearer only
  const raw = auth.authorization;
  if (raw == null || raw === "") return null;
  const m = /^Bearer\s+(.+)$/i.exec(raw.trim());
  if (!m) return null;
  const token = m[1]!.trim();
  return token.length > 0 ? token : null;
}

function resolvePrincipal(auth: AuthContext): Principal | null {
  const token = extractBearer(auth);
  if (!token) return null;
  if (token === TEST_TOKENS.mei) return { kind: "human", actorId: "mei" };
  if (token === TEST_TOKENS.cto) return { kind: "human", actorId: "cto" };
  if (token === TEST_TOKENS.frontend)
    return { kind: "bot", actorId: "frontend", roleId: "frontend" };
  if (token === TEST_TOKENS.backend)
    return { kind: "bot", actorId: "backend", roleId: "backend" };
  if (token === TEST_TOKENS.qa)
    return { kind: "bot", actorId: "qa", roleId: "qa" };
  return null;
}

function nowIso(): string {
  return new Date().toISOString();
}

function validateBlocked(
  status: string,
  blockedReason?: string | null,
): ApiResult<never> | null {
  if (status !== "blocked") return null;
  if (blockedReason == null || blockedReason.trim().length === 0) {
    return fail(400, "BLOCKED_REASON_REQUIRED", "blocked requires blockedReason");
  }
  if (blockedReason.length > 120) {
    return fail(400, "BLOCKED_REASON_TOO_LONG", "blockedReason too long");
  }
  return null;
}

export function createOpsApi(): OpsApi {
  const db = new Map<string, Issue>();
  const idempotency = new Map<string, string>();
  let seq = 1;

  return {
    seedIssue(issue) {
      db.set(issue.id, { ...issue });
      if (issue.sourceRef) {
        idempotency.set(`${issue.source}:${issue.sourceRef}`, issue.id);
      }
    },
    listIssues() {
      return Array.from(db.values());
    },
    reset() {
      db.clear();
      idempotency.clear();
      seq = 1;
    },

    postIssues(authCtx, body) {
      const principal = resolvePrincipal(authCtx);
      if (!principal) return fail(401, "UNAUTHENTICATED", "Missing or invalid bearer");
      if (principal.kind !== "human") {
        return fail(403, "FORBIDDEN_OPERATION", "Bots cannot create via CRUD");
      }
      if (!PROJECT_SLUGS.includes(body.projectSlug)) {
        return fail(400, "INVALID_ENUM", "Invalid projectSlug");
      }
      if (!ASSIGNEE_ROLES.includes(body.assigneeRole)) {
        return fail(400, "INVALID_ENUM", "Invalid assigneeRole");
      }
      if (!(STATUSES as readonly string[]).includes(body.status)) {
        return fail(400, "INVALID_ENUM", "Invalid status");
      }
      const blockedErr = validateBlocked(body.status, body.blockedReason);
      if (blockedErr) return blockedErr;

      const issue: Issue = {
        id: `iss_${seq++}`,
        title: body.title,
        projectSlug: body.projectSlug,
        assigneeRole: body.assigneeRole,
        status: body.status,
        blockedReason:
          body.status === "blocked" ? (body.blockedReason ?? null) : null,
        source: "manual",
        sourceRef: null,
        updatedAt: nowIso(),
        updatedBy: principal.actorId,
      };
      db.set(issue.id, issue);
      return ok(201, issue);
    },

    patchIssue(authCtx, id, body) {
      const principal = resolvePrincipal(authCtx);
      if (!principal) return fail(401, "UNAUTHENTICATED", "Missing or invalid bearer");
      const existing = db.get(id);
      if (!existing) return fail(404, "ISSUE_NOT_FOUND", "Issue not found");

      if (principal.kind === "bot") {
        if (existing.assigneeRole !== principal.roleId) {
          return fail(403, "FORBIDDEN_ASSIGNEE", "Bot cannot mutate others' issues");
        }
        if (body.assigneeRole != null && body.assigneeRole !== existing.assigneeRole) {
          return fail(403, "FORBIDDEN_OPERATION", "Bot cannot reassign");
        }
      }

      const nextStatus = body.status ?? existing.status;
      const nextReason =
        body.blockedReason !== undefined ? body.blockedReason : existing.blockedReason;
      const blockedErr = validateBlocked(nextStatus, nextReason);
      if (blockedErr) return blockedErr;

      const updated: Issue = {
        ...existing,
        title: body.title ?? existing.title,
        status: nextStatus,
        blockedReason: nextStatus === "blocked" ? (nextReason ?? null) : null,
        assigneeRole: body.assigneeRole ?? existing.assigneeRole,
        updatedAt: nowIso(),
        updatedBy: principal.actorId,
      };
      db.set(id, updated);
      return ok(200, updated);
    },

    deleteIssue(authCtx, id) {
      const principal = resolvePrincipal(authCtx);
      if (!principal) return fail(401, "UNAUTHENTICATED", "Missing or invalid bearer");
      if (principal.kind !== "human") {
        return fail(403, "FORBIDDEN_OPERATION", "Bots cannot delete");
      }
      if (!db.has(id)) return fail(404, "ISSUE_NOT_FOUND", "Issue not found");
      db.delete(id);
      return ok(204, null);
    },

    postIngest(authCtx, body) {
      const principal = resolvePrincipal(authCtx);
      if (!principal) return fail(401, "UNAUTHENTICATED", "Missing or invalid bearer");

      let assigneeRole: AssigneeRole;
      if (principal.kind === "bot") {
        if (body.assigneeRole != null && body.assigneeRole !== principal.roleId) {
          return fail(403, "FORBIDDEN_ASSIGNEE", "Bot cannot spoof assigneeRole");
        }
        assigneeRole = principal.roleId;
      } else {
        if (body.assigneeRole == null || !ASSIGNEE_ROLES.includes(body.assigneeRole)) {
          return fail(400, "INVALID_ENUM", "Invalid assigneeRole");
        }
        assigneeRole = body.assigneeRole;
      }

      if (!PROJECT_SLUGS.includes(body.projectSlug)) {
        return fail(400, "INVALID_ENUM", "Invalid projectSlug");
      }
      if (!(STATUSES as readonly string[]).includes(body.status)) {
        return fail(400, "INVALID_ENUM", "Invalid status");
      }
      if (!body.source || !body.sourceRef) {
        return fail(400, "IDEMPOTENCY_KEY_REQUIRED", "source and sourceRef required");
      }
      if ((body.source as string) === "github") {
        return fail(400, "SOURCE_NOT_ALLOWED", "github not allowed");
      }
      const blockedErr = validateBlocked(body.status, body.blockedReason);
      if (blockedErr) return blockedErr;

      const key = `${body.source}:${body.sourceRef}`;
      const existingId = idempotency.get(key);
      if (existingId) {
        const existing = db.get(existingId);
        if (existing) return ok(200, { issue: existing, idempotentReplay: true });
      }

      const issue: Issue = {
        id: `iss_ingest_${seq++}`,
        title: body.title,
        projectSlug: body.projectSlug,
        assigneeRole,
        status: body.status,
        blockedReason:
          body.status === "blocked" ? (body.blockedReason ?? null) : null,
        source: "bot_report",
        sourceRef: body.sourceRef,
        updatedAt: nowIso(),
        updatedBy: principal.actorId,
      };
      db.set(issue.id, issue);
      idempotency.set(key, issue.id);
      return ok(201, { issue, idempotentReplay: false });
    },

    issueSharedGodToken(_roles) {
      // FU-H1b: refuse multi-role shared god keys
      return {
        rejected: true,
        reason: "Shared god tokens are forbidden (FU-H1b); use per-role tokens",
      };
    },
  };
}
