import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/",
  "/solutions/",
  "/solutions/archive-trend/",
  "/capabilities/",
  "/blogs/",
  "/privacy/",
  "/terms/",
];

const viewports = [
  { name: "mobile", width: 375, height: 812 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
];

async function shellMetrics(page: Page) {
  return page.evaluate(() => {
    const mainRect = document.querySelector("main")?.getBoundingClientRect();
    const footerRect = document.querySelector(".site-footer")?.getBoundingClientRect();

    return {
      horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
      mainBottom: mainRect?.bottom ?? 0,
      footerTop: footerRect?.top ?? 0,
      footerBottom: footerRect?.bottom ?? 0,
      pageHeight: document.documentElement.scrollHeight,
      viewportHeight: window.innerHeight,
      brokenImages: [...document.images].filter(
        (image) => image.complete && image.naturalWidth === 0
      ).length,
    };
  });
}

test("principal routes fit supported screen sizes", async ({ page }) => {
  for (const viewport of viewports) {
    await page.setViewportSize(viewport);

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState("networkidle");
      const metrics = await shellMetrics(page);

      expect(metrics.horizontalOverflow, `${route} overflows at ${viewport.name}`).toBe(false);
      expect(metrics.brokenImages, `${route} has broken images at ${viewport.name}`).toBe(0);
      expect(
        metrics.footerTop,
        `${route} footer overlaps main content at ${viewport.name}`
      ).toBeGreaterThanOrEqual(metrics.mainBottom - 1);

      if (metrics.pageHeight <= metrics.viewportHeight + 1) {
        expect(
          Math.abs(metrics.viewportHeight - metrics.footerBottom),
          `${route} footer does not reach the viewport floor at ${viewport.name}`
        ).toBeLessThanOrEqual(2);
      }
    }
  }
});

test("header anchors remain aligned between routes", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });

  const measure = async (route: string) => {
    await page.goto(route);
    return page.evaluate(() => {
      const shell = document.querySelector(".header-shell")!.getBoundingClientRect();
      const brand = document.querySelector(".brand")!.getBoundingClientRect();
      const nav = document.querySelector(".site-nav")!.getBoundingClientRect();
      return {
        shellLeft: shell.left,
        shellRight: shell.right,
        brandLeft: brand.left,
        navRight: nav.right,
      };
    });
  };

  const home = await measure("/");
  const internal = await measure("/solutions/");

  expect(Math.abs(home.shellLeft - internal.shellLeft)).toBeLessThanOrEqual(1);
  expect(Math.abs(home.shellRight - internal.shellRight)).toBeLessThanOrEqual(1);
  expect(Math.abs(home.brandLeft - internal.brandLeft)).toBeLessThanOrEqual(2);
  expect(Math.abs(home.navRight - internal.navRight)).toBeLessThanOrEqual(2);
});

test("homepage prefers compressed imagery without layout instability", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  const hero = page.locator(".hero-scene");
  await expect(hero).toBeVisible();
  const image = await hero.evaluate((element) => {
    const node = element as HTMLImageElement;
    return {
      currentSrc: node.currentSrc,
      naturalWidth: node.naturalWidth,
      naturalHeight: node.naturalHeight,
    };
  });

  expect(image.currentSrc).toMatch(/annotated-airfield-scene\.(avif|webp)$/);
  expect(image.naturalWidth).toBe(1755);
  expect(image.naturalHeight).toBe(896);
  await expect(page.locator(".hero-stage")).toHaveCSS("height", "672px");
});

test("mobile navigation opens, closes, and resets across breakpoint changes", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/solutions/");

  const toggle = page.locator("[data-nav-toggle]");
  const shell = page.locator(".header-shell");

  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(shell).toHaveClass(/is-nav-open/);
  await expect(page.locator("body")).toHaveClass(/nav-open/);

  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(shell).not.toHaveClass(/is-nav-open/);

  await toggle.click();
  await page.setViewportSize({ width: 921, height: 844 });
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await expect(shell).not.toHaveClass(/is-nav-open/);
  await expect(page.locator("body")).not.toHaveClass(/nav-open/);
});

test("site search opens from header and keyboard without breaking navigation", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/solutions/");

  const dialog = page.locator("[data-search-dialog]");
  await page.getByRole("button", { name: "Search MIAR" }).click();
  await expect(dialog).toBeVisible();
  await expect(page.locator("[data-search-input]")).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();

  await page.keyboard.press("/");
  await expect(dialog).toBeVisible();
  await page.locator("[data-search-input]").fill("imagery");
  await expect(page.locator("[data-search-status]")).toContainText(
    "Search is unavailable in this preview"
  );

  await page.getByRole("button", { name: "Close search" }).click();
  await expect(dialog).toBeHidden();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByRole("button", { name: "Search MIAR" })).toBeVisible();
  await expect(page.locator("[data-nav-toggle]")).toBeVisible();
});

test("desktop form validates selections and handles a successful request", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.route("**/api/waitlist/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Request recorded.", persisted: true }),
    });
  });
  await page.goto("/#waitlist");

  await page.getByLabel("Work email").fill("analyst@example.org");
  await page.getByRole("button", { name: "Request access", exact: true }).last().click();
  await expect(page.locator("#form-status")).toContainText("Select a primary workflow");

  const selects = page.locator("[data-custom-select]");
  await selects.nth(0).locator("[data-custom-select-trigger]").click();
  await selects.nth(0).getByRole("button", { name: "Tactical ISR", exact: true }).click();
  await selects.nth(1).locator("[data-custom-select-trigger]").click();
  await selects
    .nth(1)
    .getByRole("button", { name: "Aircraft presence by type", exact: true })
    .click();

  await page.getByRole("button", { name: "Request access", exact: true }).last().click();
  await expect(page.locator("#form-status")).toHaveText("Request recorded.");
  await expect(page.locator("#waitlist-form")).toHaveAttribute("aria-busy", "false");
});

