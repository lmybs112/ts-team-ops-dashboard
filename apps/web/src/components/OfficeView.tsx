"use client";

import Link from "next/link";
import { useMemo } from "react";
import type { AssigneeRole, Issue, IssueStatus } from "@team-hq/api-contract";
import { aggregateAgentStatus } from "@team-hq/domain";
import { useFilter } from "../filters/FilterProvider";
import { AGENT_ROLES, AGENTS, STATUS_COLOR, STATUSES } from "../lib/constants";
import { filterIssues } from "../lib/filter-issues";
import {
  OFFICE_HOTSPOTS,
  OFFICE_SCENE_SRC,
  agentIdAfterDrawerClose,
  agentIdAfterHotspotClick,
  catImageSrc,
} from "../lib/office-scene";
import { listAllIssues } from "../lib/ops-client";

function roleLabel(role: AssigneeRole): string {
  return AGENTS.find((a) => a.id === role)?.label ?? role;
}

function statusLabel(status: IssueStatus): string {
  return STATUSES.find((s) => s.id === status)?.label ?? status;
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

function AgentDrawer({
  role,
  issues,
  projectId,
  onClose,
}: {
  role: AssigneeRole;
  issues: Issue[];
  projectId: string;
  onClose: () => void;
}) {
  const agg = aggregateAgentStatus(issues, {
    projectSlug: projectId !== "all" ? projectId : undefined,
  });

  return (
    <>
      <button
        type="button"
        className="drawer-backdrop show"
        aria-label="關閉詳情"
        onClick={onClose}
        data-testid="office-drawer-backdrop"
      />
      <aside
        className="office-drawer open"
        aria-label={`${roleLabel(role)} 詳情`}
        data-testid="office-drawer"
      >
        <div className="drawer-head">
          <div className="drawer-head-main">
            <img className="drawer-avatar" src={catImageSrc(role)} alt="" />
            <div>
              <h2>{roleLabel(role)}</h2>
              <p className="sub">今日任務 · 執行狀態</p>
            </div>
          </div>
          <button
            type="button"
            className="close-x"
            onClick={onClose}
            aria-label="關閉"
            data-testid="office-drawer-close"
          >
            ×
          </button>
        </div>
        <div className="drawer-body">
          <div className="exec-card">
            <div className="exec-label">執行狀態</div>
            <div className="exec-row">
              <span
                className="status-pill"
                style={{ background: STATUS_COLOR[agg.status] }}
              >
                {statusLabel(agg.status)}
              </span>
              <span className="muted">
                {issues.filter((i) => i.status === "done").length}/
                {Math.max(issues.length, 1)} 完成
              </span>
            </div>
            {agg.blockedReasonSummary ? (
              <p className="blocked-reason">{agg.blockedReasonSummary}</p>
            ) : null}
          </div>

          {(["blocked", "doing", "todo", "done"] as const).map((st) => {
            const list = issues.filter((i) => i.status === st);
            if (!list.length) return null;
            return (
              <div key={st} className="drawer-sec">
                <h3>
                  {statusLabel(st)} · {list.length}
                </h3>
                <ul className="task-list">
                  {list.map((issue) => (
                    <li
                      key={issue.id}
                      className={
                        issue.status === "blocked" ? "is-blocked" : undefined
                      }
                    >
                      <div className="t-top">
                        <strong>{issue.title}</strong>
                        <span
                          className="status-pill"
                          style={{ background: STATUS_COLOR[issue.status] }}
                        >
                          {statusLabel(issue.status)}
                        </span>
                      </div>
                      <span className="meta muted">
                        專案：{issue.projectSlug}
                        <br />
                        更新：{formatTaipei(issue.updatedAt)}
                      </span>
                      {issue.status === "blocked" && issue.blockedReason ? (
                        <div className="blocked-reason">
                          {issue.blockedReason}
                        </div>
                      ) : null}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          {issues.length === 0 ? (
            <p className="muted">此 Agent 目前沒有符合篩選的任務</p>
          ) : null}

          <div className="drawer-actions">
            <Link href="/linear" className="btn-clear">
              在 Linear 看
            </Link>
            <button type="button" className="btn-clear" onClick={onClose}>
              關閉
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function OfficeView() {
  const { state, setState } = useFilter();
  const issues = useMemo(() => listAllIssues(), []);

  const scoped = useMemo(() => {
    return filterIssues(issues, { ...state, agentId: "all" });
  }, [issues, state]);

  const selectedRole =
    state.agentId !== "all" ? (state.agentId as AssigneeRole) : null;

  const selectedIssues = useMemo(() => {
    if (!selectedRole) return [] as Issue[];
    return scoped.filter((i) => i.assigneeRole === selectedRole);
  }, [scoped, selectedRole]);

  function openAgent(role: AssigneeRole) {
    setState({ agentId: agentIdAfterHotspotClick(state.agentId, role) });
  }

  function closeDrawer() {
    setState({ agentId: agentIdAfterDrawerClose(state.agentId) });
  }

  return (
    <section className="office-view" aria-label="View Office">
      <div className="office-desktop">
        <div className="office-stage-wrap">
          <div
            className="office-stage"
            style={{ backgroundImage: `url(${OFFICE_SCENE_SRC})` }}
            data-testid="office-stage"
          >
            <div className="office-hud" aria-hidden="true">
              <div className="hud-card">
                <h3>狀態</h3>
                <div className="legend">
                  {(
                    [
                      ["todo", "待處理"],
                      ["doing", "進行中"],
                      ["blocked", "阻塞"],
                      ["done", "完成"],
                    ] as const
                  ).map(([id, label]) => (
                    <span key={id}>
                      <i style={{ background: STATUS_COLOR[id] }} />
                      {label}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="hotspots">
              {OFFICE_HOTSPOTS.map((hot) => {
                const roleIssues = scoped.filter(
                  (i) => i.assigneeRole === hot.role,
                );
                const agg = aggregateAgentStatus(roleIssues, {
                  projectSlug:
                    state.projectId !== "all" ? state.projectId : undefined,
                });
                const label = roleLabel(hot.role);
                const selected = state.agentId === hot.role;
                const dimmed =
                  state.agentId !== "all" && state.agentId !== hot.role;
                const primary = roleIssues.find((i) => i.status === agg.status);
                return (
                  <button
                    key={hot.role}
                    type="button"
                    className={
                      "hot" +
                      (selected ? " selected" : "") +
                      (dimmed ? " dim" : "") +
                      (agg.status === "blocked" ? " blocked-hot" : "")
                    }
                    style={{
                      left: `${hot.x}%`,
                      top: `${hot.y}%`,
                      width: `${hot.w}%`,
                      height: `${hot.h}%`,
                    }}
                    onClick={() => openAgent(hot.role)}
                    data-testid={`hotspot-${hot.role}`}
                    aria-label={label}
                    aria-pressed={selected}
                  >
                    <img
                      className="hot-cat"
                      src={catImageSrc(hot.role)}
                      alt=""
                      draggable={false}
                    />
                    <span className="label-stack">
                      {agg.status === "blocked" && agg.blockedReasonSummary ? (
                        <span
                          className="reason"
                          title={agg.blockedReasonSummary}
                        >
                          {agg.blockedReasonSummary}
                        </span>
                      ) : null}
                      <span className="tag">
                        <span className="role">{label}</span>
                        {primary ? (
                          <span className="task">{primary.title}</span>
                        ) : null}
                        <span className="chip-st">
                          <i style={{ background: STATUS_COLOR[agg.status] }} />
                          {statusLabel(agg.status)}
                        </span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedRole ? (
              <AgentDrawer
                role={selectedRole}
                issues={selectedIssues}
                projectId={state.projectId}
                onClose={closeDrawer}
              />
            ) : null}
          </div>

          <nav className="office-dock" aria-label="Agent dock">
            <div className="dock-inner">
              {OFFICE_HOTSPOTS.map((hot) => {
                const roleIssues = scoped.filter(
                  (i) => i.assigneeRole === hot.role,
                );
                const agg = aggregateAgentStatus(roleIssues, {
                  projectSlug:
                    state.projectId !== "all" ? state.projectId : undefined,
                });
                const label = roleLabel(hot.role);
                const selected = state.agentId === hot.role;
                return (
                  <button
                    key={hot.role}
                    type="button"
                    className={selected ? "active" : undefined}
                    title={label}
                    aria-label={label}
                    aria-pressed={selected}
                    data-testid={`dock-${hot.role}`}
                    onClick={() => openAgent(hot.role)}
                  >
                    <img
                      src={catImageSrc(hot.role)}
                      alt=""
                      draggable={false}
                    />
                    <i
                      className={
                        agg.status === "blocked" ? "dot blocked-dot" : "dot"
                      }
                      style={{ background: STATUS_COLOR[agg.status] }}
                    />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </div>
      </div>

      <div className="office-mobile">
        <h1 className="view-title">辦公室</h1>
        <p className="muted">點選 Agent 開啟詳情；桌面版顯示 3D 場景。</p>
        <div className="agent-grid">
          {AGENT_ROLES.map((role) => {
            const roleIssues = scoped.filter((i) => i.assigneeRole === role);
            const agg = aggregateAgentStatus(roleIssues, {
              projectSlug:
                state.projectId !== "all" ? state.projectId : undefined,
            });
            const label = roleLabel(role);
            const selected = state.agentId === role;
            return (
              <button
                key={role}
                type="button"
                className={selected ? "agent-card selected" : "agent-card"}
                onClick={() => openAgent(role)}
                data-testid={`agent-card-${role}`}
                aria-pressed={selected}
              >
                <img
                  className="agent-avatar-img"
                  src={catImageSrc(role)}
                  alt=""
                />
                <div className="agent-meta">
                  <strong>{label}</strong>
                  <span
                    className="status-pill"
                    style={{ background: STATUS_COLOR[agg.status] }}
                  >
                    {statusLabel(agg.status)}
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

        {selectedRole ? (
          <div className="office-mobile-drawer">
            <AgentDrawer
              role={selectedRole}
              issues={selectedIssues}
              projectId={state.projectId}
              onClose={closeDrawer}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}
