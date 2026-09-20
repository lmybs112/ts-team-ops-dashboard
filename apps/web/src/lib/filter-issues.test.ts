import { describe, expect, it } from "vitest";
import type { Issue } from "@team-hq/api-contract";
import { filterIssues } from "./filter-issues.js";

const issues: Issue[] = [
  {
    id: "1",
    title: "Fix card hover",
    projectSlug: "marketing",
    assigneeRole: "frontend",
    status: "blocked",
    blockedReason: "design TBD",
    source: "manual",
    sourceRef: null,
    updatedAt: "2026-09-21T00:00:00.000Z",
    updatedBy: "mei",
  },
  {
    id: "2",
    title: "Seed ingest",
    projectSlug: "team-ops",
    assigneeRole: "backend",
    status: "doing",
    blockedReason: null,
    source: "bot_report",
    sourceRef: "r1",
    updatedAt: "2026-09-21T01:00:00.000Z",
    updatedBy: "backend",
  },
  {
    id: "3",
    title: "QA checklist",
    projectSlug: "marketing",
    assigneeRole: "qa",
    status: "todo",
    blockedReason: null,
    source: "manual",
    sourceRef: null,
    updatedAt: "2026-09-21T02:00:00.000Z",
    updatedBy: "mei",
  },
];

describe("filterIssues (client-side, driven by Filter State)", () => {
  it("returns all when filters are defaults", () => {
    expect(
      filterIssues(issues, {
        projectId: "all",
        agentId: "all",
        status: "all",
        query: "",
      }),
    ).toHaveLength(3);
  });

  it("filters by projectId, agentId, status, and query together", () => {
    const result = filterIssues(issues, {
      projectId: "marketing",
      agentId: "frontend",
      status: "blocked",
      query: "hover",
    });
    expect(result.map((i) => i.id)).toEqual(["1"]);
  });

  it("matches query case-insensitively on title", () => {
    const result = filterIssues(issues, {
      projectId: "all",
      agentId: "all",
      status: "all",
      query: "QA",
    });
    expect(result.map((i) => i.id)).toEqual(["3"]);
  });
});
