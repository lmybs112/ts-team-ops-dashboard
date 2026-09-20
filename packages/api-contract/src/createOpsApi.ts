/**
 * Intentionally incomplete in-memory Ops API for Sprint 0 TDD RED.
 *
 * Every mutating / auth-sensitive method returns HTTP 500 NOT_IMPLEMENTED
 * (or throws) so P1–P20 contract assertions fail for the right reasons until
 * a real implementation lands in a later sprint.
 *
 * DO NOT flesh this out to make tests green in this PR.
 */

import { apiError } from "./errors.js";
import type {
  ApiResult,
  AuthContext,
  CreateIssueBody,
  IngestBody,
  Issue,
  IssueStoreSnapshot,
  PatchIssueBody,
} from "./types.js";

export type OpsApi = {
  /** Seed helpers for tests — allowed to mutate in-memory state for fixtures */
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

  /**
   * FU-H1b: attempt to mint a token that validates as multiple bot roles.
   * Real impl must refuse. Stub always "succeeds" with a god key (wrong).
   */
  issueSharedGodToken: (roles: string[]) => {
    rejected: boolean;
    token?: string;
    reason?: string;
  };
};

function notImplemented<T = never>(): ApiResult<T> {
  return {
    ok: false,
    status: 500,
    body: apiError("NOT_IMPLEMENTED", "Ops API not implemented (Sprint 0 red stub)"),
  };
}

/**
 * Create a fake Ops API. Writes always fail with 500 so contract tests stay RED.
 * Seed/list/reset work so tests can assert "DB unchanged".
 */
export function createOpsApi(): OpsApi {
  const db = new Map<string, Issue>();

  return {
    seedIssue(issue) {
      db.set(issue.id, { ...issue });
    },
    listIssues() {
      return Array.from(db.values());
    },
    reset() {
      db.clear();
    },
    postIssues(_auth, _body) {
      return notImplemented();
    },
    patchIssue(_auth, _id, _body) {
      return notImplemented();
    },
    deleteIssue(_auth, _id) {
      return notImplemented();
    },
    postIngest(_auth, _body) {
      return notImplemented();
    },
    /** Stub wrongly accepts god keys — tests expect rejection → RED */
    issueSharedGodToken(roles) {
      return {
        rejected: false,
        token: `god-key-for:${roles.join("+")}`,
      };
    },
  };
}

/** Well-known opaque tokens used only in tests (not real secrets). */
export const TEST_TOKENS = {
  mei: "test-token-mei",
  cto: "test-token-cto",
  frontend: "test-token-frontend",
  backend: "test-token-backend",
  qa: "test-token-qa",
} as const;
