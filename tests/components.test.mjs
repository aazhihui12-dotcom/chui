import test from "node:test";
import assert from "node:assert/strict";
import {
  renderSiteHeader,
  renderSiteFooter,
  renderContactActions,
  renderSectionHeading
} from "../src/components.mjs";

test("header exposes accessible primary navigation and contact route", () => {
  const html = renderSiteHeader("/");
  assert.match(html, /<nav[^>]+aria-label="主导航"/);
  assert.match(html, /href="\/collections\/"/);
  assert.match(html, /href="\/solutions\/live-commerce\/"/);
  assert.match(html, /href="\/showroom-supply-chain\/"/);
  assert.match(html, /href="\/knowledge\/"/);
  assert.match(html, /href="\/contact\/"/);
  assert.match(html, /aria-current="page"/);
});

test("contact actions keep phone and non-clipboard fallbacks usable", () => {
  const html = renderContactActions("primary");
  assert.match(html, /href="tel:15382772813"/);
  assert.match(html, /data-copy-wechat="15382772813"/);
  assert.match(html, /data-fallback-href="\/contact\/#wechat"/);
  assert.match(html, /href="\/contact\/"[^>]*>获取当季选款册/);
});

test("shared footer repeats the legal entity and real contact details", () => {
  const html = renderSiteFooter();
  assert.match(html, /广州市昂玖熙服饰有限公司/);
  assert.match(html, /583160424@qq\.com/);
  assert.match(html, /凤凰创意园20栋103/);
});

test("section heading uses one visible title and optional editorial label", () => {
  const html = renderSectionHeading({ eyebrow: "OUR APPROACH", title: "从真实身形出发", intro: "版型先于流行。" });
  assert.match(html, /OUR APPROACH/);
  assert.match(html, /<h2>从真实身形出发<\/h2>/);
  assert.match(html, /版型先于流行。/);
});
