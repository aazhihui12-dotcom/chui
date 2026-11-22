import test from "node:test";
import assert from "node:assert/strict";
import { siteConfig } from "../src/data/site-content.mjs";
import { audienceSolutions } from "../src/data/solutions.mjs";
import { knowledgeArticles } from "../src/data/knowledge.mjs";
import { assertPublishableCopy } from "../src/lib/claims.mjs";

test("site identity and contact facts remain consistent", () => {
  assert.equal(siteConfig.brand.cn, "昂玖熙");
  assert.equal(siteConfig.brand.en, "ANGJIUXI");
  assert.equal(siteConfig.company, "广州市昂玖熙服饰有限公司");
  assert.match(siteConfig.positioning, /女装牛仔/);
  assert.equal(siteConfig.contact.name, "潘森锐");
  assert.equal(siteConfig.contact.mobile, "15382772813");
  assert.equal(siteConfig.contact.email, "583160424@qq.com");
  assert.equal(siteConfig.contact.address, "广东省广州市海珠区凤凰创意园20栋103");
});

test("three customer paths have unique slugs and usable actions", () => {
  assert.deepEqual(
    audienceSolutions.map((item) => item.slug),
    ["live-commerce", "wholesale", "retail-stores"]
  );
  assert.equal(new Set(audienceSolutions.map((item) => item.slug)).size, 3);
  for (const solution of audienceSolutions) {
    assert.ok(solution.title.length > 0);
    assert.ok(solution.summary.length > 20);
    assert.match(solution.href, /^\//);
  }
});

test("knowledge hub starts with eight unique answer pages", () => {
  assert.equal(knowledgeArticles.length, 8);
  assert.equal(new Set(knowledgeArticles.map((article) => article.slug)).size, 8);
  for (const article of knowledgeArticles) {
    assert.match(article.slug, /^[a-z0-9-]+$/);
    assert.ok(article.question.endsWith("？"));
    assert.ok(article.summary.length >= 30);
    assert.ok(article.sections.length >= 2);
    assert.match(article.updatedAt, /^\d{4}-\d{2}-\d{2}$/);
  }
});

test("claim guard rejects risky or unverified public statements", () => {
  const forbidden = [
    "全国TOP3直播间团队",
    "98%返单率",
    "不良率0.005%",
    "准时交付率100%",
    "日产5000件",
    "年营业额3.86亿元",
    "全网最低"
  ];
  for (const phrase of forbidden) {
    assert.throws(() => assertPublishableCopy(`我们拥有${phrase}`), new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotThrow(() =>
    assertPublishableCopy("昂玖熙为直播团队、二批档口与实体门店提供女装牛仔选款、现货、贴牌与定制支持。")
  );
});

test("all seeded public content passes the claim guard", () => {
  const publicCopy = [
    siteConfig.positioning,
    siteConfig.description,
    ...audienceSolutions.flatMap((item) => [item.title, item.summary, ...item.points]),
    ...knowledgeArticles.flatMap((article) => [
      article.question,
      article.summary,
      ...article.sections.flatMap((section) => [section.heading, ...section.paragraphs])
    ])
  ];
  for (const copy of publicCopy) assert.doesNotThrow(() => assertPublishableCopy(copy));
});
