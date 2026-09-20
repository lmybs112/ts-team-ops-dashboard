import { describe, expect, it } from "vitest";
import { createFilterStore, DEFAULT_FILTER_STATE } from "./filter.js";

describe("PRD §N.3 Filter State across Office⇄Linear⇄Project⇄Board", () => {
  it("starts with defaults (all / empty query)", () => {
    const store = createFilterStore();
    expect(store.getState()).toEqual(DEFAULT_FILTER_STATE);
  });

  it("persists filters when switching Office → Linear → Project → Board", () => {
    const store = createFilterStore();
    store.setState({
      projectId: "marketing",
      agentId: "frontend",
      status: "blocked",
      query: "card hover",
    });

    for (const view of ["office", "linear", "project", "board"] as const) {
      store.switchView(view);
      expect(store.getView()).toBe(view);
      expect(store.getState()).toEqual({
        projectId: "marketing",
        agentId: "frontend",
        status: "blocked",
        query: "card hover",
      });
    }
  });

  it("entering project writes projectId and keeps it after leaving", () => {
    const store = createFilterStore();
    store.setState({ projectId: "team-ops" });
    store.switchView("project");
    store.switchView("office");
    expect(store.getState().projectId).toBe("team-ops");
  });

  it("Office click agent sets agentId; Linear still filtered", () => {
    const store = createFilterStore();
    store.switchView("office");
    store.setState({ agentId: "qa" });
    store.switchView("linear");
    expect(store.getState().agentId).toBe("qa");
  });

  it("clears only on explicit clear()", () => {
    const store = createFilterStore();
    store.setState({
      projectId: "carousel",
      agentId: "uiux",
      status: "doing",
      query: "x",
    });
    store.switchView("board");
    expect(store.getState().query).toBe("x");
    store.clear();
    expect(store.getState()).toEqual(DEFAULT_FILTER_STATE);
  });
});
