import test from "node:test";
import assert from "node:assert/strict";
import { knowledgeArticles } from "../src/data/knowledge.mjs";
import { renderKnowledgeIndex, renderKnowledgeArticle } from "../src/pages/knowledge.mjs";
import { renderContactPage } from "../src/pages/contact.mjs";

test("knowledge index links all eight static answer pages", () => {
  const page = renderKnowledgeIndex();
  assert.equal((page.body.match(/<h1\b/g) || []).length, 1);
  for (const article of knowledgeArticles) {
    assert.match(page.body, new RegExp(`/knowledge/${article.slug}/`));
  }
});

test("each knowledge article renders question, summary, sections, and update date", () => {
  for (const article of knowledgeArticles) {
    const page = renderKnowledgeArticle(article.slug);
    assert.ok(page, article.slug);
    assert.equal(page.path, `/knowledge/${article.slug}/`);
    assert.equal((page.body.match(/<h1\b/g) || []).length, 1);
    assert.match(page.body, new RegExp(article.updatedAt));
    assert.match(page.body, /class="article-summary"/);
    assert.match(page.body, /class="article-section"/);
    assert.match(page.body, /aria-label="面包屑导航"/);
  }
});

test("unknown knowledge slug returns a real not-found result", () => {
  assert.equal(renderKnowledgeArticle("unknown-denim-answer"), null);
});

test("contact page contains exact public contact and location facts", () => {
  const page = renderContactPage();
  assert.match(page.body, /潘森锐/);
  assert.match(page.body, /15382772813/);
  assert.match(page.body, /583160424@qq\.com/);
  assert.match(page.body, /广东省广州市海珠区凤凰创意园20栋103/);
  assert.match(page.body, /广东省中山市大涌镇/);
  assert.match(page.body, /id="wechat"/);
});
