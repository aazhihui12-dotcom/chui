import { test, expect } from "@playwright/test";

test("desktop navigation uses the source 16px regular UI font, not bold Poppins", async ({page}) => {
  await page.setViewportSize({width:1440,height:1200});await page.goto("/en/");
  const link=page.locator(".desktop-nav__item > a").first();
  await expect(link).toHaveCSS("font-size","16px");
  await expect(link).toHaveCSS("font-weight","400");
  await expect(link).toHaveCSS("font-family",'微软雅黑, "Microsoft YaHei"');
});
test("home heading reproduces captured font metrics",async({page})=>{
  await page.setViewportSize({width:1440,height:1200});await page.goto("/en/");
  await expect(page.locator("#home-title")).toHaveCSS("font-size","36px");
  await expect(page.locator("#home-title")).toHaveCSS("font-weight","400");
  await expect(page.locator("#home-title")).toHaveCSS("line-height","54px");
});
test("desktop home quote and catalogue preserve distinct source button dimensions and colors",async({page})=>{
  await page.setViewportSize({width:1440,height:1200});await page.goto("/en/");
  const quote=page.locator(".home-products .button-row a").first(),catalogue=page.locator(".home-products .button-row a").nth(1);
  await expect(quote).toHaveCSS("width","220px");await expect(quote).toHaveCSS("height","55px");
  await expect(quote).toHaveCSS("border-radius","50px");await expect(quote).toHaveCSS("background-color","rgb(220, 68, 5)");
  await expect(catalogue).toHaveCSS("width","320px");await expect(catalogue).toHaveCSS("background-color","rgb(226, 192, 112)");
  await quote.hover();await expect(quote).toHaveCSS("background-color","rgb(220, 68, 5)");
});
test("mobile CTA typography and dimensions use the mobile source rather than scaled desktop values",async({page})=>{
  await page.setViewportSize({width:390,height:844});await page.goto("/en/");
  const join=page.locator(".audience-card a").first();
  await expect(join).toHaveCSS("width","200px");await expect(join).toHaveCSS("height","50px");
  await expect(join).toHaveCSS("font-size","14px");await expect(join).toHaveCSS("border-radius","50px");
});
test("product inquiry is a rectangular compact source control and stays functional",async({page})=>{
  await page.setViewportSize({width:1440,height:1200});await page.goto("/en/ProductDetail/11906944.html/");
  const inquiry=page.locator(".product-inquiry");
  await expect(inquiry).toHaveCSS("font-size","12px");await expect(inquiry).toHaveCSS("height","48px");
  await expect(inquiry).toHaveCSS("border-radius","0px");await expect(inquiry).toHaveCSS("background-color","rgb(224, 65, 3)");
  await expect(inquiry).toHaveText("Inquiry");
  expect((await inquiry.boundingBox())!.width).toBeCloseTo(104.984, 1);
  await expect(page.locator(".product-specifications td").first()).toHaveCSS("font-size","16px");
  await inquiry.click();await expect(page.getByRole("dialog")).toBeVisible();
});

test("source tab colors follow the active product tab rather than the captured initial state",async({page})=>{
  await page.setViewportSize({width:1440,height:1200});await page.goto("/en/ProductDetail/11906944.html/");
  const features=page.getByRole("tab",{name:"Product Features",exact:true});
  const accessories=page.getByRole("tab",{name:"Optional Accessories",exact:true});
  await accessories.click();
  await expect(accessories).toHaveCSS("color","rgb(224, 65, 3)");
  await expect(features).toHaveCSS("color","rgb(175, 175, 175)");
});

test("mapped product title typography preserves hover feedback",async({page})=>{
  await page.setViewportSize({width:1440,height:1200});await page.goto("/en/Product/682971.html/");
  const card=page.locator(".product-card").first();
  await expect(card.locator("h2")).toHaveCSS("color","rgb(179, 179, 179)");
  await card.hover();
  await expect(card.locator("h2")).toHaveCSS("color","rgb(196, 58, 2)");
});
