import { test, expect } from "@playwright/test";

/**
 * UI Test Suite — Playwright Documentation Site
 *
 * Uses playwright.dev as a stable, publicly accessible target.
 * Demonstrates: navigation, search, cross-browser rendering,
 * responsive layout, and accessibility checks.
 *
 * In a real project, replace BASE_URL with your app's URL
 * and swap selectors to match your component structure.
 */

test.describe("Navigation & Layout", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("https://playwright.dev");
  });

  test("homepage loads and displays correct title", async ({ page }) => {
    await expect(page).toHaveTitle(/Playwright/);
  });

  test("primary documentation link is visible", async ({ page }) => {
    const nav = page.getByRole("navigation");
    await expect(nav).toBeVisible();

    const docsLink = page.getByRole("link", { name: /get started/i }).first();
    await expect(docsLink).toBeVisible();
  });

  test("hero section renders with CTA", async ({ page }) => {
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toBeVisible();

    const getStarted = page
      .getByRole("link", { name: /get started/i })
      .first();
    await expect(getStarted).toBeVisible();
  });

  test("page does not have console errors on load", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      const text = msg.text();
      const isKnownFirefoxSiteNoise = text.includes("InvalidStateError");

      if (msg.type() === "error" && !isKnownFirefoxSiteNoise) {
        errors.push(text);
      }
    });

    await page.goto("https://playwright.dev");
    await page.waitForLoadState("networkidle");

    expect(errors).toHaveLength(0);
  });
});

test.describe("Search Functionality", () => {
  test("search opens and accepts input", async ({ page }) => {
    await page.goto("https://playwright.dev");

    const searchBtn = page.getByRole("button", { name: /search/i });
    await searchBtn.click();

    const searchInput = page.getByRole("searchbox");
    await expect(searchInput).toBeVisible();
    await searchInput.fill("locators");

    await expect(searchInput).toHaveValue("locators");
  });

  test("search results appear for valid query", async ({ page }) => {
    await page.goto("https://playwright.dev");

    const searchBtn = page.getByRole("button", { name: /search/i });
    await searchBtn.click();

    const searchInput = page.getByRole("searchbox");
    await searchInput.fill("page object model");

    const firstResult = page
      .getByRole("option", { name: /page object models/i })
      .first();
    await expect(firstResult).toBeVisible();
  });
});

test.describe("Docs Navigation", () => {
  test("clicking Get started navigates to documentation", async ({ page }) => {
    await page.goto("https://playwright.dev");

    const docsLink = page.getByRole("link", { name: /get started/i }).first();
    await docsLink.click();

    await expect(page).toHaveURL(/docs/);
    await page.waitForLoadState("domcontentloaded");

    const sidebar = page.locator("nav, aside").first();
    await expect(sidebar).toBeVisible();
  });

  test("docs page has working sidebar links", async ({ page }) => {
    await page.goto("https://playwright.dev/docs/intro");

    const sidebarLinks = page.locator("nav a");
    const count = await sidebarLinks.count();
    expect(count).toBeGreaterThan(5);
  });
});

test.describe("Responsive Layout", () => {
  test("mobile viewport renders without horizontal scroll", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("https://playwright.dev");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = await page.evaluate(() => window.innerWidth);

    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 5); // 5px tolerance
  });

  test("tablet viewport shows correct layout", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("https://playwright.dev");

    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });
});

test.describe("Accessibility Checks", () => {
  test("all images have alt text", async ({ page }) => {
    await page.goto("https://playwright.dev");

    const images = page.locator("img");
    const count = await images.count();

    for (let i = 0; i < count; i++) {
      const alt = await images.nth(i).getAttribute("alt");
      const role = await images.nth(i).getAttribute("role");
      // Images should have alt text or be marked as decorative (role="presentation")
      expect(alt !== null || role === "presentation").toBe(true);
    }
  });

  test("interactive elements are keyboard focusable", async ({ page }) => {
    await page.goto("https://playwright.dev");

    await page.keyboard.press("Tab");
    const focusedTag = await page.evaluate(
      () => document.activeElement?.tagName
    );

    expect(["A", "BUTTON", "INPUT"]).toContain(focusedTag);
  });
});
