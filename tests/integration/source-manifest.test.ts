import manifest from "@/source-cache/manifest.json";

it("inventories the complete public source", () => {
  expect(manifest.sitemapUrls).toHaveLength(102);
  expect(new Set(manifest.sitemapUrls).size).toBeLessThanOrEqual(102);
  expect(manifest.pages.map((page) => page.url)).toEqual(manifest.sitemapUrls);
  expect(manifest.pages.filter((page) => page.kind === "product-detail")).toHaveLength(24);
  expect(manifest.pages.filter((page) => page.kind === "news-detail")).toHaveLength(34);
});

it("retains two locale provenance records and SHA-256 metadata independent of raw cache", () => {
  for (const page of manifest.pages) {
    expect(manifest.sitemapUrls).toContain(page.url);
    expect(page.localeVariants.map((variant) => variant.locale).sort()).toEqual(["cn", "en"]);

  }

  for (const asset of manifest.assets.filter((asset) => asset.status >= 200 && asset.status < 300)) {
    expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);
  }
});

it("completely captures the product and news detail pages", () => {
  const detailPages = manifest.pages.filter((page) =>
    page.kind === "product-detail" || page.kind === "news-detail",
  );

  expect(detailPages).toHaveLength(58);
  for (const page of detailPages) {
    expect(page.status).toBeGreaterThanOrEqual(200);
    expect(page.status).toBeLessThan(300);
    expect(page.localeVariants.every((variant) => variant.status >= 200 && variant.status < 300)).toBe(true);
    const chinese = page.localeVariants.find((variant) => variant.locale === "cn");
    if (!chinese.languageVerified) {
      expect(chinese.resolvedUrl).toBe(`https://lbhappliances.com${page.pathname}`);
    }
  }
});
