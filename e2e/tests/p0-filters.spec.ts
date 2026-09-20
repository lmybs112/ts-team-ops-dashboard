import { test, expect } from "@playwright/test";
import {
  gotoApp,
  isPrototype,
  readProjectFilter,
  selectProjectFilter,
  switchToLinear,
  switchToOffice,
} from "./helpers";

/**
 * E2E-F01 — left/pill project filter applies and survives view switch (PRD S3)
 */
test.describe("P0 filters persist (E2E-F01)", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test("E2E-F01: pick project filter; remains after Office-Linear", async ({
    page,
  }) => {
    await switchToOffice(page);
    await selectProjectFilter(page, "marketing");
    expect(await readProjectFilter(page)).toMatch(/marketing/i);

    await switchToLinear(page);
    expect(await readProjectFilter(page)).toMatch(/marketing/i);

    if (await isPrototype(page)) {
      await expect(
        page.locator('#projList button[data-id="marketing"]'),
      ).toHaveClass(/active/);
      const rows = page.locator("#issuesBody tr");
      await expect(rows.first()).toBeVisible();
      const projectCells = page.locator("#issuesBody tr td:nth-child(2)");
      const count = await projectCells.count();
      expect(count).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        await expect(projectCells.nth(i)).toHaveText(/marketing/i);
      }
    } else {
      await expect(page.getByTestId("filter-project")).toHaveValue("marketing");
    }

    await switchToOffice(page);
    expect(await readProjectFilter(page)).toMatch(/marketing/i);
  });
});
