import { expect, test } from "@playwright/test";

for (const locale of ["en", "cn"] as const) {
  const cn = locale === "cn";
  test(`${locale} header, floating, CTA and product share one accessible inquiry dialog`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`/${locale}`);
    for (const selector of [".site-header .inquiry-trigger", ".floating-actions .inquiry-trigger", ".home-products .inquiry-trigger", ".home-final-cta .inquiry-trigger"]) {
      const trigger = page.locator(selector).first();
      await trigger.click();
      const dialog = page.getByRole("dialog");
      await expect(dialog).toBeVisible();
      await expect(dialog).toHaveCount(1);
      await expect(dialog.getByLabel(cn ? "姓名" : "Name", { exact: true })).toBeFocused();
      const close = dialog.getByRole("button", { name: cn ? "关闭询盘" : "Close inquiry" });
      await close.focus();
      await page.keyboard.press("Shift+Tab");
      await expect(dialog.getByRole("button", { name: cn ? "提交" : "Submit", exact: true })).toBeFocused();
      await page.keyboard.press("Tab");
      await expect(close).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
    }
    await page.goto(`/${locale}/ProductIndex`);
    await page.locator(".product-index__cta .inquiry-trigger").click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await page.goto(`/${locale}/ProductDetail/11906944.html`);
    await page.locator(".product-inquiry").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog.getByLabel(cn ? "产品" : "Product", { exact: true })).toHaveValue("LBH-3228");
    await dialog.getByRole("button", { name: cn ? "提交" : "Submit", exact: true }).click();
    const name = dialog.getByLabel(cn ? "姓名" : "Name", { exact: true });
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toBeFocused();
    await name.fill("Alex");
    await dialog.getByLabel(cn ? "电子邮箱" : "Email", { exact: true }).fill("alex@example.com");
    await dialog.getByLabel(cn ? "留言" : "Message", { exact: true }).fill("Please send a quote.");
    await dialog.getByRole("button", { name: cn ? "提交" : "Submit", exact: true }).click();
    await expect(dialog.getByRole("status")).toHaveText(cn ? "谢谢，我们会尽快与您联系。" : "Thank you. We will contact you soon.");
    expect(errors).toEqual([]);
  });
  test(`${locale} Contact has exactly one inline form and submits without opening a dialog`, async ({ page }) => {
    await page.goto(`/${locale}/Contact_Us`);
    const panel = page.locator(".contact-inquiry-panel");
    await expect(page.locator("form")).toHaveCount(1);
    await expect(page.getByRole("dialog")).toHaveCount(0);
    const name = panel.getByLabel(cn ? "姓名" : "Name", { exact: true });
    await panel.getByRole("button", { name: cn ? "发送留言" : "Send Message", exact: true }).click();
    await expect(name).toHaveAttribute("aria-invalid", "true");
    await expect(name).toBeFocused();
    await name.fill("Contact buyer");
    await panel.getByLabel(cn ? "电子邮箱" : "Email", { exact: true }).fill("buyer@example.com");
    await panel.getByLabel(cn ? "留言" : "Message", { exact: true }).fill("Please send the catalogue.");
    await page.locator(".site-header .inquiry-trigger").click();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(name).toHaveValue("Contact buyer");
    await expect(page.locator("form")).toHaveCount(1);
    await panel.getByRole("button", { name: cn ? "发送留言" : "Send Message", exact: true }).click();
    await expect(panel.getByRole("status")).toHaveText(cn ? "谢谢，我们会尽快与您联系。" : "Thank you. We will contact you soon.");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
  test(`${locale} inquiry fits mobile and closes on the backdrop`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/${locale}`);
    await page.locator(".floating-actions .inquiry-trigger").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const box = (await dialog.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.width).toBeLessThanOrEqual(390);
    await page.mouse.click(2, 2);
    await expect(dialog).toHaveCount(0);
  });
}
