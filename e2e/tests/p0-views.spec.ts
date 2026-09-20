import { test, expect } from "@playwright/test";
import {
  documentMark,
  gotoApp,
  isPrototype,
  markDocument,
  readProjectFilter,
  selectProjectFilter,
  switchToLinear,
  switchToOffice,
} from "./helpers";

/**
 * E2E-V01..V05 — Office / Linear dual-view (PRD S1 / S8 / S9 / S11)
 */
test.describe("P0 views Office-Linear (E2E-V01-V05)", () => {
  test.beforeEach(async ({ page }) => {
    await gotoApp(page);
  });

  test("E2E-V01: Office/Linear tabs visible and switchable", async ({
    page,
  }) => {
    if (await isPrototype(page)) {
      const office = page.getByRole("tab", { name: /^Office$/i });
      const linear = page.getByRole("tab", { name: /^Linear$/i });
      await expect(office).toBeVisible();
      await expect(linear).toBeVisible();
      await expect(page.locator("#tabOffice")).toBeVisible();
      await expect(page.locator("#tabLinear")).toBeVisible();

      await linear.click();
      await expect(page.locator("#tabLinear")).toHaveAttribute(
        "aria-selected",
        "true",
      );
      await office.click();
      await expect(page.locator("#tabOffice")).toHaveAttribute(
        "aria-selected",
        "true",
      );
    } else {
      await expect(page.getByRole("link", { name: /View Office/i })).toBeVisible();
      await expect(page.getByRole("link", { name: /View Linear/i })).toBeVisible();
      await switchToLinear(page);
      await switchToOffice(page);
    }
  });

  test("E2E-V02: switch to Office shows view-office active (full office)", async ({
    page,
  }) => {
    await switchToLinear(page);
    await switchToOffice(page);

    if (await isPrototype(page)) {
      const office = page.locator("#view-office");
      await expect(office).toHaveClass(/active/);
      await expect(office).toBeVisible();
      await expect(office.locator(".office-stage")).toBeVisible();
      await expect(page.locator("#officePills")).toBeVisible();
      await expect(page.locator("#hotspots")).toBeVisible();
    } else {
      await expect(
        page.getByRole("region", { name: /View Office/i }).or(
          page.locator(".office-view"),
        ),
      ).toBeVisible();
    }
  });

  test("E2E-V03: switch to Linear shows view-linear active; Issues/Projects", async ({
    page,
  }) => {
    await switchToLinear(page);

    if (await isPrototype(page)) {
      await expect(page.locator("#view-linear")).toHaveClass(/active/);
      await expect(page.locator("#linearNavIssues")).toBeVisible();
      await expect(page.locator("#linearNavProjects")).toBeVisible();
      await expect(page.locator("#issuesBody")).toBeVisible();
    } else {
      await expect(page.getByTestId("issue-table")).toBeVisible();
    }
  });

  test("E2E-V04: Office to Linear one click; no full reload; filter kept", async ({
    page,
  }) => {
    await switchToOffice(page);
    await selectProjectFilter(page, "marketing");
    const before = await readProjectFilter(page);
    expect(before).toMatch(/marketing/i);

    const token = await markDocument(page);
    await switchToLinear(page);

    expect(await documentMark(page)).toBe(token);

    const after = await readProjectFilter(page);
    expect(after).toMatch(/marketing/i);

    if (await isPrototype(page)) {
      const hash = await page.evaluate(() => location.hash);
      expect(hash).toMatch(/view=linear/);
      expect(hash).toMatch(/project=marketing/);
    }
  });

  test("E2E-V05: Linear to Office keeps project/agent filter", async ({
    page,
  }) => {
    await switchToLinear(page);
    await selectProjectFilter(page, "team-ops");
    expect(await readProjectFilter(page)).toMatch(/team-ops/i);

    const token = await markDocument(page);
    await switchToOffice(page);
    expect(await documentMark(page)).toBe(token);

    expect(await readProjectFilter(page)).toMatch(/team-ops/i);

    if (await isPrototype(page)) {
      const hash = await page.evaluate(() => location.hash);
      expect(hash).toMatch(/view=office/);
      expect(hash).toMatch(/project=team-ops/);
      await expect(
        page.locator("#officePills button.active").filter({
          hasText: /team-ops/i,
        }),
      ).toBeVisible();
    }
  });
});
