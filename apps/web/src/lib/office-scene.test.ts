import { describe, expect, it } from "vitest";
import { createReactFilterStore } from "../filters/react-filter-store.js";
import {
  OFFICE_HOTSPOTS,
  agentIdAfterDrawerClose,
  agentIdAfterHotspotClick,
  catAssetIdToRole,
  catImageSrc,
  roleToCatAssetId,
} from "./office-scene.js";

describe("office scene — role ↔ cat asset id", () => {
  it("maps frontend → fe and backend → be for asset filenames", () => {
    expect(roleToCatAssetId("frontend")).toBe("fe");
    expect(roleToCatAssetId("backend")).toBe("be");
    expect(roleToCatAssetId("cto")).toBe("cto");
    expect(roleToCatAssetId("qa")).toBe("qa");
  });

  it("maps fe/be asset ids back to domain roles", () => {
    expect(catAssetIdToRole("fe")).toBe("frontend");
    expect(catAssetIdToRole("be")).toBe("backend");
    expect(catAssetIdToRole("pm")).toBe("pm");
  });

  it("builds public cat image paths with prototype stems", () => {
    expect(catImageSrc("frontend")).toBe("/office/cats/cat-fe.png");
    expect(catImageSrc("backend")).toBe("/office/cats/cat-be.png");
    expect(catImageSrc("uiux")).toBe("/office/cats/cat-uiux.png");
  });

  it("exposes seven hotspots with prototype percent layout", () => {
    expect(OFFICE_HOTSPOTS).toHaveLength(7);
    const byRole = Object.fromEntries(
      OFFICE_HOTSPOTS.map((h) => [h.role, h]),
    );
    expect(byRole.cto).toMatchObject({
      x: 7.5,
      y: 18,
      w: 20,
      h: 40,
      assetId: "cto",
    });
    expect(byRole.frontend).toMatchObject({
      x: 70.5,
      y: 18,
      w: 20,
      h: 40,
      assetId: "fe",
    });
    expect(byRole.backend).toMatchObject({
      x: 17,
      y: 52,
      w: 21,
      h: 36,
      assetId: "be",
    });
    expect(byRole.devops).toMatchObject({
      x: 61.5,
      y: 52,
      w: 21,
      h: 36,
      assetId: "devops",
    });
  });
});

describe("office scene — hotspot / drawer Filter State", () => {
  it("hotspot click sets agentId (opens drawer)", () => {
    expect(agentIdAfterHotspotClick("all", "frontend")).toBe("frontend");
    expect(agentIdAfterHotspotClick("qa", "devops")).toBe("devops");
  });

  it("closing drawer clears agentId to all", () => {
    expect(agentIdAfterDrawerClose("frontend")).toBe("all");
  });

  it("selecting hotspot updates shared filter store agentId", () => {
    const store = createReactFilterStore();
    store.setState({
      projectId: "marketing",
      status: "blocked",
      query: "feed",
    });

    const next = agentIdAfterHotspotClick(store.getState().agentId, "frontend");
    store.setState({ agentId: next });

    expect(store.getState()).toEqual({
      projectId: "marketing",
      agentId: "frontend",
      status: "blocked",
      query: "feed",
    });

    store.switchView("linear");
    expect(store.getState().agentId).toBe("frontend");

    store.setState({
      agentId: agentIdAfterDrawerClose(store.getState().agentId),
    });
    expect(store.getState().agentId).toBe("all");
    expect(store.getState().projectId).toBe("marketing");
  });
});
