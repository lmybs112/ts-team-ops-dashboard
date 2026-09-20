"use client";

import { AGENTS, PROJECTS, STATUSES } from "../lib/constants";
import { useFilter } from "../filters/FilterProvider";

export function FilterBar() {
  const { state, setState, clear } = useFilter();

  return (
    <div className="filter-bar" role="search" aria-label="共用篩選">
      <label>
        <span className="sr-only">專案</span>
        <select
          value={state.projectId}
          onChange={(e) => setState({ projectId: e.target.value })}
          data-testid="filter-project"
        >
          {PROJECTS.map((p) => (
            <option key={p.slug} value={p.slug}>
              {p.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">Agent</span>
        <select
          value={state.agentId}
          onChange={(e) => setState({ agentId: e.target.value })}
          data-testid="filter-agent"
        >
          {AGENTS.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </select>
      </label>

      <label>
        <span className="sr-only">狀態</span>
        <select
          value={state.status}
          onChange={(e) => setState({ status: e.target.value })}
          data-testid="filter-status"
        >
          {STATUSES.map((s) => (
            <option key={s.id} value={s.id}>
              {s.label}
            </option>
          ))}
        </select>
      </label>

      <label className="filter-query">
        <span className="sr-only">搜尋</span>
        <input
          type="search"
          placeholder="搜尋標題…"
          value={state.query}
          onChange={(e) => setState({ query: e.target.value })}
          data-testid="filter-query"
        />
      </label>

      <button
        type="button"
        className="btn-clear"
        onClick={() => clear()}
        data-testid="filter-clear"
      >
        清除篩選
      </button>
    </div>
  );
}
