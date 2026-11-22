import assert from "node:assert/strict";
import test from "node:test";

import { createPages } from "../scripts/build.mjs";
import { renderDocument } from "../src/lib/seo.mjs";

test("every internal page link resolves to a generated route", () => {
  const pages = createPages();
  const routes = new Set(pages.map((page) => page.path));
  const missing = [];

  for (const page of pages) {
    const document = renderDocument(page, "https://angjiuxi.test");
    for (const [, href] of document.matchAll(/href="([^"]+)"/g)) {
      if (!href.startsWith("/") || href.startsWith("/#") || href === "/styles.css") continue;
      const route = href.split("#")[0];
      if (!routes.has(route)) missing.push(`${page.path} -> ${route}`);
    }
  }

  assert.deepEqual(missing, []);
});
