import { readFile, writeFile, mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import { JSDOM } from "jsdom";

const argument = (name, fallback) => {
  const index = process.argv.indexOf(name);
  return index === -1 ? fallback : process.argv[index + 1];
};
const output = path.resolve(argument("--output", "out"));
const manifest = JSON.parse(await readFile(argument("--manifest", "source-cache/manifest.json"), "utf8"));
const sourcePaths = [...new Set(manifest.sitemapUrls.map(url => new URL(url).pathname.replace(/\/$/, "") || "/"))];
const targetPath = sourcePath => `/en${sourcePath === "/" ? "" : sourcePath}/`;
const htmlFile = pathname => path.join(output, pathname, "index.html");
const existsAsFile = async filename => {
  try { return (await stat(filename)).isFile(); } catch { return false; }
};
const errors = [];

for (const sourcePath of sourcePaths) {
  for (const locale of ["en", "cn"]) {
    const pathname = `/${locale}${sourcePath === "/" ? "" : sourcePath}`;
    if (!await existsAsFile(htmlFile(pathname))) errors.push(`Missing localized export: ${pathname}`);
  }
}

// Next clears out/ on every build. Run generation only after a successful export.
if (process.argv.includes("--generate-legacy") && !errors.length) {
  for (const sourcePath of sourcePaths) {
    const target = targetPath(sourcePath);
    const escapedTarget = target.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
    const scriptTarget = JSON.stringify(target).replaceAll("<", "\\u003c");
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LBH Appliances</title><link rel="canonical" href="${escapedTarget}"><script>location.replace(${scriptTarget} + location.search + location.hash);</script><meta http-equiv="refresh" content="0;url=${escapedTarget}"></head><body><p>This page has moved. <a href="${escapedTarget}">Continue to LBH Appliances</a></p></body></html>\n`;
    const file = htmlFile(sourcePath);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, html);
  }
}

for (const sourcePath of sourcePaths) {
  const filename = htmlFile(sourcePath);
  if (!await existsAsFile(filename)) {
    errors.push(`Missing legacy redirect: ${sourcePath}`);
    continue;
  }
  const dom = new JSDOM(await readFile(filename, "utf8"));
  const refresh = dom.window.document.querySelector('meta[http-equiv="refresh"]')?.getAttribute("content");
  const link = dom.window.document.querySelector("a[href]")?.getAttribute("href");
  if (refresh !== `0;url=${targetPath(sourcePath)}` || link !== targetPath(sourcePath)) errors.push(`Invalid legacy redirect: ${sourcePath}`);
  dom.window.close();
}

async function* htmlFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const filename = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (!["_next", "assets"].includes(entry.name)) yield* htmlFiles(filename);
    } else if (entry.name.endsWith(".html")) yield filename;
  }
}

const baseOrigin = new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").origin;
const resolutionCache = new Map();
for await (const filename of htmlFiles(output)) {
  const relativeFile = path.relative(output, filename).split(path.sep).join("/");
  const pagePath = `/${relativeFile.replace(/index\.html$/, "")}`;
  const dom = new JSDOM(await readFile(filename, "utf8"));
  for (const link of dom.window.document.querySelectorAll("a[href]")) {
    const href = link.getAttribute("href");
    let url;
    try { url = new URL(href, `${baseOrigin}${pagePath}`); } catch {
      errors.push(`Invalid link in ${pagePath}: ${href}`);
      continue;
    }
    if (url.origin !== baseOrigin || !["http:", "https:"].includes(url.protocol)) continue;
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); } catch {
      errors.push(`Invalid path in ${pagePath}: ${href}`);
      continue;
    }
    if (!resolutionCache.has(pathname)) {
      const direct = path.resolve(output, `.${pathname}`);
      const insideOutput = direct === output || direct.startsWith(`${output}${path.sep}`);
      resolutionCache.set(pathname, insideOutput && (await existsAsFile(direct) || await existsAsFile(path.join(direct, "index.html"))));
    }
    if (!resolutionCache.get(pathname)) errors.push(`Broken internal link in ${pagePath}: ${href}`);
  }
  dom.window.close();
}

if (errors.length) {
  console.error(`Route integrity failed:\n- ${[...new Set(errors)].join("\n- ")}`);
  process.exitCode = 1;
} else {
  console.log(`Route integrity passed: ${sourcePaths.length * 2} localized pages, ${sourcePaths.length} legacy redirects; internal links resolve.`);
}
