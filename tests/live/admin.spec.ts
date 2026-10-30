import { test, expect } from "@playwright/test";
import sharp from "sharp";
test.describe.configure({ mode: "serial" });
let password = "LocalTestOnly!12345",
  articlePath = "",
  productPath = "";
async function login(page: import("@playwright/test").Page) {
  await page.goto("/admin/");
  await page.getByLabel("账号", { exact: true }).fill("admin");
  await page.getByLabel("密码", { exact: true }).fill(password);
  await page.getByRole("button", { name: "登录后台", exact: true }).click();
}
test("initial sign in forces password change, and the admin dashboard is usable", async ({
  page,
}) => {
  await login(page);
  await expect(
    page.getByRole("heading", { name: "首次登录，请修改初始密码" }),
  ).toBeVisible();
  await page.getByLabel("当前密码", { exact: true }).fill(password);
  await page
    .getByLabel("新密码", { exact: true })
    .fill("LocalChangedOnly!67890");
  await page
    .getByLabel("确认新密码", { exact: true })
    .fill("LocalChangedOnly!67890");
  await page.getByRole("button", { name: "更新密码" }).click();
  password = "LocalChangedOnly!67890";
  await expect(
    page.getByRole("heading", { name: "登录管理后台" }),
  ).toBeVisible();
  await login(page);
  await expect(
    page.getByRole("heading", { name: "产品管理", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("cell", { name: "AP-G3 AP-G3", exact: true }),
  ).toBeVisible();
  await page.screenshot({
    path: "/tmp/apower-admin-desktop.png",
    fullPage: true,
  });
});
test("an operator can upload, draft, publish, edit, unpublish, delete and restore bilingual articles", async ({
  page,
  context,
}) => {
  await login(page);
  await page.getByRole("button", { name: "资讯管理", exact: true }).click();
  await page.getByRole("button", { name: "＋ 新增资讯", exact: true }).click();
  await page.getByLabel("中文标题", { exact: true }).fill("CMS 自动验证新闻");
  await page.getByLabel("中文摘要", { exact: true }).fill("测试摘要");
  await page
    .getByLabel("中文正文", { exact: true })
    .fill("这是后台新增的测试内容。\n\n第二段正文。");
  const buffer = await sharp({
    create: { width: 1200, height: 700, channels: 3, background: "#ef608e" },
  })
    .png()
    .toBuffer();
  await page
    .getByLabel("中文封面及正文图片上传", { exact: true })
    .setInputFiles({ name: "test.png", mimeType: "image/png", buffer });
  await expect(page.locator(".cms-image-grid img")).toHaveCount(1);
  await page.getByRole("button", { name: "将本语言图片复制到英文" }).click();
  await page.getByRole("button", { name: "English 内容", exact: true }).click();
  await page
    .getByLabel("英文标题", { exact: true })
    .fill("CMS verification news");
  await page.getByLabel("英文摘要", { exact: true }).fill("Test introduction");
  await page
    .getByLabel("英文正文", { exact: true })
    .fill("Testing publication from the content manager.");
  const saved = page.waitForResponse(
    (r) =>
      r.url().includes("/api/cms/content/article") &&
      r.request().method() === "POST" &&
      r.status() === 201,
  );
  await page.getByRole("button", { name: "保存草稿", exact: true }).click();
  const record = (await (await saved).json()).record;
  articlePath = record.payload.locales.en.legacyPath + "/";
  const anon = await context.browser()!.newContext();
  const visitor = await anon.newPage();
  expect((await visitor.goto("/en" + articlePath))!.status()).toBe(404);
  await page.getByRole("button", { name: "保存并发布", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已保存并发布");
  expect((await visitor.goto("/en" + articlePath))!.status()).toBe(200);
  await expect(
    visitor.getByRole("heading", {
      name: "CMS verification news",
      exact: true,
    }),
  ).toBeVisible();
  await visitor.goto("/cn" + articlePath);
  await expect(
    visitor.getByRole("heading", { name: "CMS 自动验证新闻", exact: true }),
  ).toBeVisible();
  await visitor.goto("/en/Blog/");
  await expect(
    visitor.getByRole("link", { name: "CMS verification news", exact: true }),
  ).toBeVisible();
  await page
    .getByLabel("英文正文", { exact: true })
    .fill("Updated body is visible immediately.");
  const updated=page.waitForResponse(r=>r.url().includes('/api/cms/content/article/')&&r.request().method()==='PATCH'&&r.status()===200);
  await page.getByRole("button", { name: "保存修改", exact: true }).click();
  await updated;
  await visitor.goto("/en" + articlePath);
  await expect(
    visitor.getByText("Updated body is visible immediately.", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "下架", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("已下架");
  expect((await visitor.goto("/en" + articlePath))!.status()).toBe(404);
  await page.getByRole("button", { name: "返回列表", exact: true }).click();
  const row = page.getByRole("row").filter({ hasText: "CMS 自动验证新闻" });
  page.once("dialog", (d) => d.accept());
  await row.getByRole("button", { name: "删除", exact: true }).click();
  await expect(row).toHaveCount(0);
  await page.getByRole("button", { name: "回收站", exact: true }).click();
  await page
    .getByRole("row")
    .filter({ hasText: "CMS 自动验证新闻" })
    .getByRole("button", { name: "恢复为草稿" })
    .click();
  await page.getByRole("button", { name: "全部内容", exact: true }).click();
  await expect(
    page.getByRole("row").filter({ hasText: "CMS 自动验证新闻" }),
  ).toContainText("草稿");
  expect((await visitor.goto("/en" + articlePath))!.status()).toBe(404);
  await anon.close();
});
test("new product is published across catalog/category/detail without altering phone gallery", async ({
  page,
  context,
}) => {
  await login(page);
  await page.getByRole("button", { name: "＋ 新增产品" }).click();
  await page.getByLabel("产品型号", { exact: true }).fill("AP-CMSTEST");
  await page.getByLabel("中文摘要", { exact: true }).fill("测试产品");
  await page
    .getByLabel("中文规格参数", { exact: true })
    .fill("型号 | AP-CMSTEST\n电压 | 220V");
  const buffer = await sharp({
    create: { width: 1000, height: 1000, channels: 3, background: "#dcdcdc" },
  })
    .png()
    .toBuffer();
  await page
    .getByLabel("中文主图及配色上传", { exact: true })
    .setInputFiles({ name: "dryer.png", mimeType: "image/png", buffer });
  await expect(page.locator(".cms-image-grid img")).toHaveCount(1);
  await page.getByRole("button", { name: "将本语言图片复制到英文" }).click();
  await page.getByRole("button", { name: "English 内容", exact: true }).click();
  await page.getByLabel("英文摘要", { exact: true }).fill("Test product");
  await page
    .getByLabel("英文规格参数", { exact: true })
    .fill("Model | AP-CMSTEST\nVoltage | 220V");
  const saved = page.waitForResponse(
    (r) =>
      r.url().includes("/api/cms/content/product") &&
      r.request().method() === "POST" &&
      r.status() === 201,
  );
  await page.getByRole("button", { name: "保存并发布", exact: true }).click();
  const r = (await (await saved).json()).record;
  productPath = r.payload.locales.en.legacyPath + "/";
  const anon = await context.browser()!.newContext();
  const visitor = await anon.newPage();
  await visitor.setViewportSize({ width: 1920, height: 1100 });
  await visitor.goto("/en" + productPath);
  await expect(
    visitor.getByRole("heading", { name: "AP-CMSTEST", exact: true }),
  ).toBeVisible();
  expect(
    (await visitor.locator(".product-gallery__main").boundingBox())!.width,
  ).toBeGreaterThan(450);
  await visitor.goto("/en/Product/682975.html/");
  await expect(
    visitor.getByRole("link", { name: "AP-CMSTEST", exact: true }),
  ).toBeVisible();
  await visitor.goto("/cn/ProductIndex/");
  await visitor.getByRole('button',{name:'转到第3组产品',exact:true}).click();
  await expect(
    visitor.getByRole("link", { name: "AP-CMSTEST", exact: true }),
  ).toHaveCount(1);
  await visitor.setViewportSize({ width: 390, height: 900 });
  await visitor.goto("/cn" + productPath);
  expect(
    (await visitor.locator(".product-gallery__main").boundingBox())!.height,
  ).toBe(320);
  expect(
    await visitor.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("button", { name: "返回列表", exact: true }).click();
  page.once("dialog", (d) => d.accept());
  await page
    .getByRole("row")
    .filter({ hasText: "AP-CMSTEST" })
    .getByRole("button", { name: "删除", exact: true })
    .click();
  await expect(page.getByRole('row').filter({hasText:'AP-CMSTEST'})).toHaveCount(0);
  expect((await visitor.goto("/en" + productPath))!.status()).toBe(404);
  await anon.close();
});
test("anonymous writes are rejected and admin login fits a phone viewport", async ({
  page,
  request,
}) => {
  expect((await request.get("/api/cms/content/product")).status()).toBe(401);
  expect(
    (
      await request.post("/api/cms/content/product", {
        data: { status: "published" },
        headers: { origin: "http://evil.example" },
      })
    ).status(),
  ).toBe(403);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/admin/");
  await expect(page.getByLabel("账号", { exact: true })).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/apower-admin-mobile.png",
    fullPage: true,
  });
});
