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
    await expect(page.getByRole("link", { name: "Hair Dryer", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "中文", exact: true })).toHaveAttribute("href", "/cn");
    await expect(page.getByRole("contentinfo").getByRole("link", { name: "Contact Us" })).toHaveAttribute("href", "/en/Contact");
  });

  test("opens and dismisses the mobile drawer without leaving scrolling locked", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/en");

    const menuButton = page.getByRole("button", { name: "Menu" });
    await menuButton.click();
    const drawer = page.getByRole("dialog", { name: "Menu" });
    await expect(drawer).toBeVisible();
    await expect(menuButton).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await expect(drawer).toBeHidden();
    await expect(menuButton).toBeFocused();
    await expect(page.locator("body")).not.toHaveCSS("overflow", "hidden");
  });
});
