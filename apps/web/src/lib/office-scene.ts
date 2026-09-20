import type { AssigneeRole } from "@team-hq/api-contract";

/** Prototype asset ids under `public/office/cats/cat-{id}.png`. */
export type CatAssetId =
  | "cto"
  | "pm"
  | "uiux"
  | "fe"
  | "be"
  | "qa"
  | "devops";

export type HotspotLayout = {
  role: AssigneeRole;
  /** Filename stem for cat PNG (prototype uses fe/be). */
  assetId: CatAssetId;
  /** Percent of stage: left, top, width, height. */
  x: number;
  y: number;
  w: number;
  h: number;
};

/**
 * Domain AssigneeRole ↔ prototype cat asset id.
 * Domain uses `frontend`/`backend`; assets are `cat-fe.png` / `cat-be.png`.
 */
export function roleToCatAssetId(role: AssigneeRole): CatAssetId {
  switch (role) {
    case "frontend":
      return "fe";
    case "backend":
      return "be";
    default:
      return role;
  }
}

export function catAssetIdToRole(assetId: CatAssetId): AssigneeRole {
  switch (assetId) {
    case "fe":
      return "frontend";
    case "be":
      return "backend";
    default:
      return assetId;
  }
}

export function catImageSrc(role: AssigneeRole): string {
  return `/office/cats/cat-${roleToCatAssetId(role)}.png`;
}

export const OFFICE_SCENE_SRC = "/office/scene/office-scene-3d.png";

/** Hotspot positions from prototype ROLES (percent). */
export const OFFICE_HOTSPOTS: readonly HotspotLayout[] = [
  { role: "cto", assetId: "cto", x: 7.5, y: 18, w: 20, h: 40 },
  { role: "pm", assetId: "pm", x: 28.5, y: 18, w: 20, h: 40 },
  { role: "uiux", assetId: "uiux", x: 49.5, y: 18, w: 20, h: 40 },
  { role: "frontend", assetId: "fe", x: 70.5, y: 18, w: 20, h: 40 },
  { role: "backend", assetId: "be", x: 17, y: 52, w: 21, h: 36 },
  { role: "qa", assetId: "qa", x: 39.5, y: 52, w: 21, h: 36 },
  { role: "devops", assetId: "devops", x: 61.5, y: 52, w: 21, h: 36 },
] as const;

/** Selecting a hotspot sets agentId; closing drawer clears when matching. */
export function agentIdAfterHotspotClick(
  _current: string,
  clicked: AssigneeRole,
): AssigneeRole {
  return clicked;
}

export function agentIdAfterDrawerClose(_current: string): "all" {
  return "all";
}
