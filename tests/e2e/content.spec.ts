import { expect, test } from "@playwright/test";

for (const locale of ["en", "cn"]) for (const width of [1440, 390]) {
  test(`${locale} support and article pages fit ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["Blog", "NewsList/1.html", "NewsList/2.html", "FAQ", "Contact", "Contact_Us", "Product_Catalogue", "DownLoad/261888.html", "DownLoad/261889.html", "DownLoad/261890.html", "DownLoad/261891.html", "NewsDetail/6860206.html", "NewsDetail/6860195.html"]) {
      expect((await page.goto(`/${locale}/${route}`))?.status()).toBe(200);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), route).toBe(true);
    }
    expect(errors).toEqual([]);
  });
}

test("FAQ is keyboard operable and news pagination survives reload and browser back", async ({ page }) => {
  await page.goto("/en/FAQ");
  const question = page.getByRole("button", { name: "What is your supply capacity?" });
  await question.focus();
  await page.keyboard.press("Enter");
  await expect(question).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("region", { name: "What is your supply capacity?" })).toContainText("5,000 units");
  await page.keyboard.press("Space");
  await expect(question).toHaveAttribute("aria-expanded", "false");
  await page.goto("/en/Blog");
  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByRole("main").getByRole("article")).toHaveCount(3);
  await page.reload();
  await expect(page.getByRole("main").getByRole("article")).toHaveCount(3);
  await page.goBack();
  await expect(page.getByRole("main").getByRole("article")).toHaveCount(8);
});
