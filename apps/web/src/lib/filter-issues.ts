import type { Issue } from "@team-hq/api-contract";
import type { FilterState } from "@team-hq/domain";

/** Client-side filter of OpsApi issues by shared Filter State. */
export function filterIssues(
  issues: readonly Issue[],
  filters: FilterState,
): Issue[] {
  const q = filters.query.trim().toLowerCase();
  return issues.filter((issue) => {
    if (filters.projectId !== "all" && issue.projectSlug !== filters.projectId) {
      return false;
    }
    if (filters.agentId !== "all" && issue.assigneeRole !== filters.agentId) {
      return false;
    }
    if (filters.status !== "all" && issue.status !== filters.status) {
      return false;
    }
    if (q && !issue.title.toLowerCase().includes(q)) {
      return false;
    }
    return true;
  });
}
