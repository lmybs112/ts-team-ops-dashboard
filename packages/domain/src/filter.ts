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

export function createFilterStore(): {
  getState: () => FilterState;
  setState: (partial: Partial<FilterState>) => void;
  clear: () => void;
  switchView: (view: ViewId) => void;
  getView: () => ViewId;
} {
  let state: FilterState = { ...DEFAULT_FILTER_STATE };
  let view: ViewId = "office";
  return {
    getState: () => ({ ...state }),
    setState: (partial) => {
      state = { ...state, ...partial };
    },
    clear: () => {
      state = { ...DEFAULT_FILTER_STATE };
    },
    switchView: (next) => {
      view = next;
    },
    getView: () => view,
  };
}
