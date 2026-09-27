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
  test.setTimeout(90_000);

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

test("hero workbench lets a visitor review a candidate like an analyst", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");

  const stack = page.locator("[data-sensor-stack]");
  await expect(stack).toBeVisible();
  expect(await page.locator(".hero img").count(), "hero should be vector, not raster").toBe(0);

  await stack.getByRole("button", { name: "C-3", exact: true }).click();
  await expect(stack).toHaveAttribute("data-cand-active", "C-3");
  const panel = stack.locator('[data-panel="C-3"]');
  await expect(panel).toBeVisible();
  await expect(panel).toContainText("Likely decoy");
  await expect(panel).toContainText("No metal return");

  await panel.locator('[data-peel="sar"]').hover();
  await expect(stack).toHaveAttribute("data-active", "sar");

  await panel.getByRole("button", { name: "Accept", exact: true }).click();
  await expect(panel.locator("[data-log]")).toContainText("Accepted");
  await expect(panel.getByRole("button", { name: /Next: C-/ })).toBeVisible();
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
  await expect(page.locator('[data-error-for="interest"]')).toBeVisible();

  await page.locator("label.chip", { hasText: "Tactical ISR" }).click();
  await page.locator('select[name="focus"]').selectOption("aircraft-presence-by-type");
  await page.locator("label.chip", { hasText: "0–3 months" }).click();

  await page.getByRole("button", { name: "Request access", exact: true }).last().click();
  await expect(page.locator("#form-status")).toHaveText("Request recorded.");
  await expect(page.locator("#waitlist-form")).toHaveAttribute("aria-busy", "false");
  await expect(page.locator('input[name="interest"]:checked')).toHaveCount(0);
});

test("mobile form submits the same fields as before", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  let body = "";
  await page.route("**/api/waitlist/", async (route) => {
    body = route.request().postData() || "";
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ message: "Request recorded.", persisted: true }),
    });
  });
  await page.goto("/#waitlist");

  await page.getByLabel("Work email").fill("analyst@example.org");
  await page.locator("label.chip", { hasText: "Military asset monitoring" }).click();
  await page.locator('select[name="focus"]').selectOption("before-after-compare");

  await expect(page.locator('input[name="interest"]:checked')).toHaveValue("military-asset-monitoring");

  await page.getByRole("button", { name: "Request access", exact: true }).last().click();
  await expect(page.locator("#form-status")).toHaveText("Request recorded.");
  for (const field of ["email", "interest", "focus", "name", "organization", "role", "mission", "website"]) {
    expect(body, `payload includes ${field}`).toContain(`name="${field}"`);
  }
  expect(body).toContain("military-asset-monitoring");
  expect(body).toContain("before-after-compare");
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
  expect((await evidence.boundingBox())?.height ?? Infinity).toBeLessThan(560);
  await expect(evidence.getByText("Evidence record and audit log", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(evidence.getByText("Multi-provider imagery", { exact: true })).toBeVisible();
  await expect(evidence.getByText("Approved operational output", { exact: true })).toBeVisible();

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/capabilities/");
  await expect(
    page.getByRole("heading", {
      name: "Review recurring military sites with the source evidence attached.",
    })
  ).toBeVisible();
  await expect(page.getByRole("link", { name: "Request access", exact: true }).last()).toBeVisible();
});

test("asset monitoring register stays aligned", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/solutions/military-asset-monitoring/");

  const cells = page.locator(".solution-monitor > div");
  await expect(cells).toHaveCount(4);
  const verticalCenters = await cells.evaluateAll((nodes) =>
    nodes.map((node) => {
      const rect = node.getBoundingClientRect();
      return rect.top + rect.height / 2;
    })
  );
  expect(Math.max(...verticalCenters) - Math.min(...verticalCenters)).toBeLessThanOrEqual(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByText("Confirmation remains explicit", { exact: true })).toBeVisible();
});

test("compare slider responds to the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/solutions/change-posture/");
  const range = page.locator("[data-compare-range]");
  await range.focus();
  await range.fill("80");
  const width = await page.locator("[data-clip-before]").getAttribute("width");
  expect(Number(width)).toBeCloseTo(944, 0);
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

test("theme toggle switches and remembers light and dark", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/");
  const html = page.locator("html");
  await page.locator("[data-theme-toggle]").click();
  await expect(html).toHaveAttribute("data-theme", "dark");
  const background = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(background).toBe("rgb(14, 18, 20)");
  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");
  await page.locator("[data-theme-toggle]").click();
  await expect(html).toHaveAttribute("data-theme", "light");
});

test("fragmentation widget resolves into MIAR and the rail follows the page", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const frag = page.locator("[data-frag]");
  await frag.getByRole("button", { name: "Through MIAR" }).click();
  await expect(frag).toHaveAttribute("data-step", "3");
  await expect(frag.locator("[data-frag-stat]").first()).toHaveText("1");
  await frag.getByRole("button", { name: "Fragmented today" }).click();
  await expect(frag).toHaveAttribute("data-step", "1");
  await expect(frag.locator("[data-frag-stat]").first()).toHaveText("9");

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.locator("#overview").scrollIntoViewIfNeeded();
  await page.evaluate(() => window.scrollBy(0, 200));
  await expect(page.locator("[data-rail]")).toHaveAttribute("data-hidden", "false");
});

test("detection taxonomy drills down and holds unresolved types at role level", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  const tx = page.locator("[data-tx]");
  await tx.scrollIntoViewIfNeeded();
  const crumbs = tx.locator("[data-tx-crumbs]");
  await expect(crumbs).toHaveText(/Aircraft.*Fighter.*Su-30 family.*On apron/);

  await tx.locator('.tx-node[data-id="transport"]').click();
  await tx.locator('.tx-node[data-id="transport-unresolved"]').click();
  await expect(crumbs).toContainText("Type not resolved");
  await expect(tx.locator("[data-tx-explain]")).toContainText("Held at the level the imagery supports");
  await expect(tx.locator('.tx-col[data-depth="3"] .tx-group:not([hidden]) .tx-node')).toHaveCount(1);
  expect(await tx.locator("[data-tx-links] path.is-on").count()).toBe(3);

  await tx.locator('.tx-node[data-id="ships"]').click();
  await expect(crumbs).toHaveText(/Ships.*Surface combatant.*Destroyer/);
  await tx.locator('.tx-node[data-id="vehicles"]').click();
  await expect(tx.locator("[data-tx-explain]")).toContainText("in development");
});
