import { describe, expect, it } from "vitest";
import { STATUS_COLOR } from "./constants.js";

/** Relative luminance (sRGB) per WCAG 2.x. */
function relativeLuminance(hex: string): number {
  const raw = hex.replace("#", "");
  const n = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw;
  const channels = [0, 2, 4].map((i) => {
    const v = Number.parseInt(n.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0]! + 0.7152 * channels[1]! + 0.0722 * channels[2]!;
}

function contrastRatio(fg: string, bg: string): number {
  const L1 = relativeLuminance(fg);
  const L2 = relativeLuminance(bg);
  const lighter = Math.max(L1, L2);
  const darker = Math.min(L1, L2);
  return (lighter + 0.05) / (darker + 0.05);
}

describe("a11y color contracts (office shell)", () => {
  it("STATUS_COLOR.done is deep enough for white text (≥ 4.5:1)", () => {
    expect(STATUS_COLOR.done).toBe("#15803d");
    expect(contrastRatio("#ffffff", STATUS_COLOR.done)).toBeGreaterThanOrEqual(4.5);
  });

  it("control border gray reaches ≥ 3:1 on white (non-text)", () => {
    // Mirrors --border in globals.css after A11Y-OS-003
    const border = "#6b7280";
    expect(contrastRatio(border, "#ffffff")).toBeGreaterThanOrEqual(3);
    expect(contrastRatio(border, "#fafafa")).toBeGreaterThanOrEqual(3);
  });
});
