import { expect, test } from "@playwright/test";

test.describe("shared navigation shell", () => {
  test("rejects unsupported locale paths", async ({ page }) => {
    const response = await page.goto("/fr");
    expect(response?.status()).toBe(404);
  });

  test("keeps desktop language, dropdown, and footer destinations usable", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/en");

    await expect(page.getByRole("link", { name: "Product", exact: true })).toHaveAttribute("href", "/en/ProductIndex");
    await page.getByRole("button", { name: "Open Product menu" }).click();
    await expect(page.getByRole("banner").getByRole("link", { name: "Hair Dryer", exact: true })).toBeVisible();
    await page.getByRole("button", { name: "Close Product menu" }).click();
    await expect(page.getByRole("banner").getByRole("link", { name: "Hair Dryer", exact: true })).toBeHidden();
    await expect(page.getByRole("link", { name: "中文", exact: true })).toHaveAttribute("href", "/cn");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Contact Us" })).toHaveAttribute("href", "/en/Contact");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("opens the Chinese desktop dropdown and preserves localized destinations", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/cn");

    await page.getByRole("button", { name: "Open 产品 menu" }).click();
    await expect(page.getByRole("banner").getByRole("link", { name: "吹风机", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "English", exact: true })).toHaveAttribute("href", "/en");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "联系我们" })).toHaveAttribute("href", "/cn/Contact");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });

  test("opens localized mobile navigation and dismisses its backdrop without leaving scrolling locked", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/cn");

    await expect(page.getByRole("link", { name: "English", exact: true })).toHaveAttribute("href", "/en");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "联系我们" })).toHaveAttribute("href", "/cn/Contact");
    const menuButton = page.getByRole("button", { name: "菜单" });
    await menuButton.click();
    const drawer = page.getByRole("dialog", { name: "菜单" });
    await expect(drawer).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await page.getByRole("button", { name: "Open 产品 menu" }).click();
    await expect(drawer.getByRole("link", { name: "吹风机", exact: true })).toBeVisible();
    await page.mouse.click(8, 400);
    await expect(drawer).toBeHidden();
    await expect(menuButton).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
});
