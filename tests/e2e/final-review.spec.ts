import { expect, test, type Locator, type Page } from "@playwright/test";
test.use({ hasTouch: true });
async function swipe(page: Page, target: Locator) {
  await target.scrollIntoViewIfNeeded();
  const rect = (await target.boundingBox())!;
  const x = rect.x + rect.width * .8, y = rect.y + Math.min(rect.height / 2, 180);
  const session = await page.context().newCDPSession(page);
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y }] });
  for (let step = 1; step <= 6; step++) await session.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: x - step * 25, y }] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await session.detach();
}
for (const locale of ["en", "cn"]) test(`${locale} static document language, editorial modal and query-prefilled inline form`, async ({ page }) => {
  const errors: string[] = []; page.on("pageerror", error => errors.push(error.message));
  const response = await page.goto(`/${locale}/Exclusive_sale/`);
  const lang = locale === "cn" ? "zh-CN" : "en";
  expect(await response!.text()).toContain(`<html lang="${lang}">`);
  await expect(page.locator("html")).toHaveAttribute("lang", lang);
  await page.locator("main .content-cta a").last().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/${locale}/Exclusive_sale/`));
  await page.keyboard.press("Escape");
  await page.goto(`/${locale}/Contact_Us/?product=LBH-3228`);
  const product = page.locator('input[name="product"]');
  await expect(product).toHaveValue("LBH-3228");
  await product.fill("Edited model");
  await page.locator(".inquiry-submit").click();
  await expect(product).toHaveValue("Edited model");
  await expect(page.locator("form")).toHaveCount(1);
  expect(errors).toEqual([]);
});
test("real touch swipes browse catalogue, editorial gallery and product detail without accidental link or lightbox activation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/ProductIndex/");
  await swipe(page, page.locator(".product-carousel__viewport"));
  await expect(page.locator(".product-carousel [role=status]")).toContainText("Products 2–3");
  await expect(page).toHaveURL(/ProductIndex/);
  await page.goto("/en/Factory_tour/");
  const gallery = page.getByRole("region", { name: "Assembly Site" });
  await swipe(page, gallery.locator("[role=group]:visible"));
  await expect(gallery.getByRole("status")).toHaveText("2 / 3");
  await page.goto("/en/ProductDetail/11906944.html/");
  const photo = page.locator(".product-gallery__main img");
  const first = await photo.getAttribute("src");
  await swipe(page, page.locator(".product-gallery__main"));
  await expect(photo).not.toHaveAttribute("src", first!);
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.goto("/cn/");
  const partners = page.getByRole("region", { name: "宝贵的合作伙伴" });
  await swipe(page, partners.locator(".partner-carousel__viewport"));
  await expect(partners.getByRole("status")).toContainText("2 /");
});
test("source-enabled 4-second autoplay pauses for hover, explicit control and reduced motion while the motor gallery stays manual", async ({ page }) => {
  await page.clock.install();
  await page.goto("/en/Factory_tour/");
  const gallery = page.getByRole("region", { name: "Assembly Site" });
  const motor = page.getByRole("region", { name: "Motor Factory" });
  await expect(gallery.getByRole("button", { name: "Pause slideshow" })).toBeVisible();
  await page.clock.fastForward(4000);
  await expect(gallery.getByRole("status")).toHaveText("2 / 3");
  await expect(motor.getByRole("status")).toHaveText("1 / 3");
  await gallery.hover(); await page.clock.fastForward(8000);
  await expect(gallery.getByRole("status")).toHaveText("2 / 3");
  await gallery.getByRole("button", { name: "Pause slideshow" }).click();
  await page.mouse.move(0, 0); await page.keyboard.press("Tab"); await page.clock.fastForward(8000);
  await expect(gallery.getByRole("status")).toHaveText("2 / 3");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/en/ProductIndex/"); await page.clock.fastForward(12000);
  await expect(page.locator(".product-carousel [role=status]")).toContainText("Products 1–3");
});

test("canonical Chinese OEM, Design and Quality retain their source opening layout and hover artwork", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/cn/Contract_manufacturing_service/");
  const first = page.locator(".editorial-section").first();
  const text = (await first.locator(".editorial-section__group").first().boundingBox())!;
  const art = first.locator(".content-gallery--hover");
  await expect(art).toBeVisible();
  const box = (await art.boundingBox())!;
  expect((await art.locator("img").first().boundingBox())!.width).toBeGreaterThan(550);
  expect(box.x).toBeGreaterThan(text.x + text.width);
  expect(box.y).toBeGreaterThan(300); expect(box.y).toBeLessThan(330);
  await expect(art.locator("img").last()).toHaveCSS("opacity", "0");
  await art.hover(); await expect(art.locator("img").last()).toHaveCSS("opacity", "1");
  await page.goto("/cn/Design_and_Development/");
  await expect(page.locator(".editorial-section").first()).toHaveClass(/--stack/);
  expect((await page.locator(".editorial-section").nth(1).locator("img").boundingBox())!.y).toBeGreaterThan(400);
  await page.goto("/cn/PinZhiGuanLi/");
  const second = page.locator(".editorial-section").nth(1);
  await expect(second).toHaveCSS("background-color", "rgb(26, 26, 26)");
  expect(await second.locator(".editorial-section__group").first().locator("img").count()).toBe(2);
});

test("Chinese editorial mobile banners and opening whitespace retain canonical source geometry", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ["Contract_manufacturing_service", "Factory_tour", "PinZhiGuanLi", "Design_and_Development"]) {
    await page.goto(`/cn/${route}/`);
    const banner = (await page.locator(".editorial-banner").boundingBox())!;
    expect(banner.y + banner.height).toBeCloseTo(149, -1);
    const heading = (await page.locator(".editorial-section h2").first().boundingBox())!;
    expect(heading.y).toBeGreaterThanOrEqual(249);
    expect(heading.y).toBeLessThanOrEqual(270);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(390);
  }
});

test("canonical Chinese desktop hero copy uses the full-width source text column", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto("/cn/");
  const heading = (await page.locator("#home-title").boundingBox())!;
  expect(heading.x).toBeLessThanOrEqual(12);
  expect(heading.y).toBeGreaterThan(170);
  expect(heading.width).toBeGreaterThan(850);
});
