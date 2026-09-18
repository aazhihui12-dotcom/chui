import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";

const BROWSER_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const RETRY_DELAYS_MS = [200, 500, 1_000];

const classify = (pathname) => pathname.includes("/ProductDetail/") ? "product-detail"
  : pathname.includes("/NewsDetail/") ? "news-detail"
  : pathname.includes("/NewsList/") ? "news-list"
  : pathname.includes("/Product/") ? "product-category"
  : pathname.endsWith("/ProductIndex") ? "product-index"
  : pathname === "/" ? "home" : "content";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

const cachePathFor = (prefix, url, extension) => {
  const digest = createHash("sha256").update(url).digest("hex");
  return path.posix.join(prefix, `${digest}${extension}`);
};

const pathnameFromSitemapUrl = (url) => {
  const pathname = new URL(url).pathname;
  return pathname === "/" ? "/" : pathname.replace(/\/$/, "");
};

const localeUrl = (origin, locale, pathname) =>
  new URL(pathname === "/" ? `/${locale}/` : `/${locale}${pathname}`, origin).href;

const extensionFor = (url, contentType = "") => {
  const fromPath = path.posix.extname(new URL(url).pathname).slice(0, 16);
  if (fromPath) return fromPath.toLowerCase();

  if (contentType.includes("image/png")) return ".png";
  if (contentType.includes("image/jpeg")) return ".jpg";
  if (contentType.includes("image/svg+xml")) return ".svg";
  if (contentType.includes("video/mp4")) return ".mp4";
  if (contentType.includes("text/css")) return ".css";
  return ".bin";
};

async function curl(url) {
  const metadataMarker = "\n__LBH_CAPTURE_METADATA__";
  const process = spawn("curl", [
    "--location",
    "--silent",
    "--show-error",
    "--user-agent", BROWSER_USER_AGENT,
    "--write-out", `${metadataMarker}%{http_code}\n%{content_type}`,
    url,
  ]);
  const stdout = [];
  const stderr = [];
  process.stdout.on("data", (chunk) => stdout.push(chunk));
  process.stderr.on("data", (chunk) => stderr.push(chunk));

  const exitCode = await new Promise((resolve) => process.on("close", resolve));
  const output = Buffer.concat(stdout);
  const marker = Buffer.from(metadataMarker);
  const markerPosition = output.lastIndexOf(marker);
  if (exitCode !== 0 || markerPosition === -1) {
    return { ok: false, status: 0, headers: new Headers(), body: Buffer.alloc(0), error: Buffer.concat(stderr).toString("utf8") };
  }

  const [statusText, contentType = ""] = output.subarray(markerPosition + marker.length).toString("utf8").split("\n");
  const status = Number.parseInt(statusText, 10);
  const body = output.subarray(0, markerPosition);
  return {
    ok: status >= 200 && status < 300,
    status: Number.isInteger(status) ? status : 0,
    headers: new Headers([["content-type", contentType]]),
    text: async () => body.toString("utf8"),
    arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
  };
}

async function fetchWithRetry(url) {
  let lastError;

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await curl(url);

      if (!(response.status === 429 || response.status >= 500) || attempt === RETRY_DELAYS_MS.length) {
        return response;
      }
      await sleep(RETRY_DELAYS_MS[attempt]);
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_DELAYS_MS.length) break;
      await sleep(RETRY_DELAYS_MS[attempt]);
    }
  }

  return { ok: false, status: 0, headers: new Headers(), error: String(lastError) };
}

const sitemapUrlsFrom = (xml) => [...xml.matchAll(/<loc>\s*([^<]+?)\s*<\/loc>/g)].map((match) => match[1]);

