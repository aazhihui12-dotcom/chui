import test from "node:test";
import assert from "node:assert/strict";
import { knowledgeArticles } from "../src/data/knowledge.mjs";
import {
  buildLocalBusinessJsonLd,
  buildServiceJsonLd,
  buildFaqJsonLd
} from "../src/lib/seo.mjs";

const baseUrl = "https://angjiuxi.example";

test("local business, service, and FAQ data describe real public content", () => {
  const local = buildLocalBusinessJsonLd(baseUrl);
  const service = buildServiceJsonLd(baseUrl);
  const faq = buildFaqJsonLd(knowledgeArticles.slice(0, 4), baseUrl);
  assert.equal(local["@type"], "LocalBusiness");
  assert.match(local.address.streetAddress, /凤凰创意园20栋103/);
  assert.equal(service["@type"], "Service");
  assert.match(service.serviceType, /女装牛仔/);
  assert.equal(faq["@type"], "FAQPage");
  assert.equal(faq.mainEntity.length, 4);
  assert.ok(faq.mainEntity.every((item) => item["@type"] === "Question"));
});
