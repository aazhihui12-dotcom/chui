import manifest from "@/source-cache/manifest.json";

it("inventories the complete public source", () => {
  expect(manifest.sitemapUrls).toHaveLength(102);
  expect(new Set(manifest.sitemapUrls).size).toBeLessThanOrEqual(102);
  expect(manifest.pages.filter((page) => page.kind === "product-detail")).toHaveLength(24);
  expect(manifest.pages.filter((page) => page.kind === "news-detail")).toHaveLength(34);
});
