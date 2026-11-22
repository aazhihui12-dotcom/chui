import test from "node:test";
import assert from "node:assert/strict";
import { knowledgeArticles } from "../src/data/knowledge.mjs";
import {
  buildMetadata,
  buildOrganizationJsonLd,
  buildArticleJsonLd,
  buildSitemapEntries,
  renderDocument
} from "../src/lib/seo.mjs";

const baseUrl = "https://angjiuxi.example";

test("metadata creates absolute canonical and social values", () => {
  const metadata = buildMetadata({ path: "/collections/", title: "当季选款｜昂玖熙", description: "这是用于测试的完整页面描述，说明昂玖熙女装牛仔选款方向与合作方式。" }, baseUrl);
  assert.equal(metadata.canonical, "https://angjiuxi.example/collections/");
  assert.equal(metadata.title, "当季选款｜昂玖熙");
  assert.match(metadata.description, /女装牛仔/);
  assert.equal(metadata.ogImage, "https://angjiuxi.example/og.png");
});

test("organization structured data contains consistent non-empty entity facts", () => {
  const data = buildOrganizationJsonLd(baseUrl);
  assert.equal(data["@type"], "Organization");
  assert.equal(data.name, "昂玖熙");
  assert.equal(data.legalName, "广州市昂玖熙服饰有限公司");
  assert.equal(data.url, baseUrl);
  assert.equal(data.telephone, "15382772813");
  assert.ok(Object.values(data).every((value) => value !== "" && value !== null));
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(data)));
});

test("article structured data preserves Chinese question and dates", () => {
  const article = knowledgeArticles[0];
  const data = buildArticleJsonLd(article, baseUrl);
  assert.equal(data.headline, article.question);
  assert.equal(data.dateModified, "2026-11-11");
  assert.equal(data.mainEntityOfPage, `${baseUrl}/knowledge/${article.slug}/`);
  assert.doesNotThrow(() => JSON.parse(JSON.stringify(data)));
});

test("sitemap contains every public route exactly once", () => {
  const entries = buildSitemapEntries(baseUrl);
  const urls = entries.map((entry) => entry.loc);
  assert.equal(urls.length, 15);
  assert.equal(new Set(urls).size, urls.length);
  assert.ok(urls.includes(`${baseUrl}/`));
  assert.ok(urls.includes(`${baseUrl}/contact/`));
  for (const article of knowledgeArticles) {
    assert.ok(urls.includes(`${baseUrl}/knowledge/${article.slug}/`));
  }
  assert.ok(urls.every((url) => !url.includes("unknown")));
});

test("document renderer emits crawlable metadata, layout, and JSON-LD", () => {
  const html = renderDocument({ path: "/contact/", title: "联系昂玖熙", description: "联系昂玖熙预约广州展厅并获取女装牛仔当季选款册。", body: "<main><h1>联系昂玖熙</h1></main>" }, baseUrl);
  assert.match(html, /<html lang="zh-CN">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/angjiuxi\.example\/contact\/">/);
  assert.match(html, /application\/ld\+json/);
  assert.match(html, /aria-label="主导航"/);
  assert.match(html, /广州市昂玖熙服饰有限公司/);
  assert.match(html, /<main><h1>联系昂玖熙<\/h1><\/main>/);
});
