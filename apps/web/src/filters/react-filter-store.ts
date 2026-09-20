import {
  createFilterStore,
  type FilterState,
  type ViewId,
} from "@team-hq/domain";

export type ReactFilterStore = {
  getState: () => FilterState;
  setState: (partial: Partial<FilterState>) => void;
  clear: () => void;
  switchView: (view: ViewId) => void;
  getView: () => ViewId;
  subscribe: (listener: () => void) => () => void;
};

/**
 * Wraps domain `createFilterStore` with a subscribe API for React.
 * `switchView` must NOT reset filters (domain invariant).
 */
export function createReactFilterStore(
  initial?: Partial<FilterState> & { view?: ViewId },
): ReactFilterStore {
  const store = createFilterStore();
  if (initial) {
    const { view, ...filters } = initial;
    if (Object.keys(filters).length > 0) {
      store.setState(filters);
    }
    if (view) {
      store.switchView(view);
    }
  }

  const listeners = new Set<() => void>();
  const notify = () => {
    for (const listener of listeners) listener();
  };

  return {
    getState: () => store.getState(),
    getView: () => store.getView(),
    setState: (partial) => {
      store.setState(partial);
      notify();
    },
    clear: () => {
      store.clear();
      notify();
    },
    switchView: (view) => {
      store.switchView(view);
      notify();
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}
