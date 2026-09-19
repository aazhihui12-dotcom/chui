import { expect, test } from "@playwright/test";
import manifest from "../../source-cache/manifest.json" with { type: "json" };
import pairs from "../../content/route-correspondence.json" with { type: "json" };
const paths = [...new Set(manifest.sitemapUrls.map(url => new URL(url).pathname.replace(/\/$/, "") || "/"))];
for (const locale of ["en", "cn"] as const) for (const width of [1440, 390]) {
  test(`all 97 ${locale} source pages correspond at ${width}px`, async ({ page }) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width, height: 900 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const original of paths) {
      const pair = pairs.find(pair => pair.en === original);
      const target = pair?.[locale] ?? original;
      const route = `/${locale}${target === "/" ? "" : target}/`;
      expect((await page.goto(route))?.status(), route).toBe(200);
      await expect(page.locator("html")).toHaveAttribute("lang", locale === "cn" ? "zh-CN" : "en");
      await expect(page.locator("main")).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
      if (pair?.model) await expect(page.locator("main h1")).toHaveText(pair.model);
      if (pair) {
        const alternate = locale === "en" ? "cn" : "en";
        await expect(page.locator(`a[href="/${alternate}${pair[alternate]}"]`).first()).toBeAttached();
      }
    }
    expect(errors).toEqual([]);
  });
}
test("language switch keeps article identity across different CMS IDs", async ({ page }) => {
  await page.goto("/en/NewsDetail/6860206.html/");
  await page.locator('a[href="/cn/NewsDetail/6809208.html"]').first().click();
  await expect(page).toHaveURL(/\/cn\/NewsDetail\/6809208.html\//);
  await expect(page.locator("main h1")).toHaveText("你们的供货能力如何？");
  await expect(page.locator("main")).toContainText("日均产能5000台，一年出货150万至200万台");
  await page.locator('a[href="/en/NewsDetail/6860206.html"]').first().click();
  await expect(page.locator("main h1")).toHaveText("What is your supply capacity?");
});
