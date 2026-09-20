import type {
  ApiResult,
  ErrorCode,
  Issue,
  IssueStatus,
  PatchIssueBody,
} from "@team-hq/api-contract";
import type { DemoActorId } from "./demo-actors.js";
import { patchIssueForActor } from "./ops-client.js";

export type MutationFailure = {
  ok: false;
  status: number;
  code: ErrorCode;
  message: string;
  /** Human-visible string for UI banners (includes HTTP status + code). */
  display: string;
};

export type MutationSuccess = {
  ok: true;
  issue: Issue;
};

export type MutationResult = MutationSuccess | MutationFailure;

export function formatMutationError(
  result: Extract<ApiResult<unknown>, { ok: false }>,
): string {
  const { status, body } = result;
  return `${status} ${body.error.code}: ${body.error.message}`;
}

/**
 * Apply status / blockedReason / title patch through OpsApi.
 * Failures surface ApiResult status+code for UI (401/403/400).
 */
export function applyIssuePatch(
  actorId: DemoActorId,
  issueId: string,
  body: PatchIssueBody,
): MutationResult {
  const result = patchIssueForActor(actorId, issueId, body);
  if (result.ok) {
    return { ok: true, issue: result.body };
  }
  return {
    ok: false,
    status: result.status,
    code: result.body.error.code,
    message: result.body.error.message,
    display: formatMutationError(result),
  };
}

export type IssueEditorDraft = {
  status: IssueStatus;
  blockedReason: string;
};

/** Client-side gate aligned with contract validateBlocked (empty reason). */
export function clientBlockedReasonError(
  draft: IssueEditorDraft,
): MutationFailure | null {
  if (draft.status !== "blocked") return null;
  if (draft.blockedReason.trim().length > 0) return null;
  return {
    ok: false,
    status: 400,
    code: "BLOCKED_REASON_REQUIRED",
    message: "blocked requires blockedReason",
    display: "400 BLOCKED_REASON_REQUIRED: blocked requires blockedReason",
  };
}
