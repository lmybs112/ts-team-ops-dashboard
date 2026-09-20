/**
 * Filter State stubs (PRD §N.3).
 * projectId / agentId / status / query persist across Office⇄Linear⇄Project⇄Board.
 * Clear only on explicit clear.
 */

export type ViewId = "office" | "linear" | "project" | "board";

export type FilterState = {
  projectId: string;
  agentId: string;
  status: string;
  query: string;
};

export const DEFAULT_FILTER_STATE: FilterState = {
  projectId: "all",
  agentId: "all",
  status: "all",
  query: "",
};

/**
 * Shared filter store across views. Stub: not a real shared store.
 */
export function createFilterStore(): {
  getState: () => FilterState;
  setState: (partial: Partial<FilterState>) => void;
  clear: () => void;
  /** Switch active view without resetting filters */
  switchView: (view: ViewId) => void;
  getView: () => ViewId;
} {
  throw new Error("not implemented: createFilterStore (PRD §N.3)");
}
