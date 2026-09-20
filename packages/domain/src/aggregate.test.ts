import { describe, expect, it } from "vitest";
import {
  aggregateAgentStatus,
  BLOCKED_SUMMARY_MAX,
  type IssueLike,
} from "./aggregate.js";

const base = (partial: Partial<IssueLike> & Pick<IssueLike, "status">): IssueLike => ({
  updatedAt: "2026-09-19T10:00:00+08:00",
  projectSlug: "marketing",
  assigneeRole: "frontend",
  ...partial,
});

describe("PRD §6.2 Agent aggregate (blocked > doing > todo > done)", () => {
  it("returns blocked when any issue is blocked", () => {
    const issues: IssueLike[] = [
      base({ status: "doing", updatedAt: "2026-09-19T11:00:00+08:00" }),
      base({
        status: "blocked",
        blockedReason: "deps missing",
        updatedAt: "2026-09-19T12:00:00+08:00",
      }),
      base({ status: "todo", updatedAt: "2026-09-19T09:00:00+08:00" }),
    ];
    const agg = aggregateAgentStatus(issues);
    expect(agg.status).toBe("blocked");
    expect(agg.blockedReasonSummary).toBe("deps missing");
  });

  it("uses newest blocked reason and truncates summary to ≤40", () => {
    const older = "old reason";
    const newer = "n".repeat(BLOCKED_SUMMARY_MAX + 20);
    const issues: IssueLike[] = [
      base({
        status: "blocked",
        blockedReason: older,
        updatedAt: "2026-09-19T08:00:00+08:00",
      }),
      base({
        status: "blocked",
        blockedReason: newer,
        updatedAt: "2026-09-19T13:00:00+08:00",
      }),
    ];
    const agg = aggregateAgentStatus(issues);
    expect(agg.status).toBe("blocked");
    expect(agg.blockedReasonSummary).not.toBeNull();
    expect(agg.blockedReasonSummary!.length).toBeLessThanOrEqual(BLOCKED_SUMMARY_MAX);
    expect(agg.blockedReasonSummary).toBe(newer.slice(0, BLOCKED_SUMMARY_MAX));
  });

  it("returns doing when no blocked but any doing", () => {
    const issues: IssueLike[] = [
      base({ status: "todo" }),
      base({ status: "doing" }),
      base({ status: "done" }),
    ];
    expect(aggregateAgentStatus(issues).status).toBe("doing");
    expect(aggregateAgentStatus(issues).blockedReasonSummary).toBeNull();
  });

  it("returns todo when only todo (and done)", () => {
    const issues: IssueLike[] = [
      base({ status: "todo" }),
      base({ status: "done" }),
    ];
    expect(aggregateAgentStatus(issues).status).toBe("todo");
  });

  it("returns done when all done or empty", () => {
    expect(aggregateAgentStatus([base({ status: "done" })]).status).toBe("done");
    expect(aggregateAgentStatus([]).status).toBe("done");
  });

  it("optionally filters by projectSlug", () => {
    const issues: IssueLike[] = [
      base({
        status: "blocked",
        blockedReason: "other project",
        projectSlug: "iframe",
        updatedAt: "2026-09-19T14:00:00+08:00",
      }),
      base({
        status: "doing",
        projectSlug: "marketing",
        updatedAt: "2026-09-19T14:00:00+08:00",
      }),
    ];
    const agg = aggregateAgentStatus(issues, { projectSlug: "marketing" });
    expect(agg.status).toBe("doing");
  });
});
