import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";

const cacheArgument = process.argv.indexOf("--cache");
const cacheDir = cacheArgument === -1 ? "source-cache" : process.argv[cacheArgument + 1];
const manifestPath = path.join(cacheDir, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const errors = [];
const successful = (status) => status >= 200 && status < 300;

if (manifest.sitemapUrls.length !== 102) errors.push(`expected 102 sitemap URLs, found ${manifest.sitemapUrls.length}`);
if (manifest.pages.length !== manifest.sitemapUrls.length) errors.push("every sitemap URL must have a page record");
if (manifest.pages.some((page, index) => page.url !== manifest.sitemapUrls[index])) errors.push("page records must correspond to sitemap records in order");
if (manifest.pages.filter((page) => page.kind === "product-detail").length !== 24) errors.push("expected 24 product-detail records");
if (manifest.pages.filter((page) => page.kind === "news-detail").length !== 34) errors.push("expected 34 news-detail records");
if (manifest.pages.some((page) => !page.url || !page.pathname || !page.cacheFile || typeof page.status !== "number")) {
  errors.push("every page needs its URL, pathname, cache file, and HTTP status");
}
for (const page of manifest.pages) {
  const locales = page.localeVariants?.map((variant) => variant.locale).sort();
  if (locales?.join(",") !== "cn,en") {
    errors.push(`page ${page.url} must have exactly cn and en locale variants`);
    break;
  }
  for (const variant of page.localeVariants.filter((variant) => successful(variant.status))) {
    const cachePath = path.join(cacheDir, variant.cacheFile);
    if (!existsSync(cachePath) || readFileSync(cachePath, "utf8").length <= 100) {
      errors.push(`successful locale capture is missing cached content: ${variant.url}`);
      break;
    }
  }
}
const detailPages = manifest.pages.filter((page) => page.kind === "product-detail" || page.kind === "news-detail");
if (detailPages.some((page) => !successful(page.status) || page.localeVariants.some((variant) => !successful(variant.status)))) {
  errors.push("all product and news detail pages must have successful locale captures");
}
if (manifest.assets.some((asset) => !asset.sourceUrl || !Array.isArray(asset.referencedBy) || typeof asset.status !== "number")) {
  errors.push("every asset needs its source URL, referrers, and HTTP status");
}
for (const asset of manifest.assets.filter((asset) => successful(asset.status))) {
  const assetPath = path.join(cacheDir, asset.localPath);
  if (!existsSync(assetPath) || createHash("sha256").update(readFileSync(assetPath)).digest("hex") !== asset.sha256) {
    errors.push(`successful asset is missing or has a checksum mismatch: ${asset.sourceUrl}`);
    break;
  }
}

if (errors.length > 0) {
  console.error(`Invalid source manifest:\n- ${errors.join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Valid source manifest: ${manifest.pages.length} pages, ${manifest.assets.length} assets.`);
}
