import test from "node:test";
import assert from "node:assert/strict";
import { buildBreadcrumbJsonLd } from "../src/lib/seo.mjs";

test("article breadcrumb links home, knowledge hub, and current answer", () => {
  const data = buildBreadcrumbJsonLd(
    { path: "/knowledge/live-commerce-denim-selection/", title: "直播团队选择女装牛仔款式要注意什么？｜昂玖熙" },
    "https://angjiuxi.example"
  );
  assert.equal(data["@type"], "BreadcrumbList");
  assert.deepEqual(
    data.itemListElement.map((item) => item.item),
    [
      "https://angjiuxi.example/",
      "https://angjiuxi.example/knowledge/",
      "https://angjiuxi.example/knowledge/live-commerce-denim-selection/"
    ]
  );
});
