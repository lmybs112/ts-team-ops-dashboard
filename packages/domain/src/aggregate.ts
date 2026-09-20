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

export const BLOCKED_SUMMARY_MAX = 40;

export function aggregateAgentStatus(
  issues: IssueLike[],
  opts?: { projectSlug?: string },
): AgentAggregate {
  const filtered = opts?.projectSlug
    ? issues.filter((i) => i.projectSlug === opts.projectSlug)
    : issues;

  if (filtered.length === 0) {
    return { status: "done", blockedReasonSummary: null };
  }

  const blocked = filtered.filter((i) => i.status === "blocked");
  if (blocked.length > 0) {
    const newest = [...blocked].sort((a, b) =>
      a.updatedAt < b.updatedAt ? 1 : a.updatedAt > b.updatedAt ? -1 : 0,
    )[0];
    const raw = newest.blockedReason ?? "";
    const summary =
      raw.length > BLOCKED_SUMMARY_MAX ? raw.slice(0, BLOCKED_SUMMARY_MAX) : raw;
    return { status: "blocked", blockedReasonSummary: summary || null };
  }
  if (filtered.some((i) => i.status === "doing")) {
    return { status: "doing", blockedReasonSummary: null };
  }
  if (filtered.some((i) => i.status === "todo")) {
    return { status: "todo", blockedReasonSummary: null };
  }
  return { status: "done", blockedReasonSummary: null };
}