const attributeValue = /(?:src|poster|data-src|data-original)\s*=\s*["']([^"']+)["']/gi;
const assetHref = /href\s*=\s*["']([^"']+)["']/gi;
const assetFile = /\.(?:avif|bmp|css|gif|ico|jpe?g|m4a|mp3|mp4|ogg|otf|pdf|png|svg|ttf|wav|webm|webp|woff2?)(?:[?#]|$)/i;

function assetsFromHtml(html, pageUrl) {
  const assets = new Set();
  const add = (value) => {
    if (!value || /^(?:#|data:|javascript:|mailto:|tel:)/i.test(value)) return;
    try {
      assets.add(new URL(value.startsWith("//") ? `https:${value}` : value, pageUrl).href);
    } catch {
      // Invalid authoring should not prevent capture of the remaining assets.
    }
  };

  for (const match of html.matchAll(attributeValue)) add(match[1]);
  for (const match of html.matchAll(assetHref)) {
    if (assetFile.test(match[1])) add(match[1]);
  }
  return assets;
}

async function writeRelative(cacheDir, relativePath, contents) {
  const destination = path.join(cacheDir, relativePath);
  await mkdir(path.dirname(destination), { recursive: true });
  await writeFile(destination, contents);
}

async function mapWithConcurrency(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function captureLocaleVariant({ origin, cacheDir, locale, pathname }) {
  const url = localeUrl(origin, locale, pathname);
  const response = await fetchWithRetry(url);
  const cacheFile = cachePathFor("pages", url, ".html");
  const status = response.status;
  const result = { locale, url, cacheFile, status };

  if (!response.ok) return { ...result, assets: [] };

  const html = await response.text();
  await writeRelative(cacheDir, cacheFile, html);
  return { ...result, assets: assetsFromHtml(html, url) };
}

async function captureAsset({ sourceUrl, referencedBy, cacheDir }) {
  const response = await fetchWithRetry(sourceUrl);
  const contentType = response.headers.get("content-type") ?? null;
  const status = response.status;

  if (!response.ok) {
    return { sourceUrl, localPath: null, contentType, sha256: null, referencedBy, status };
  }

  const contents = Buffer.from(await response.arrayBuffer());
  const sha256 = createHash("sha256").update(contents).digest("hex");
  const localPath = cachePathFor("assets", sourceUrl, extensionFor(sourceUrl, contentType));
  await writeRelative(cacheDir, localPath, contents);
  return { sourceUrl, localPath, contentType, sha256, referencedBy, status };
}

export async function captureSource({ origin, cacheDir }) {
  const normalizedOrigin = new URL(origin).origin;
  const resolvedCacheDir = path.resolve(cacheDir);
  let sitemapResponse = await fetchWithRetry(new URL("/sitemap.xml", normalizedOrigin).href);
  let captureOrigin = normalizedOrigin;
  if (!sitemapResponse.ok && new URL(normalizedOrigin).hostname.startsWith("www.") === false) {
    const withWww = new URL(normalizedOrigin);
    withWww.hostname = `www.${withWww.hostname}`;
    sitemapResponse = await fetchWithRetry(new URL("/sitemap.xml", withWww).href);
    captureOrigin = withWww.origin;
  }
  if (!sitemapResponse.ok) {
    throw new Error(`Unable to fetch sitemap.xml (HTTP ${sitemapResponse.status}).`);
  }

  const sitemapUrls = sitemapUrlsFrom(await sitemapResponse.text());
  const capturedPages = await mapWithConcurrency(sitemapUrls, 8, async (url) => {
    const pathname = pathnameFromSitemapUrl(url);
    const localeVariants = [];
    const pageAssets = new Set();

    for (const locale of ["en", "cn"]) {
      const variant = await captureLocaleVariant({
        origin: captureOrigin,
        cacheDir: resolvedCacheDir,
        locale,
        pathname,
      });
      localeVariants.push({
        locale: variant.locale,
        url: variant.url,
        cacheFile: variant.cacheFile,
        status: variant.status,
      });
      for (const sourceUrl of variant.assets) pageAssets.add(sourceUrl);
    }

    const english = localeVariants.find((variant) => variant.locale === "en");
    return {
      url,
      pathname,
      kind: classify(pathname),
      localeVariants,
      cacheFile: english.cacheFile,
      status: english.status,
      pageAssets,
    };
  });

  const assetsByUrl = new Map();
  const pages = capturedPages.map(({ pageAssets, ...page }) => {
    for (const sourceUrl of pageAssets) {
      const referencedBy = assetsByUrl.get(sourceUrl) ?? new Set();
      referencedBy.add(page.url);
      assetsByUrl.set(sourceUrl, referencedBy);
    }
    return page;
  });

  const assets = await mapWithConcurrency([...assetsByUrl], 8, async ([sourceUrl, referencedBy]) =>
    captureAsset({
      sourceUrl,
      referencedBy: [...referencedBy].sort(),
      cacheDir: resolvedCacheDir,
    }),
  );
  assets.sort((left, right) => left.sourceUrl.localeCompare(right.sourceUrl));

  const manifest = {
    capturedAt: new Date().toISOString(),
    sitemapUrls,
    pages,
    assets,
  };
  await writeRelative(resolvedCacheDir, "manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

function argumentValue(name, fallback) {
  const position = process.argv.indexOf(name);
  return position === -1 ? fallback : process.argv[position + 1];
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  const origin = argumentValue("--origin", "https://lbhappliances.com");
  const cacheDir = argumentValue("--cache", "source-cache");
  const manifest = await captureSource({ origin, cacheDir });
  console.log(`Captured ${manifest.pages.length} sitemap records and ${manifest.assets.length} assets.`);
}
