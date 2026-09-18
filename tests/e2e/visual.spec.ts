import { expect, test } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { visualName, visualRoutes, visualViewports } from "../fixtures/visual-routes";
import { decodedImageFailures } from "../fixtures/decoded-images";

test("source header dimensions, logo and product heading band are retained", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/en/ProductIndex");
  expect((await page.locator(".site-header").boundingBox())!.height).toBe(62);
  await expect(page.locator(".site-brand img")).toBeVisible();
  await expect(page.locator(".product-index__banner")).toHaveCSS("background-color", "rgb(26, 26, 26)");
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await page.locator(".site-header").boundingBox())!.height).toBe(50);
});

test("mobile homepage preserves the source's compact opening composition", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  expect((await page.locator(".home-hero").boundingBox())!.height).toBeLessThanOrEqual(650);
  await expect(page.locator("#home-title")).toHaveCSS("font-size", "14px");
});

test("product detail retains the dark source surface and opens with feature artwork", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/en/ProductDetail/11906944.html");
  await expect(page.locator(".product-detail")).toHaveCSS("background-color", "rgb(51, 47, 44)");
  await expect(page.getByRole("tab", { name: "Product Features" })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel").locator("img").first()).toBeInViewport();
});

test("company introduction cards overlap the source artwork and articles retain their dark banner", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/en/Company_Introduction");
  const artwork = await page.locator(".editorial-section--feature").boundingBox();
  const cards = await page.locator(".editorial-section--feature + .editorial-section--split").boundingBox();
  expect(cards!.y).toBeLessThan(artwork!.y + artwork!.height - 200);
  await page.goto("/en/NewsDetail/6860217.html");
  await expect(page.locator(".article-banner")).toHaveCSS("background-color", "rgb(26, 26, 26)");
  const sharing = (await page.locator(".article-sharing").boundingBox())!;
  expect(sharing.y).toBeGreaterThan(520);
  expect(sharing.y).toBeLessThan(580);
});

for (const viewport of visualViewports) {
  for (const route of visualRoutes) {
    test(`${route} visual layout at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      expect((await page.goto(route))?.status()).toBe(200);
      await expect(page.getByRole("main")).toBeVisible();
      await expect(page.locator("#main-content")).toBeVisible();
      expect(await decodedImageFailures(page), `Displayed images must decode: ${route}`).toEqual([]);
      if (viewport.width === 390) {
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(viewport.width);
      }
      expect(errors).toEqual([]);
      const name = visualName(route, viewport.width);
      await mkdir("tests/visual/current", { recursive: true });
      const style = "nextjs-portal { display: none !important; }";
      await page.screenshot({ path: `tests/visual/current/${name}`, animations: "disabled", style });
      await expect(page).toHaveScreenshot(name, { animations: "disabled", style, maxDiffPixelRatio: 0.005 });
    });
  }
}

test("source manufacturing statistics, five-column footer and contact checkmarks retain their composition", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/en");
  const media = page.locator(".home-manufacturing__media");
  await expect(media.locator(".stats-grid")).toBeVisible();
  await expect(media.locator(".video-preview")).toBeVisible();
  expect((await page.locator(".site-footer__inner > *").count())).toBe(5);
  await page.goto("/cn/Contact_Us");
  await expect(page.locator(".contact-checklist > div")).toHaveCount(6);
  await expect(page.locator(".contact-checklist > div").first()).toHaveCSS("border-bottom-width", "0px");
});
