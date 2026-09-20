import { describe, expect, it, vi } from "vitest";
import { DEFAULT_FILTER_STATE } from "@team-hq/domain";
import { createReactFilterStore } from "./react-filter-store.js";

describe("web Filter shell — shared Filter State across Office⇄Linear", () => {
  it("starts with domain defaults and office view", () => {
    const store = createReactFilterStore();
    expect(store.getState()).toEqual(DEFAULT_FILTER_STATE);
    expect(store.getView()).toBe("office");
  });

  it("keeps projectId / agentId / status / query when switching Office → Linear", () => {
    const store = createReactFilterStore();
    store.setState({
      projectId: "marketing",
      agentId: "frontend",
      status: "blocked",
      query: "card hover",
    });

    store.switchView("linear");

    expect(store.getView()).toBe("linear");
    expect(store.getState()).toEqual({
      projectId: "marketing",
      agentId: "frontend",
      status: "blocked",
      query: "card hover",
    });
  });

  it("keeps filters when switching Linear → Office (round-trip)", () => {
    const store = createReactFilterStore();
    store.setState({
      projectId: "team-ops",
      agentId: "qa",
      status: "doing",
      query: "ingest",
    });
    store.switchView("linear");
    store.switchView("office");

    expect(store.getView()).toBe("office");
    expect(store.getState()).toEqual({
      projectId: "team-ops",
      agentId: "qa",
      status: "doing",
      query: "ingest",
    });
  });

  it("clears filters only on explicit clear(), not on switchView", () => {
    const store = createReactFilterStore();
    store.setState({
      projectId: "carousel",
      agentId: "uiux",
      status: "todo",
      query: "x",
    });
    store.switchView("linear");
    expect(store.getState().query).toBe("x");

    store.clear();
    expect(store.getState()).toEqual(DEFAULT_FILTER_STATE);
    expect(store.getView()).toBe("linear");
  });

  it("view switcher updates view id without resetting filters", () => {
    const store = createReactFilterStore();
    store.setState({ agentId: "devops" });
    store.switchView("office");
    expect(store.getView()).toBe("office");
    store.switchView("linear");
    expect(store.getView()).toBe("linear");
    expect(store.getState().agentId).toBe("devops");
  });

  it("notifies subscribers on setState / switchView / clear", () => {
    const store = createReactFilterStore();
    const listener = vi.fn();
    const unsubscribe = store.subscribe(listener);

    store.setState({ query: "a" });
    store.switchView("linear");
    store.clear();
    expect(listener).toHaveBeenCalledTimes(3);

    unsubscribe();
    store.setState({ query: "b" });
    expect(listener).toHaveBeenCalledTimes(3);
  });
});
