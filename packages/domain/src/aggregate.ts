/**
 * Agent aggregate stubs (PRD §6.2).
 * Priority: blocked > doing > todo > done.
 * Blocked reason summary ≤40 from newest blocked issue.
 */

import type { IssueStatus } from "./status.js";

export type IssueLike = {
  status: IssueStatus;
  blockedReason?: string | null;
  updatedAt: string;
  projectSlug?: string;
  assigneeRole?: string;
};

export type AgentAggregate = {
  status: IssueStatus;
  blockedReasonSummary: string | null;
};

/**
 * Aggregate issues for an agent/role into a single map label status.
 * Stub: always throws.
 */
export function aggregateAgentStatus(
  _issues: IssueLike[],
  _opts?: { projectSlug?: string },
): AgentAggregate {
  throw new Error("not implemented: aggregateAgentStatus (PRD §6.2)");
}

export const BLOCKED_SUMMARY_MAX = 40;
