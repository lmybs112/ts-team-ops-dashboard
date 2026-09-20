"use client";

import { useMemo } from "react";
import { aggregateAgentStatus } from "@team-hq/domain";
import { useFilter } from "../filters/FilterProvider";
import { AGENT_ROLES, AGENTS, STATUS_COLOR } from "../lib/constants";
import { filterIssues } from "../lib/filter-issues";
import { listAllIssues } from "../lib/ops-client";

export function OfficeView() {
  const { state, setState } = useFilter();
  const issues = useMemo(() => listAllIssues(), []);

  const scoped = useMemo(() => {
    // Office cards: apply project/status/query; agent filter highlights selection
    return filterIssues(issues, { ...state, agentId: "all" });
  }, [issues, state]);

  return (
    <section className="office-view" aria-label="View Office">
      <h1 className="view-title">辦公室</h1>
      <p className="muted">
        點選 Agent 設定篩選；切到 Linear 時列表會保留相同 Filter State。
      </p>
      <div className="agent-grid">
        {AGENT_ROLES.map((role) => {
          const roleIssues = scoped.filter((i) => i.assigneeRole === role);
          const agg = aggregateAgentStatus(roleIssues, {
            projectSlug:
              state.projectId !== "all" ? state.projectId : undefined,
          });
          const label =
            AGENTS.find((a) => a.id === role)?.label ?? role;
          const selected = state.agentId === role;
          return (
            <button
              key={role}
              type="button"
              className={selected ? "agent-card selected" : "agent-card"}
              onClick={() =>
                setState({ agentId: selected ? "all" : role })
              }
              data-testid={`agent-card-${role}`}
              aria-pressed={selected}
            >
              <div className="agent-avatar" aria-hidden>
                {label.slice(0, 2)}
              </div>
              <div className="agent-meta">
                <strong>{label}</strong>
                <span
                  className="status-pill"
                  style={{ background: STATUS_COLOR[agg.status] }}
                >
                  {agg.status}
                </span>
              </div>
              <div className="agent-count muted">
                {roleIssues.length} 任務
                {agg.blockedReasonSummary
                  ? ` · ${agg.blockedReasonSummary}`
                  : ""}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
