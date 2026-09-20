"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { FilterState, ViewId } from "@team-hq/domain";
import {
  createReactFilterStore,
  type ReactFilterStore,
} from "./react-filter-store";

type FilterContextValue = {
  store: ReactFilterStore;
  state: FilterState;
  view: ViewId;
  setState: (partial: Partial<FilterState>) => void;
  clear: () => void;
  switchView: (view: ViewId) => void;
};

const FilterContext = createContext<FilterContextValue | null>(null);

export function FilterProvider({
  children,
  store: externalStore,
}: {
  children: ReactNode;
  /** Optional inject for tests. */
  store?: ReactFilterStore;
}) {
  const store = useMemo(
    () => externalStore ?? createReactFilterStore(),
    [externalStore],
  );

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );
  const view = useSyncExternalStore(
    store.subscribe,
    store.getView,
    store.getView,
  );

  const setState = useCallback(
    (partial: Partial<FilterState>) => store.setState(partial),
    [store],
  );
  const clear = useCallback(() => store.clear(), [store]);
  const switchView = useCallback(
    (next: ViewId) => store.switchView(next),
    [store],
  );

  const value = useMemo(
    () => ({ store, state, view, setState, clear, switchView }),
    [store, state, view, setState, clear, switchView],
  );

  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilter(): FilterContextValue {
  const ctx = useContext(FilterContext);
  if (!ctx) {
    throw new Error("useFilter must be used within FilterProvider");
  }
  return ctx;
}
