"use client";

import { useMemo } from "react";
import { useFilter } from "../filters/FilterProvider";
import { STATUS_COLOR } from "../lib/constants";
import { filterIssues } from "../lib/filter-issues";
import { listAllIssues } from "../lib/ops-client";

export function LinearView() {
  const { state } = useFilter();
  const issues = useMemo(() => listAllIssues(), []);
  const filtered = useMemo(
    () => filterIssues(issues, state),
    [issues, state],
  );

  return (
    <section className="linear-view" aria-label="View Linear">
      <h1 className="view-title">Issues</h1>
      <p className="muted">
        共 {filtered.length} / {issues.length} 筆（依共用 Filter State）
      </p>
      <div className="issue-table-wrap">
        <table className="issue-table" data-testid="issue-table">
          <thead>
            <tr>
              <th>標題</th>
              <th>專案</th>
              <th>Agent</th>
              <th>狀態</th>
              <th>更新</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="muted">
                  無符合篩選的 Issues
                </td>
              </tr>
            ) : (
              filtered.map((issue) => (
                <tr key={issue.id}>
                  <td>
                    <div>{issue.title}</div>
                    {issue.status === "blocked" && issue.blockedReason ? (
                      <div className="blocked-reason">{issue.blockedReason}</div>
                    ) : null}
                  </td>
                  <td>{issue.projectSlug}</td>
                  <td>{issue.assigneeRole}</td>
                  <td>
                    <span
                      className="status-pill"
                      style={{ background: STATUS_COLOR[issue.status] }}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="muted mono">
                    {formatTaipei(issue.updatedAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function formatTaipei(iso: string): string {
  try {
    return new Intl.DateTimeFormat("zh-TW", {
      timeZone: "Asia/Taipei",
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
