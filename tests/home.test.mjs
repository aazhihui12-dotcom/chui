import test from "node:test";
import assert from "node:assert/strict";
import { renderHomePage } from "../src/pages/home.mjs";
import { assertPublishableCopy } from "../src/lib/claims.mjs";

test("homepage states the business clearly and routes all three audiences", () => {
  const html = renderHomePage();
  assert.equal((html.match(/<h1\b/g) || []).length, 1);
  assert.match(html, /专注女装牛仔/);
  assert.match(html, /直播团队/);
  assert.match(html, /二批与档口/);
  assert.match(html, /实体门店/);
  assert.match(html, /href="\/solutions\/live-commerce\/"/);
  assert.match(html, /href="\/solutions\/wholesale\/"/);
  assert.match(html, /href="\/contact\/"/);
});

test("homepage includes two clear primary conversion actions", () => {
  const html = renderHomePage();
  assert.match(html, />获取当季选款册<\/a>/);
  assert.match(html, />预约到店选款<\/a>/);
  assert.match(html, /href="tel:15382772813"/);
});

test("homepage includes the complete trust and conversion sequence", () => {
  const html = renderHomePage();
  const sectionIds = [
    "audiences",
    "collections",
    "fit-development",
    "showroom",
    "live-support",
    "supply-chain",
    "process",
    "knowledge",
    "contact"
  ];
  for (const id of sectionIds) assert.match(html, new RegExp(`id="${id}"`));
  assert.doesNotThrow(() => assertPublishableCopy(html));
});

test("homepage uses desktop and mobile hero art direction", () => {
  const html = renderHomePage();
  assert.match(html, /<picture>/);
  assert.match(html, /media="\(max-width: 640px\)"/);
  assert.match(html, /hero-mobile-primary\.webp/);
  assert.match(html, /hero-desktop-primary\.webp/);
});
