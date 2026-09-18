import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { visualRoutes, visualViewports } from "../fixtures/visual-routes";

for (const viewport of visualViewports) {
  test(`representative routes meet automated WCAG A/AA checks at ${viewport.width}px`, async ({ page }) => {
    test.setTimeout(120000);
    await page.setViewportSize(viewport);
    for (const route of visualRoutes) {
      await page.goto(route);
      const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21aa"]).analyze();
      expect.soft(results.violations.map(({ id, nodes }) => ({ id, nodes: nodes.map((node) => node.target) })), route).toEqual([]);
    }
  });
}

test("mobile menu has 44px controls, valid expanded relationships, visible keyboard focus and focus return", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const trigger = page.getByRole("button", { name: "Menu", exact: true });
  const size = await trigger.boundingBox();
  expect.soft(size!.width).toBeGreaterThanOrEqual(44);
  expect.soft(size!.height).toBeGreaterThanOrEqual(44);
  await trigger.focus();
  await page.keyboard.press("Enter");
  const dialog = page.getByRole("dialog", { name: "Menu" });
  const close = dialog.getByRole("button", { name: "Close menu", exact: true });
  await expect(close).toBeFocused();
  const closeSize = await close.boundingBox();
  expect.soft(closeSize!.width).toBeGreaterThanOrEqual(44);
  expect.soft(closeSize!.height).toBeGreaterThanOrEqual(44);
  await dialog.getByRole("button", { name: "Open We are here to help menu" }).click();
  expect(await dialog.locator("[id]").evaluateAll((nodes) => nodes.filter((node) => /\s/.test(node.id)).map((node) => node.id))).toEqual([]);
  await page.keyboard.press("Tab");
  expect(await page.evaluate(() => getComputedStyle(document.activeElement!).outlineStyle)).not.toBe("none");
  await page.keyboard.press("Escape");
  await expect(trigger).toBeFocused();
});

test("source mobile bottom bar keeps home, top and contact actions reachable", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/en");
  const bar = page.locator(".floating-actions");
  const bounds = (await bar.boundingBox())!;
  expect(bounds.width).toBe(390);
  expect(bounds.y + bounds.height).toBe(844);
  await expect(bar.getByRole("link", { name: "Home", exact: true })).toHaveAttribute("href", "/en");
  await page.evaluate(() => scrollTo(0, 1000));
  await bar.getByRole("button", { name: "Back to top" }).click();
  await expect.poll(() => page.evaluate(() => scrollY)).toBe(0);
  await bar.locator(".inquiry-trigger").click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