test("mobile form uses native controls and keeps values synchronized", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/waitlist/", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Request recorded.", persisted: true }),
    });
  });
  await page.goto("/#waitlist");

  const nativeSelects = page.locator(".mobile-select");
  await expect(nativeSelects.nth(0)).toBeVisible();
  await expect(page.locator("[data-custom-select]").nth(0)).toBeHidden();

  await nativeSelects.nth(0).selectOption("tactical-isr");
  await nativeSelects.nth(1).selectOption("aircraft-presence-by-type");
  await page.getByLabel("Work email").fill("analyst@example.org");

  await expect(page.locator('input[name="interest"]')).toHaveValue("tactical-isr");
  await expect(page.locator('input[name="focus"]')).toHaveValue("aircraft-presence-by-type");

  await page.getByRole("button", { name: "Request access", exact: true }).last().click();
  await expect(page.locator("#form-status")).toHaveText("Request recorded.");
});

test("blog filters, views, and thumbnails remain consistent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/blogs/");

  const entries = page.locator("[data-blog-entry]");
  await expect(entries).toHaveCount(1);

  const thumbnailSources = await entries.locator(".blog-live-image img").evaluateAll((images) =>
    images.map((image) => (image as HTMLImageElement).getAttribute("src"))
  );
  expect(new Set(thumbnailSources).size).toBe(thumbnailSources.length);

  await page.getByRole("button", { name: "Analysis", exact: true }).click();
  await expect(entries.filter({ visible: true })).toHaveCount(1);
  await expect(entries.filter({ visible: true }).first()).toHaveAttribute(
    "data-category",
    "Analysis"
  );

  await page.getByRole("button", { name: "Tradecraft", exact: true }).click();
  await expect(entries.filter({ visible: true })).toHaveCount(0);

  await page.getByRole("button", { name: "Case Notes", exact: true }).click();
  await expect(entries.filter({ visible: true })).toHaveCount(0);
  await expect(page.locator("[data-blog-empty]")).toBeVisible();

  await page.getByRole("button", { name: "All", exact: true }).click();
  await page.getByRole("button", { name: "Grid", exact: true }).click();
  await expect(page.locator("[data-blog-list]")).toHaveAttribute("data-view", "grid");
  await page.reload();
  await expect(page.locator("[data-blog-list]")).toHaveAttribute("data-view", "grid");

  await page.getByRole("button", { name: "List", exact: true }).click();
  await expect(page.locator("[data-blog-list]")).toHaveAttribute("data-view", "list");
});

test("delivery workflow stays compact and content remains reachable", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/solutions/sovereign-delivery/");

  const evidence = page.locator(".solution-evidence-delivery");
  await expect(evidence).toBeVisible();
  expect((await evidence.boundingBox())?.height ?? Infinity).toBeLessThan(420);
  await expect(evidence.getByText("Multi-provider imagery", { exact: true })).toBeVisible();
  await expect(evidence.getByText("Approved operational output", { exact: true })).toBeVisible();

  await page.goto("/capabilities/");
  await expect(
    page.getByRole("heading", {
      name: "Review recurring military sites with the source evidence attached.",
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Request access", exact: true }).last()).toBeVisible();
});

test("asset monitoring register stays compact and aligned", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/solutions/military-asset-monitoring/");

  const evidence = page.locator(".solution-evidence-monitor");
  const cells = page.locator(".solution-monitor > div");
  await expect(cells).toHaveCount(4);
  expect((await evidence.boundingBox())?.height ?? Infinity).toBeLessThan(410);

  const verticalCenters = await cells.evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return rect.top + rect.height / 2;
    })
  );
  expect(Math.max(...verticalCenters) - Math.min(...verticalCenters)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  expect((await evidence.boundingBox())?.height ?? 0).toBeGreaterThanOrEqual(470);
  await expect(page.getByText("Confirmation remains explicit", { exact: true })).toBeVisible();
});

test("article imagery exposes visible captions and structured descriptions", async ({ page }) => {
  await page.goto("/blogs/posts/a-satellite-image-is-not-yet-intelligence/");

  const figures = page.locator(".blog-scene-pair figure");
  await expect(figures).toHaveCount(2);
  await expect(figures.nth(0).locator("figcaption")).toContainText("Reference scene / 2025");
  await expect(figures.nth(0).locator("figcaption")).toContainText(
    "Reference satellite imagery of a monitored airbase from 2025"
  );
  await expect(figures.nth(1).locator("figcaption")).toContainText("Follow-on scene / 2026");

  const jsonLd = await page.locator('script[type="application/ld+json"]').textContent();
  expect(jsonLd).toContain('"@type":"ImageObject"');
  expect(jsonLd).toContain("Reference scene / 2025");
  expect(jsonLd).toContain("Follow-on satellite imagery of the same monitored airbase from 2026");

  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
    "content",
    "https://miar.reachdefence.com/social/a-satellite-image-is-not-yet-intelligence.png"
  );
  await expect(page.locator('meta[property="og:image:width"]')).toHaveAttribute("content", "1200");
  await expect(page.locator('meta[property="og:image:height"]')).toHaveAttribute("content", "630");
});
