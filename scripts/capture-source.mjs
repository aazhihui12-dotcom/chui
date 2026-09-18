import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const BROWSER_USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36";
const RETRY_DELAYS_MS = [1_500, 3_500, 7_000];
const PAGE_REQUEST_GAP_MS = 1_200;
const ASSET_CONCURRENCY = 3;

const classify = (pathname) => pathname.includes("/ProductDetail/") ? "product-detail"
  : pathname.includes("/NewsDetail/") ? "news-detail"
  : pathname.includes("/NewsList/") ? "news-list"
  : pathname.includes("/Product/") ? "product-category"
  : pathname.endsWith("/ProductIndex") ? "product-index"
  : pathname === "/" ? "home" : "content";

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const jittered = (milliseconds) => milliseconds + Math.floor(Math.random() * 500);

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

async function curl(url, { cookieJar, cookie, referer, acceptLanguage, persistCookies = true } = {}) {
  const metadataMarker = "\n__LBH_CAPTURE_METADATA__";
  const arguments_ = [
    "--location",
    "--silent",
    "--show-error",
    "--connect-timeout", "10",
    "--max-time", "45",
    "--user-agent", BROWSER_USER_AGENT,
    "--write-out", `${metadataMarker}%{http_code}\n%{content_type}\n%{url_effective}`,
  ];
  if (cookieJar) arguments_.push("--cookie", cookieJar);
  if (cookieJar && persistCookies) arguments_.push("--cookie-jar", cookieJar);
  if (cookie) arguments_.push("--cookie", cookie);
  if (referer) arguments_.push("--referer", referer);
  if (acceptLanguage) arguments_.push("--header", `Accept-Language: ${acceptLanguage}`);
  arguments_.push(url);
  const process = spawn("curl", arguments_);
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

  const [statusText, contentType = "", resolvedUrl = url] = output.subarray(markerPosition + marker.length).toString("utf8").split("\n");
  const status = Number.parseInt(statusText, 10);
  const body = output.subarray(0, markerPosition);
  return {
    ok: status >= 200 && status < 300,
    status: Number.isInteger(status) ? status : 0,
    resolvedUrl,
    headers: new Headers([["content-type", contentType]]),
    text: async () => body.toString("utf8"),
    arrayBuffer: async () => body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength),
  };
}

async function fetchWithRetry(url, context) {
  const attempts = [];

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt += 1) {
    try {
      const response = await curl(url, context);
      attempts.push({ url, status: response.status, resolvedUrl: response.resolvedUrl ?? url });

      if (!(response.status === 429 || response.status >= 500) || attempt === RETRY_DELAYS_MS.length) {
        return { ...response, attempts };
      }
      await sleep(jittered(RETRY_DELAYS_MS[attempt]));
    } catch (error) {
      attempts.push({ url, status: 0, error: String(error) });
      if (attempt !== RETRY_DELAYS_MS.length) await sleep(jittered(RETRY_DELAYS_MS[attempt]));
    }
  }

  return { ok: false, status: 0, headers: new Headers(), attempts };
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

