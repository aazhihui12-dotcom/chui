import { expect, test } from "@playwright/test";
import { decodedImageFailures } from "../fixtures/decoded-images";

test("visual image guard reports an intentionally broken displayed image", async ({ page }) => {
  await page.goto("/en/NewsDetail/6860217.html");
  await page.locator(".site-brand img").evaluate((image: HTMLImageElement) => { image.src = "/media/intentionally-missing-visual-test.webp"; });
  expect(await decodedImageFailures(page)).toEqual([expect.stringContaining("intentionally-missing-visual-test.webp")]);
});

test("mobile article retains the source compact banner, share disclosure and stacked neighbors", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/NewsDetail/6860217.html");
  expect((await page.locator(".article-banner").boundingBox())!.height).toBeLessThanOrEqual(50);
  const share = page.getByRole("button", { name: "Share article", exact: true });
  await expect(share).toBeVisible();
  await expect(page.getByRole("link", { name: "Share on LinkedIn" })).toBeHidden();
  await share.click();
  await expect(page.getByRole("link", { name: "Share on LinkedIn" })).toBeVisible();
  await share.click();
  const neighbors = page.locator(".article-neighbors a");
  const previous = (await neighbors.first().boundingBox())!;
  const next = (await neighbors.last().boundingBox())!;
  expect(next.y).toBeGreaterThan(previous.y + previous.height);
  expect((await page.locator(".site-footer").boundingBox())!.y).toBeLessThan(490);
});

test("product overview opening follows the source band, carousel labels and proof positions", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/ProductIndex");
  const band = (await page.locator(".product-index__banner").boundingBox())!;
  expect(band.y + band.height).toBeCloseTo(188, 0);
  const proof = (await page.locator(".product-index__proof").boundingBox())!;
  expect(proof.y).toBeGreaterThan(490);
  expect(proof.y).toBeLessThan(520);
  const card = page.locator(".product-carousel .product-card").first();
  await expect(card.locator("h2")).toHaveCSS("background-color", "rgb(112, 112, 112)");
  await page.getByText("Filter products", { exact: true }).click();
  await page.getByRole("button", { name: "Hair Straightener", exact: true }).click();
  await expect(page.getByRole("region", { name: "Product catalog" }).getByRole("link", { includeHidden: true })).toHaveCount(5);
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.reload();
  const desktopCard = (await page.locator(".product-carousel .product-card").first().boundingBox())!;
  expect(desktopCard.y).toBeGreaterThan(345);
  expect(desktopCard.y).toBeLessThan(370);
  expect(desktopCard.width).toBeGreaterThan(325);
  expect(desktopCard.width).toBeLessThan(345);
});

test("mobile product graphic detail and fixed inquiry retain the current model", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en/ProductDetail/11906944.html");
  const inquiry = page.locator(".product-inquiry");
  const box = (await inquiry.boundingBox())!;
  expect(box.x).toBe(0);
  expect(box.width).toBe(390);
  expect(box.y + box.height).toBe(794);
  await inquiry.click();
  await expect(page.getByRole("dialog").getByLabel("Product", { exact: true })).toHaveValue("LBH-3228");
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "Graphic Detail", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Product Features" })).toBeInViewport();
});

test("Chinese mobile home hero is 520px and company heading occupies a separate white section", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/cn");
  expect((await page.locator(".home-hero").boundingBox())!.height).toBeCloseTo(520, 0);
  await page.goto("/en/Company_Introduction");
  const feature = page.locator(".editorial-section--feature");
  await expect(feature).toHaveCSS("background-color", "rgb(255, 255, 255)");
  const artwork = (await feature.locator(".content-media").boundingBox())!;
  expect(artwork.y).toBeGreaterThan(332);
  expect(artwork.y).toBeLessThan(352);
});

test("manufacturing background playback can be paused and resumed with the keyboard", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/en");
  const video = page.locator(".home-manufacturing__media .video-preview video");
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(false);
  const pause = page.getByRole("button", { name: "Pause background video", exact: true });
  await pause.focus();
  await page.keyboard.press("Enter");
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(true);
  await page.getByRole("button", { name: "Play background video", exact: true }).press("Enter");
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(false);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(() => video.evaluate((node: HTMLVideoElement) => node.paused)).toBe(true);
});
