import test from "node:test";
import assert from "node:assert/strict";
import { renderCollectionsPage } from "../src/pages/collections.mjs";
import { renderLiveCommercePage } from "../src/pages/live-commerce.mjs";
import { renderWholesalePage } from "../src/pages/wholesale.mjs";
import { renderSupplyChainPage } from "../src/pages/supply-chain.mjs";
import { assertPublishableCopy } from "../src/lib/claims.mjs";

const pages = [
  renderCollectionsPage(),
  renderLiveCommercePage(),
  renderWholesalePage(),
  renderSupplyChainPage()
];

test("selection and solution routes have unique metadata and one H1", () => {
  assert.equal(new Set(pages.map((page) => page.title)).size, pages.length);
  assert.equal(new Set(pages.map((page) => page.description)).size, pages.length);
  for (const page of pages) {
    assert.ok(page.title.length > 8);
    assert.ok(page.description.length > 30);
    assert.equal((page.body.match(/<h1\b/g) || []).length, 1, page.path);
    assert.doesNotThrow(() => assertPublishableCopy(page.body));
  }
});

test("each route uses its intended real imagery", () => {
  assert.match(pages[0].body, /collection-look-one\.webp/);
  assert.match(pages[1].body, /live-preparation\.webp/);
  assert.match(pages[2].body, /selection-service\.webp/);
  assert.match(pages[3].body, /pattern-design\.webp/);
  assert.match(pages[3].body, /denim-quality-control\.webp/);
  assert.match(pages[3].body, /packing-delivery\.webp/);
});

test("each route retains a working consultation action", () => {
  for (const page of pages) {
    assert.match(page.body, /href="\/contact\/"/);
    assert.match(page.body, /href="tel:15382772813"/);
  }
});

test("selection page does not invent SKU, price, MOQ, or stock data", () => {
  const body = pages[0].body;
  assert.doesNotMatch(body, /SKU[：:]?\s*[A-Z0-9]/i);
  assert.doesNotMatch(body, /¥\s*\d+/);
  assert.doesNotMatch(body, /起订\s*\d+/);
  assert.doesNotMatch(body, /库存\s*\d+/);
});
