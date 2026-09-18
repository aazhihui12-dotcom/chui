import { expect, test } from "@playwright/test";

for (const locale of ["en", "cn"] as const) {
  const cn = locale === "cn";
  test(`${locale} product overview filters and five category routes`, async ({ page }) => {
    await page.goto(`/${locale}/ProductIndex`);
    const catalog = page.getByRole("region", { name: cn ? "产品目录" : "Product catalog" });
    await expect(catalog.getByRole("link")).toHaveCount(24);
    await page.getByRole("button", { name: cn ? "直发器" : "Hair Straightener", exact: true }).click();
    await expect(catalog.getByRole("link")).toHaveCount(5);
    for (const [id, count] of [["682971", 2], ["682972", 6], ["682973", 5], ["682974", 3], ["682975", 8]] as const) {
      await page.goto(`/${locale}/Product/${id}.html`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(catalog.getByRole("link")).toHaveCount(count);
    }
  });

  test(`${locale} straightener and dryer have working galleries, tabs and inquiry context`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const id of ["11906927", "11906941"]) {
      await page.goto(`/${locale}/ProductDetail/${id}.html`);
      const model = await page.getByRole("heading", { level: 1 }).innerText();
      await page.getByRole("button", { name: cn ? `查看${model}第2张图片` : `View image 2 of ${model}` }).click();
      const enlarge = page.getByRole("button", { name: cn ? `放大${model}图片` : `Enlarge ${model} image` });
      await expect.poll(() => enlarge.locator("img").evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
      await enlarge.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await page.keyboard.press("Tab");
      expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(enlarge).toBeFocused();
      await page.getByRole("tab", { name: cn ? "产品功能" : "Product Features" }).click();
      await expect(page.getByRole("tabpanel").locator("img").first()).toBeVisible();
      await page.keyboard.press("End");
      await expect(page.getByRole("tab", { name: cn ? "可选配件" : "Optional Accessories" })).toBeFocused();
      await expect(page.getByRole("link", { name: cn ? "立即询价" : "Get a Quote Now", exact: true })).toHaveAttribute("href", `/${locale}/Contact_Us?product=${model}`);
    }
    expect(errors).toEqual([]);
  });

  test(`${locale} catalog and details fit a 390px viewport`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    for (const path of ["ProductIndex", "Product/682975.html", "ProductDetail/11906944.html"]) {
      await page.goto(`/${locale}/${path}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    const gallery = await page.locator(".product-gallery").boundingBox();
    const summary = await page.locator(".product-summary").boundingBox();
    expect(summary!.y).toBeGreaterThan(gallery!.y + gallery!.height - 1);
  });
}
