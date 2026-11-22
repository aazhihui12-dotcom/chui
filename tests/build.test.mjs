import assert from "node:assert/strict";
import { mkdtemp, readFile, stat } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { buildSite, routeToFile } from "../scripts/build.mjs";

test("routeToFile maps clean routes to index files", () => {
  assert.equal(routeToFile("/", "C:/dist"), path.join("C:/dist", "index.html"));
  assert.equal(routeToFile("/collections/", "C:/dist"), path.join("C:/dist", "collections", "index.html"));
});

test("buildSite writes all public pages and crawl files", async () => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "angjiuxi-build-"));
  const result = await buildSite({ outputDir, baseUrl: "http://localhost:4173" });

  assert.equal(result.pages, 15);
  await stat(path.join(outputDir, "index.html"));
  await stat(path.join(outputDir, "collections", "index.html"));
  await stat(path.join(outputDir, "knowledge", "how-to-choose-nanyou-denim-supplier", "index.html"));
  await stat(path.join(outputDir, "styles.css"));
  await stat(path.join(outputDir, "site.js"));
  await stat(path.join(outputDir, "og.png"));

  const home = await readFile(path.join(outputDir, "index.html"), "utf8");
  const sitemap = await readFile(path.join(outputDir, "sitemap.xml"), "utf8");
  const robots = await readFile(path.join(outputDir, "robots.txt"), "utf8");
  assert.match(home, /昂玖熙/);
  assert.match(home, /application\/ld\+json/);
  assert.match(sitemap, /http:\/\/localhost:4173\/collections\//);
  assert.match(robots, /Sitemap: http:\/\/localhost:4173\/sitemap.xml/);
  assert.doesNotMatch(home, /angjiuxi\.example|待确认|cli_|Jvmo|app_secret/);
});

test("buildSite prefixes root-relative assets and links for project pages", async () => {
  const outputDir = await mkdtemp(path.join(os.tmpdir(), "angjiuxi-base-path-"));
  await buildSite({ outputDir, baseUrl: "https://example.com/chui", basePath: "/chui" });
  const home = await readFile(path.join(outputDir, "index.html"), "utf8");
  assert.match(home, /href="\/chui\/styles\.css"/);
  assert.match(home, /src="\/chui\/images\/site\//);
  assert.match(home, /href="\/chui\/contact\//);
});
