import { expect, test } from "@playwright/test";

test("article readers can navigate adjacent captured questions and copy the current link", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/en/NewsDetail/6860217.html/");
  await expect(page.getByRole("link", { name: /Prev.*customize the outer packaging/ })).toHaveAttribute("href", "/en/NewsDetail/6860216.html");
  await expect(page.getByRole("link", { name: /Next.*warranty period/ })).toHaveAttribute("href", "/en/NewsDetail/6860218.html");
  await expect(page.getByRole("link", { name: "Share on LinkedIn" })).toHaveAttribute("href", /linkedin\.com\/sharing/);
  await page.getByRole("button", { name: "Copy article link" }).click();
  await expect(page.getByRole("status")).toHaveText("Link copied");
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain("/en/NewsDetail/6860217.html");
});

for (const width of [1440, 390]) {
  test(`Blog displays decoded source thumbnails at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/Blog");
    const images = page.getByRole("main").getByRole("article").getByRole("img");
    await expect(images).toHaveCount(8);
    await expect(images.first()).toHaveAttribute("src", "/media/41ec23ad17142394e482f3a2afb2a0be8af1c40d2c904b99afd8e1df396f32a7.jpg");
    await expect.poll(() => images.first().evaluate((image: HTMLImageElement) => image.naturalWidth)).toBeGreaterThan(0);
  });
  test(`Contact retains source centered white hero typography at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/en/Contact_Us");
    const heading = page.getByRole("heading", { level: 1 });
    await expect(heading).toHaveText("Let us take on your new personal care and home appliance project!");
    await expect(heading).toHaveCSS("color", "rgb(255, 255, 255)");
    await expect(heading).toHaveCSS("text-align", "center");
    await expect(heading).toHaveCSS("font-size", width === 1440 ? "40px" : "22px");
    await expect(heading).toHaveCSS("line-height", width === 1440 ? "60px" : "39px");
    await expect(heading.locator("..")).toHaveCSS("background-color", "rgb(26, 26, 26)");
    await expect(page.getByRole("heading", { name: "Contact Us Now" })).toBeVisible();
  });
}

for (const locale of ["en", "cn"]) for (const width of [1440, 390]) {
  test(`${locale} support and article pages fit ${width}px`, async ({ page }) => {
    test.setTimeout(90000);
    await page.setViewportSize({ width, height: 900 });
    const errors: string[] = [];
    page.on("pageerror", error => errors.push(error.message));
    for (const route of ["Blog", "NewsList/1.html", "NewsList/2.html", "FAQ", "Contact", "Contact_Us", "Product_Catalogue", "DownLoad/261888.html", "DownLoad/261889.html", "DownLoad/261890.html", "DownLoad/261891.html", "NewsDetail/6860206.html", "NewsDetail/6860195.html"]) {
      expect((await page.goto(`/${locale}/${route}`))?.status()).toBe(200);
      await expect(page.getByRole("main").getByRole("heading", { level: 1 })).toHaveCount(route === "Contact" ? 0 : 1);
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
