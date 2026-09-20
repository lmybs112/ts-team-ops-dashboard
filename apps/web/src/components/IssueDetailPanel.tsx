"use client";

import { useEffect, useState } from "react";
import type { Issue, IssueStatus } from "@team-hq/api-contract";
import { useAuthActor } from "../auth/AuthActorProvider";
import { STATUSES, STATUS_COLOR } from "../lib/constants";
import {
  applyIssuePatch,
  clientBlockedReasonError,
  type MutationFailure,
} from "../lib/issue-mutations";

const EDITABLE_STATUSES = STATUSES.filter(
  (s): s is { id: IssueStatus; label: string } => s.id !== "all",
);

type Props = {
  issue: Issue;
  onClose: () => void;
  /** Called after a successful patch so parent can sync selection. */
  onSaved?: (issue: Issue) => void;
};

export function IssueDetailPanel({ issue, onClose, onSaved }: Props) {
  const { actorId } = useAuthActor();
  const [status, setStatus] = useState<IssueStatus>(issue.status);
  const [blockedReason, setBlockedReason] = useState(
    issue.blockedReason ?? "",
  );
  const [error, setError] = useState<MutationFailure | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setStatus(issue.status);
    setBlockedReason(issue.blockedReason ?? "");
    setError(null);
  }, [issue.id, issue.status, issue.blockedReason]);

  function handleSave() {
    const draft = { status, blockedReason };
    const clientErr = clientBlockedReasonError(draft);
    if (clientErr) {
      setError(clientErr);
      return;
    }

    setSaving(true);
    setError(null);
    const result = applyIssuePatch(actorId, issue.id, {
      status,
      blockedReason: status === "blocked" ? blockedReason.trim() : null,
    });
    setSaving(false);

    if (!result.ok) {
      setError(result);
      return;
    }
    onSaved?.(result.issue);
  }

  return (
    <aside
      className="issue-detail-panel"
      aria-label="Issue 詳情"
      data-testid="issue-detail-panel"
    >
      <div className="issue-detail-header">
        <h2 className="issue-detail-title">{issue.title}</h2>
        <button
          type="button"
          className="btn-clear"
          onClick={onClose}
          data-testid="issue-detail-close"
          aria-label="關閉詳情"
        >
          關閉
        </button>
      </div>

      <dl className="issue-detail-meta">
        <div>
          <dt>ID</dt>
          <dd className="mono">{issue.id}</dd>
        </div>
        <div>
          <dt>專案</dt>
          <dd>{issue.projectSlug}</dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>{issue.assigneeRole}</dd>
        </div>
        <div>
          <dt>目前狀態</dt>
          <dd>
            <span
              className="status-pill"
              style={{ background: STATUS_COLOR[issue.status] }}
            >
              {issue.status}
            </span>
          </dd>
        </div>
      </dl>

      <form
        className="issue-detail-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
      >
        <label className="field">
          <span>狀態</span>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as IssueStatus)}
            data-testid="issue-status-select"
            aria-label="變更狀態"
          >
            {EDITABLE_STATUSES.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}（{s.id}）
              </option>
            ))}
          </select>
        </label>

        {status === "blocked" ? (
          <label className="field">
            <span>
              阻塞原因 <abbr title="必填">*</abbr>
            </span>
            <input
              type="text"
              value={blockedReason}
              maxLength={120}
              required
              placeholder="說明為何 blocked（≤120）"
              onChange={(e) => setBlockedReason(e.target.value)}
              data-testid="issue-blocked-reason"
              aria-required="true"
            />
          </label>
        ) : null}

        {error ? (
          <div
            className="api-error"
            role="alert"
            data-testid="issue-api-error"
          >
            <strong>{error.status}</strong>{" "}
            <code>{error.code}</code>
            <div>{error.message}</div>
            <div className="sr-only">{error.display}</div>
          </div>
        ) : null}

        <div className="issue-detail-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={saving}
            data-testid="issue-save"
          >
            {saving ? "儲存中…" : "儲存"}
          </button>
        </div>
      </form>
    </aside>
  );
}
