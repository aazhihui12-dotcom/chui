import { cp, mkdir, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { siteConfig } from "../src/data/site-content.mjs";
import { knowledgeArticles } from "../src/data/knowledge.mjs";
import { renderDocument, buildSitemapEntries } from "../src/lib/seo.mjs";
import { renderHomePage } from "../src/pages/home.mjs";
import { renderCollectionsPage } from "../src/pages/collections.mjs";
import { renderLiveCommercePage } from "../src/pages/live-commerce.mjs";
import { renderWholesalePage } from "../src/pages/wholesale.mjs";
import { renderSupplyChainPage } from "../src/pages/supply-chain.mjs";
import { renderKnowledgeArticle, renderKnowledgeIndex } from "../src/pages/knowledge.mjs";
import { renderContactPage } from "../src/pages/contact.mjs";

const projectDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(projectDir, "public");

function normalizeBaseUrl(value) {
  return value.replace(/\/$/, "");
}

function normalizeBasePath(value = "") {
  if (!value || value === "/") return "";
  return `/${value.replace(/^\/+|\/+$/g, "")}`;
}

export function applyBasePath(html, basePath = "") {
  const prefix = normalizeBasePath(basePath);
  if (!prefix) return html;
  return html
    .replaceAll('href="/', `href="${prefix}/`)
    .replaceAll('src="/', `src="${prefix}/`)
    .replaceAll('data-fallback-href="/', `data-fallback-href="${prefix}/`);
}

export function routeToFile(route, outputDir) {
  const cleanRoute = route.replace(/^\/+|\/+$/g, "");
  return cleanRoute ? path.join(outputDir, cleanRoute, "index.html") : path.join(outputDir, "index.html");
}

export function createPages() {
  const home = {
    path: "/",
    title: "昂玖熙｜女装牛仔品牌与供应链平台",
    description: `${siteConfig.positioning}。${siteConfig.description}`,
    body: renderHomePage()
  };

  return [
    home,
    renderCollectionsPage(),
    renderLiveCommercePage(),
    renderWholesalePage(),
    renderSupplyChainPage(),
    renderKnowledgeIndex(),
    renderContactPage(),
    ...knowledgeArticles.map((article) => renderKnowledgeArticle(article.slug))
  ];
}

function renderSitemap(baseUrl) {
  const entries = buildSitemapEntries(baseUrl);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries
    .map(({ loc, lastmod }) => `  <url><loc>${loc}</loc><lastmod>${lastmod}</lastmod></url>`)
    .join("\n")}\n</urlset>\n`;
}

function assertSafeOutput(outputDir) {
  const resolved = path.resolve(outputDir);
  const root = path.parse(resolved).root;
  if (resolved === root || resolved === projectDir) {
    throw new Error(`Refusing to replace unsafe output directory: ${resolved}`);
  }
  return resolved;
}

export async function buildSite({
  outputDir = process.env.OUTPUT_DIR || path.join(projectDir, "out"),
  baseUrl = process.env.SITE_URL || "http://localhost:4173",
  basePath = process.env.BASE_PATH || ""
} = {}) {
  const safeOutput = assertSafeOutput(outputDir);
  const siteUrl = normalizeBaseUrl(baseUrl);
  const pages = createPages();

  await rm(safeOutput, { recursive: true, force: true });
  await mkdir(safeOutput, { recursive: true });
  await cp(publicDir, safeOutput, { recursive: true });

  for (const page of pages) {
    const file = routeToFile(page.path, safeOutput);
    await mkdir(path.dirname(file), { recursive: true });
    await writeFile(file, applyBasePath(renderDocument(page, siteUrl), basePath), "utf8");
  }

  await writeFile(path.join(safeOutput, "sitemap.xml"), renderSitemap(siteUrl), "utf8");
  await writeFile(
    path.join(safeOutput, "robots.txt"),
    `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`,
    "utf8"
  );

  return { outputDir: safeOutput, pages: pages.length, baseUrl: siteUrl };
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const result = await buildSite();
  console.log(`Built ${result.pages} pages in ${result.outputDir}`);
}
