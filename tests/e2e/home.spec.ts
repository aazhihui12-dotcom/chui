import { expect, test } from "@playwright/test";

for (const locale of ["en", "cn"] as const) {
  const cn = locale === "cn";
  test(`${locale} homepage carousel, video, statistics and local media`, async ({ page }) => {
    const failures: string[] = [];
    page.on("pageerror", (error) => failures.push(error.message));
    await page.goto(`/${locale}/`);
    await expect(page.getByRole("heading", { level: 1 })).toContainText(cn ? "节省您的时间与成本" : "Saving You Time and Cost");
    await expect(page.locator(".home-hero [aria-roledescription=slide]")).toHaveCount(1);
    await expect(page.locator(".hero-counter")).toHaveText("01 / 01");
    await expect(page.locator(".home-hero button")).toHaveCount(0);
    const play = page.getByRole("button", { name: cn ? "播放制造视频" : "Play manufacturing video" });
    await play.click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.locator("video")).toHaveAttribute("src", /^\/media\/.*\.mp4$/);
    await expect.poll(() => dialog.locator("video").evaluate((video: HTMLVideoElement) => video.videoWidth)).toBe(1280);
    // Native media controls live in the browser's shadow tree. Verify an actual
    // inner control is reachable and changes playback state, not just its host.
    const accessibility = await page.context().newCDPSession(page);
    await accessibility.send("Accessibility.enable");
    let reachedMute = false;
    for (let index = 0; index < 10; index++) {
      await page.keyboard.press("Tab");
      const tree = await accessibility.send("Accessibility.getFullAXTree");
      reachedMute = tree.nodes.some((node) => /^(mute|静音)$/i.test(String(node.name?.value)) && node.properties?.some((property) => property.name === "focused" && property.value.value === true));
      if (reachedMute) break;
    }
    expect(reachedMute).toBe(true);
    await page.keyboard.press("Space");
    await expect.poll(() => dialog.locator("video").evaluate((video: HTMLVideoElement) => video.muted)).toBe(true);
    await accessibility.detach();
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(play).toBeFocused();
    const stat = page.getByText(cn ? "成功的客制样品" : "Successful Custom Sample");
    await stat.scrollIntoViewIfNeeded();
    await expect(page.locator('dd [aria-hidden="true"]', { hasText: "4800 +" })).toBeVisible();
    await expect(page.getByRole("heading", { name: cn ? "我们的任务" : "Our Mission" })).toBeVisible();
    const broken = await page.locator("img").evaluateAll((images) => images.filter((image) => image.getAttribute("src")?.startsWith("http")).length);
    expect(broken).toBe(0);
    expect(failures).toEqual([]);
  });

  test(`${locale} homepage fits 390px and respects reduced motion`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/${locale}/`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.locator('dd [aria-hidden="true"]', { hasText: "4800 +" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    const lastCta = page.getByRole("link", { name: cn ? "咨询家电专家" : "Consult with Home Appliance Experts" });
    await lastCta.scrollIntoViewIfNeeded();
    await expect(lastCta).toHaveAttribute("href", `/${locale}/Contact_Us`);
  });

  test(`${locale} statistics expose every final value to assistive technology`, async ({ page }) => {
    await page.goto(`/${locale}/`);
    const definitions = page.getByRole("definition");
    for (const [index, value] of (cn ? ["2", "10", "20 +", "4800 +"] : ["2 +", "10 +", "20 +", "4800 +"]).entries()) {
      await expect(definitions.nth(index)).toMatchAriaSnapshot(`- definition: ${value}`);
    }
  });
}
