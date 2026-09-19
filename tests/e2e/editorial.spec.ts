import { expect, test } from "@playwright/test";
import { sourceEditorialMedia } from "../fixtures/editorial-source-media";

const routes = [
  "Company_Introduction", "Lead_the_team", "Factory_tour", "Milestone", "Certification_certificate",
  "Sustainable_Development", "Product_Laboratory", "Exclusive_sale", "Contract_manufacturing_service",
  "PinZhiGuanLi", "Design_and_Development", "Order_Management", "Product_manufacturing",
  "Product_Warranty_and_After-Sales_Service", "Ventilation_duct_technology", "We_are_here_to_offer_assistance",
];

for (const locale of ["en", "cn"] as const) {
  for (const width of [1440, 390]) {
    test(`${locale} editorial pages fit ${width}px and load their local media`, async ({ page }) => {
      test.setTimeout(120000);
      await page.setViewportSize({ width, height: width === 1440 ? 1200 : 844 });
      await page.emulateMedia({ reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (const route of routes) {
        const response = await page.goto(`/${locale}/${route}`);
        expect(response?.status(), route).toBe(200);
        const main = page.getByRole("main");
        if (["Ventilation_duct_technology", "We_are_here_to_offer_assistance"].includes(route)) {
          await expect(main).toBeEmpty();
          continue;
        }
        await expect(main).toHaveClass(/editorial-page/);
        await expect(main.getByRole("heading", { level: 1 })).toHaveCount(1);
        await expect(main.getByRole("heading", { level: 1 })).toBeVisible();
        await expect(main.getByRole("note")).toHaveCount(0);
        for (const source of sourceEditorialMedia[route as keyof typeof sourceEditorialMedia] ?? []) {
          await expect(main.locator(`img[src="${source}"]`), `${route}: ${source}`).toHaveCount(1);
        }
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
        const broken = await main.locator("img").evaluateAll(async (images) => {
          const failures: string[] = [];
          await Promise.all(images.map(async (image) => {
            image.loading = "eager";
            try { await image.decode(); } catch { failures.push(image.src); }
            if (!image.getAttribute("src")?.startsWith("/media/")) failures.push(image.src);
          }));
          return failures;
        });
        expect(broken, route).toEqual([]);
      }
      expect(errors).toEqual([]);
    });
  }
}

test("1440px factory opening retains the assembly and motor galleries in the first viewport", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/en/Factory_tour/");
  const assembly = page.getByRole("region", { name: "Assembly Site" });
  const motor = page.getByRole("region", { name: "Motor Factory" });
  await expect(assembly.getByRole("img")).toBeInViewport();
  await expect(motor.getByRole("img")).toBeInViewport();
  await expect(assembly.getByRole("img")).toHaveAttribute("src", sourceEditorialMedia.Factory_tour[0]);
  await assembly.getByRole("button", { name: "Next image" }).click();
  await expect(assembly.getByRole("img")).toHaveAttribute("src", sourceEditorialMedia.Factory_tour[1]);
  await expect.poll(() => assembly.getByRole("img").evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
});

test("company artwork, responsive split stacking and inquiry links remain usable", async ({ page }) => {
  await page.goto("/en/Company_Introduction");
  await expect(page.locator(".editorial-section--feature")).toHaveCSS("background-image", /company-introduction-background\.webp/);
  const artwork = await page.request.get("/media/pages/company-introduction-background.webp");
  expect(artwork.status()).toBe(200);
  await page.goto("/en/Exclusive_sale");
  const groups = page.locator(".editorial-section--split").first().locator(".editorial-section__group");
  const first = await groups.nth(0).boundingBox();
  const second = await groups.nth(1).boundingBox();
  expect(second!.x).toBeGreaterThan(first!.x + first!.width);
  await page.setViewportSize({ width: 390, height: 844 });
  const stackedFirst = await groups.nth(0).boundingBox();
  const stackedSecond = await groups.nth(1).boundingBox();
  expect(stackedSecond!.y).toBeGreaterThan(stackedFirst!.y + stackedFirst!.height);
  const inquiry = page.getByRole("main").getByRole("link", { name: "Consult with Home Appliance Experts" });
  await inquiry.scrollIntoViewIfNeeded();
  await inquiry.focus();
  await expect(inquiry).toBeFocused();
  await expect(inquiry).toHaveAttribute("href", "/en/Contact_Us");
  await page.keyboard.press("Enter");
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(/\/en\/Exclusive_sale\/$/);
});
