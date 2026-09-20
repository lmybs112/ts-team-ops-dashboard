import { test, expect } from "@playwright/test";
import {
  gotoApp,
  isPrototype,
  switchToLinear,
  switchToOffice,
} from "./helpers";

/**
 * Status smoke — blocked/status chips or agent status visible (PRD S2/status)
 */
test.describe("P0 status visibility smoke", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test("Office: blocked legend/hotspot or status chip visible", async ({
    page,
  }) => {
    await switchToOffice(page);

    if (await isPrototype(page)) {
      await expect(page.locator(".legend .lg-blocked")).toBeVisible();
      const blockedHot = page.locator(".hot.blocked-hot, .chip-st.chip-blocked");
      await expect(blockedHot.first()).toBeVisible({ timeout: 10_000 });
    } else {
      const cards = page.locator('[data-testid^="agent-card-"]');
      await expect(cards.first()).toBeVisible();
      await expect(page.locator("body")).toContainText(/blocked|阻塞|status/i);
    }
  });

  test("Linear: status seg + blocked badge/row visible", async ({ page }) => {
    await switchToLinear(page);

    if (await isPrototype(page)) {
      const blockedBtn = page.locator(
        '#statusSeg button[data-status="blocked"]',
      );
      await expect(blockedBtn).toBeVisible();
      await blockedBtn.click();
      await expect(blockedBtn).toHaveClass(/active/);

      const blockedRow = page.locator(
        "#issuesBody tr.is-blocked, #issuesBody .badge-blocked, #issuesCards .is-blocked",
      );
      await expect(blockedRow.first()).toBeVisible({ timeout: 10_000 });
    } else {
      await page.getByTestId("filter-status").selectOption("blocked");
      await expect(page.getByTestId("filter-status")).toHaveValue("blocked");
      await expect(page.getByTestId("issue-table")).toBeVisible();
    }
  });
});