const contentLocale = (html) => html.match(/<html[^>]+lang=["']?([\w-]+)/i)?.[1]?.toLowerCase() ?? null;
const isSuccessful = (status) => status >= 200 && status < 300;

async function cachedVariant({ previous, cacheDir, cacheFile, locale, requestedUrl }) {
  const candidate = previous?.cacheFile ?? cacheFile;
  if (!candidate) return null;
  const cachePath = path.join(cacheDir, candidate);
  if (!existsSync(cachePath)) return null;
  const html = await readFile(cachePath, "utf8");
  if (html.length <= 100) return null;
  return {
    ...previous,
    locale,
    url: requestedUrl,
    resolvedUrl: previous?.resolvedUrl ?? requestedUrl,
    cacheFile: candidate,
    status: 200,
    contentLocale: previous?.contentLocale ?? contentLocale(html),
    languageVerified: previous?.languageVerified ?? false,
    diagnostics: previous?.diagnostics ?? [],
    assets: assetsFromHtml(html, previous?.resolvedUrl ?? requestedUrl),
    resumed: true,
  };
}

async function captureLocaleVariant({ origin, cacheDir, cookieJar, locale, pathname, kind, previous }) {
  const requestedUrl = localeUrl(origin, locale, pathname);
  const cacheFile = cachePathFor("pages", requestedUrl, ".html");
  const resumed = await cachedVariant({ previous, cacheDir, cacheFile, locale, requestedUrl });
  const needsChineseFallback = locale === "cn"
    && (kind === "product-detail" || kind === "news-detail")
    && resumed
    && !resumed.languageVerified
    && new URL(resumed.resolvedUrl).pathname.startsWith("/cn/");
  if (resumed && !needsChineseFallback) return resumed;

  const fallbackUrl = new URL(pathname, origin).href;
  const requestContext = {
    cookieJar,
    cookie: `Lang=${locale}`,
    acceptLanguage: locale === "cn" ? "zh-CN,zh;q=0.9" : "en-US,en;q=0.9",
  };
  const candidates = (needsChineseFallback ? [fallbackUrl] : [requestedUrl, fallbackUrl])
    .filter((url, index, urls) => urls.indexOf(url) === index);
  const diagnostics = [...(previous?.diagnostics ?? [])];

  for (const candidate of candidates) {
    const response = await fetchWithRetry(candidate, requestContext);
    diagnostics.push(...response.attempts);
    if (!response.ok) continue;

    const html = await response.text();
    const resolvedUrl = response.resolvedUrl || candidate;
    const detectedLocale = contentLocale(html);
    if (locale === "cn" && candidate === requestedUrl && !/^(?:zh|cn)/.test(detectedLocale ?? "")) {
      diagnostics.push({ url: candidate, status: response.status, resolvedUrl, contentLocale: detectedLocale, languageVerified: false });
      continue;
    }
    await writeRelative(cacheDir, cacheFile, html);
    return {
      locale,
      url: requestedUrl,
      resolvedUrl,
      cacheFile,
      status: response.status,
      contentLocale: detectedLocale,
      languageVerified: locale === "en" ? detectedLocale === "en" : /^(?:zh|cn)/.test(detectedLocale ?? ""),
      diagnostics,
      assets: assetsFromHtml(html, resolvedUrl),
    };
  }

  const finalAttempt = diagnostics.at(-1);
  return {
    locale,
    url: requestedUrl,
    resolvedUrl: finalAttempt?.resolvedUrl ?? requestedUrl,
    cacheFile,
    status: finalAttempt?.status ?? 0,
    contentLocale: null,
    languageVerified: false,
    diagnostics,
    assets: [],
  };
}

async function cachedAsset(previous, cacheDir, sourceUrl) {
  const digest = createHash("sha256").update(sourceUrl).digest("hex");
  const candidate = previous?.localPath ?? (await readdir(path.join(cacheDir, "assets")).catch(() => [])).find((file) => file.startsWith(digest));
  if (!candidate) return null;
  const localPath = previous?.localPath ?? path.posix.join("assets", candidate);
  const assetPath = path.join(cacheDir, localPath);
  if (!existsSync(assetPath)) return null;
  const contents = await readFile(assetPath);
  const sha256 = createHash("sha256").update(contents).digest("hex");
  if (previous?.sha256 && sha256 !== previous.sha256) return null;
  return { ...previous, sourceUrl, localPath, sha256, contentType: previous?.contentType ?? null, status: 200 };
}

async function captureAsset({ sourceUrl, referencedBy, referer, cacheDir, cookieJar, previous }) {
  const resumed = await cachedAsset(previous, cacheDir, sourceUrl);
  if (resumed) return { ...resumed, referencedBy };

  const response = await fetchWithRetry(sourceUrl, {
    cookieJar,
    cookie: "Lang=en",
    referer,
    acceptLanguage: "en-US,en;q=0.9",
    persistCookies: false,
  });
  const contentType = response.headers.get("content-type") ?? null;
  const status = response.status;

  if (!response.ok) {
    return { sourceUrl, localPath: null, contentType, sha256: null, referencedBy, status, diagnostics: response.attempts };
  }

  const contents = Buffer.from(await response.arrayBuffer());
  const sha256 = createHash("sha256").update(contents).digest("hex");
  const localPath = cachePathFor("assets", sourceUrl, extensionFor(sourceUrl, contentType));
  await writeRelative(cacheDir, localPath, contents);
  return { sourceUrl, localPath, contentType, sha256, referencedBy, status, diagnostics: response.attempts };
}

export async function captureSource({ origin, cacheDir }) {
  const normalizedOrigin = new URL(origin).origin;
  const resolvedCacheDir = path.resolve(cacheDir);
  await mkdir(resolvedCacheDir, { recursive: true });
  const cookieJar = path.join(resolvedCacheDir, "session-cookies.txt");
  if (!existsSync(cookieJar)) await writeFile(cookieJar, "");
  const previousManifest = await readManifest(resolvedCacheDir);
  const previousPages = new Map(previousManifest?.pages?.map((page) => [page.url, page]));
  const previousAssets = new Map(previousManifest?.assets?.map((asset) => [asset.sourceUrl, asset]));

  let sitemapResponse = await fetchWithRetry(new URL("/sitemap.xml", normalizedOrigin).href, { cookieJar });
  let captureOrigin = normalizedOrigin;
  if (!sitemapResponse.ok && new URL(normalizedOrigin).hostname.startsWith("www.") === false) {
    const withWww = new URL(normalizedOrigin);
    withWww.hostname = `www.${withWww.hostname}`;
    sitemapResponse = await fetchWithRetry(new URL("/sitemap.xml", withWww).href, { cookieJar });
    captureOrigin = withWww.origin;
  }
  if (!sitemapResponse.ok) {
    throw new Error(`Unable to fetch sitemap.xml (HTTP ${sitemapResponse.status}).`);
  }

  const sitemapUrls = sitemapUrlsFrom(await sitemapResponse.text());
  const capturedPages = [];
  for (const url of sitemapUrls) {
    const pathname = pathnameFromSitemapUrl(url);
    const kind = classify(pathname);
    const previousPage = previousPages.get(url);
    const localeVariants = [];
    const pageAssets = new Map();

    for (const locale of ["en", "cn"]) {
      const previousVariant = previousPage?.localeVariants?.find((variant) => variant.locale === locale);
      const variant = await captureLocaleVariant({
        origin: captureOrigin,
        cacheDir: resolvedCacheDir,
        cookieJar,
        locale,
        pathname,
        kind,
        previous: previousVariant,
      });
      localeVariants.push({
        locale: variant.locale,
        url: variant.url,
        resolvedUrl: variant.resolvedUrl,
        cacheFile: variant.cacheFile,
        status: variant.status,
        contentLocale: variant.contentLocale,
        languageVerified: variant.languageVerified,
        diagnostics: variant.diagnostics,
      });
      for (const sourceUrl of variant.assets) pageAssets.set(sourceUrl, variant.resolvedUrl);
      if (!variant.resumed) await sleep(jittered(PAGE_REQUEST_GAP_MS));
    }

    const english = localeVariants.find((variant) => variant.locale === "en");
    capturedPages.push({
      url,
      pathname,
      kind,
      localeVariants,
      cacheFile: english.cacheFile,
      status: english.status,
      pageAssets,
    });
  }

  const assetsByUrl = new Map();
  const pages = capturedPages.map(({ pageAssets, ...page }) => {
    for (const [sourceUrl, referer] of pageAssets) {
      const context = assetsByUrl.get(sourceUrl) ?? { referencedBy: new Set(), referers: new Set() };
      context.referencedBy.add(page.url);
      context.referers.add(referer);
      assetsByUrl.set(sourceUrl, context);
    }
    return page;
  });

  const assets = await mapWithConcurrency([...assetsByUrl], ASSET_CONCURRENCY, async ([sourceUrl, context]) =>
    captureAsset({
      sourceUrl,
      referencedBy: [...context.referencedBy].sort(),
      referer: [...context.referers][0],
      cacheDir: resolvedCacheDir,
      cookieJar,
      previous: previousAssets.get(sourceUrl),
    }),
  );
  assets.sort((left, right) => left.sourceUrl.localeCompare(right.sourceUrl));

  const manifest = {
    capturedAt: new Date().toISOString(),
    sitemapUrls,
    pages,
    assets,
    sitemapDiagnostics: sitemapResponse.attempts,
  };
  await writeRelative(resolvedCacheDir, "manifest.json", `${JSON.stringify(manifest, null, 2)}\n`);
  return manifest;
}

async function readManifest(cacheDir) {
  try {
    return JSON.parse(await readFile(path.join(cacheDir, "manifest.json"), "utf8"));
  } catch {
    return null;
  }
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
