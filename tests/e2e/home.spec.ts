import { expect, test } from "@playwright/test";

for (const locale of ["en", "cn"] as const) {
  const cn = locale === "cn";
  test(`${locale} homepage carousel, video, statistics and local media`, async ({ page }) => {
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    await page.goto(`/${locale}/`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(cn ? "节省时间与成本" : "Saving You Time and Cost");
    await page.getByRole("button", { name: cn ? "下一张" : "Next slide" }).click();
    await expect(page.getByRole("heading", { name: "LBH-3228" })).toBeVisible();
    await expect.poll(() => page.getByRole("img", { name: "LBH-3228" }).evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
    await page.getByRole("button", { name: cn ? "上一张" : "Previous slide" }).click();
    const play = page.getByRole("button", { name: cn ? "播放制造视频" : "Play manufacturing video" });
    await play.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("video")).toHaveAttribute("src", /^\/media\/.*\.mp4$/);
    await expect.poll(() => dialog.locator("video").evaluate((video: HTMLVideoElement) => video.videoWidth)).toBe(1280);
    await page.keyboard.press("Shift+Tab");
    await expect(dialog.locator("video")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: cn ? "关闭视频" : "Close video" })).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(play).toBeFocused();
    const stat = page.getByText(cn ? "成功定制样品" : "Successful Custom Sample");
    await stat.scrollIntoViewIfNeeded();
    await expect(page.getByText("4800 +", { exact: true })).toBeVisible();
    await expect(page.getByRole("heading", { name: cn ? "我们的使命" : "Our Mission" })).toBeVisible();
    const broken = await page.locator("img").evaluateAll((images) => images.filter((image) => image.getAttribute("src")?.startsWith("http")).length);
    expect(broken).toBe(0);
    expect(failures).toEqual([]);
  });

  test(`${locale} homepage fits 390px and respects reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${locale}/`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("4800 +", { exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const lastCta = page.getByRole("link", { name: cn ? "咨询家电专家" : "Consult with Home Appliance Experts" });
    await lastCta.scrollIntoViewIfNeeded();
    await expect(lastCta).toHaveAttribute("href", `/${locale}/Contact_Us`);
  });
}
