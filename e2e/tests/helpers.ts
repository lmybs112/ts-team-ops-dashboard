import { expect, type Page } from "@playwright/test";

/** Prototype (Pages HTML) vs apps/web dual-view shell. */
export async function isPrototype(page: Page): Promise<boolean> {
  return (await page.locator("#tabOffice").count()) > 0;
}

export async function gotoApp(page: Page) {
  await page.goto("./", { waitUntil: "domcontentloaded" });
  if (await isPrototype(page)) {
    await expect(page.locator("#tabOffice")).toBeVisible();
  } else {
    await expect(
      page.getByRole("link", { name: /View Office/i }).or(
        page.getByRole("navigation", { name: /視圖/ }),
      ),
    ).toBeVisible({ timeout: 15_000 });
  }
}

export async function switchToOffice(page: Page) {
  if (await isPrototype(page)) {
    await page.locator("#tabOffice").click();
    await expect(page.locator("#view-office")).toHaveClass(/active/);
  } else {
    await page.getByRole("link", { name: /View Office/i }).click();
    await expect(page.getByRole("link", { name: /View Office/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
}

export async function switchToLinear(page: Page) {
  if (await isPrototype(page)) {
    await page.locator("#tabLinear").click();
    await expect(page.locator("#view-linear")).toHaveClass(/active/);
  } else {
    await page.getByRole("link", { name: /View Linear/i }).click();
    await expect(page.getByRole("link", { name: /View Linear/i })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }
}

/** Mark window so we can assert SPA-style switch (no full document reload). */
export async function markDocument(page: Page): Promise<string> {
  const token = `e2e-${Date.now()}`;
  await page.evaluate((t) => {
    (window as unknown as { __E2E_MARK?: string }).__E2E_MARK = t;
  }, token);
  return token;
}

export async function documentMark(page: Page): Promise<string | undefined> {
  return page.evaluate(
    () => (window as unknown as { __E2E_MARK?: string }).__E2E_MARK,
  );
}

export async function selectProjectFilter(page: Page, projectId: string) {
  if (await isPrototype(page)) {
    const officeActive = await page.locator("#view-office.active").count();
    if (officeActive) {
      const pill = page.locator("#officePills button").filter({
        hasText: new RegExp(`^${projectId}\\b`, "i"),
      });
      await expect(pill).toBeVisible();
      await pill.click();
      await expect(pill).toHaveClass(/active/);
    } else {
      const item = page.locator(`#projList button[data-id="${projectId}"]`);
      await expect(item).toBeVisible();
      await item.click();
      await expect(item).toHaveClass(/active/);
    }
  } else {
    await page.getByTestId("filter-project").selectOption(projectId);
    await expect(page.getByTestId("filter-project")).toHaveValue(projectId);
  }
}

export async function readProjectFilter(page: Page): Promise<string | null> {
  if (await isPrototype(page)) {
    const hash = await page.evaluate(() => location.hash);
    const params = new URLSearchParams(hash.replace(/^#/, ""));
    const fromHash = params.get("project");
    if (fromHash) return fromHash;
    const activePill = page.locator("#officePills button.active");
    if ((await activePill.count()) > 0) {
      const text = (await activePill.first().innerText()).trim();
      return text.split(/[·\s]/)[0] || null;
    }
    const activeProj = page.locator("#projList button.active");
    if ((await activeProj.count()) > 0) {
      return activeProj.first().getAttribute("data-id");
    }
    return "all";
  }
  return page.getByTestId("filter-project").inputValue();
}
