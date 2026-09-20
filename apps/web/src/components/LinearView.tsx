"use client";

import { useMemo, useState } from "react";
import type { Issue } from "@team-hq/api-contract";
import { useFilter } from "../filters/FilterProvider";
import { useIssues } from "../hooks/useIssues";
import { STATUS_COLOR } from "../lib/constants";
import { filterIssues } from "../lib/filter-issues";
import { IssueDetailPanel } from "./IssueDetailPanel";

export function LinearView() {
  const { state } = useFilter();
  const issues = useIssues();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(
    () => filterIssues(issues, state),
    [issues, state],
  );

  const selected: Issue | null = useMemo(() => {
    if (!selectedId) return null;
    return issues.find((i) => i.id === selectedId) ?? null;
  }, [issues, selectedId]);

  return (
    <section className="linear-view" aria-label="View Linear">
      <h1 className="view-title">Issues</h1>
      <p className="muted">
        共 {filtered.length} / {issues.length} 筆（依共用 Filter State）·
        點選列開啟詳情並改狀態
      </p>
      <div className="linear-layout">
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
                filtered.map((issue) => {
                  const active = issue.id === selectedId;
                  return (
                    <tr
                      key={issue.id}
                      className={
                        active ? "issue-row selected" : "issue-row"
                      }
                      data-testid={`issue-row-${issue.id}`}
                      data-selected={active ? "true" : "false"}
                      tabIndex={0}
                      aria-selected={active}
                      onClick={() => setSelectedId(issue.id)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedId(issue.id);
                        }
                      }}
                    >
                      <td>
                        <div>{issue.title}</div>
                        {issue.status === "blocked" && issue.blockedReason ? (
                          <div className="blocked-reason">
                            {issue.blockedReason}
                          </div>
                        ) : null}
                      </td>
                      <td>{issue.projectSlug}</td>
                      <td>{issue.assigneeRole}</td>
                      <td>
                        <span
                          className="status-pill"
                          style={{
                            background: STATUS_COLOR[issue.status],
                          }}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="muted mono">
                        {formatTaipei(issue.updatedAt)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {selected ? (
          <IssueDetailPanel
            issue={selected}
            onClose={() => setSelectedId(null)}
            onSaved={(updated) => setSelectedId(updated.id)}
          />
        ) : (
          <aside
            className="issue-detail-panel empty"
            aria-label="Issue 詳情（未選取）"
            data-testid="issue-detail-empty"
          >
            <p className="muted">點選左側 Issue 以檢視／變更狀態</p>
          </aside>
        )}
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
