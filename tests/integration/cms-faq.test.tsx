// @vitest-environment node
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { it, expect } from "vitest";
import { CmsStore } from "@/lib/cms/store";
import { createFaqSeed } from "@/lib/cms/faq-seed";
import { getCatalog } from "@/runtime/lib/catalog";
import { articles } from "@/content/articles";
it("imports the 23 current APOWER FAQs once and never revives a deleted answer", () => {
  const dir = mkdtempSync(join(tmpdir(), "apower-faq-")),
    store = new CmsStore(join(dir, "cms.sqlite"));
  try {
    const seed = createFaqSeed();
    expect(seed).toHaveLength(23);
    store.seed([], seed);
    const first = seed[0];
    const r = store.get("article", first.id)!;
    store.remove("article", r.id, r.version, "admin");
    store.seed([], seed);
    expect(getCatalog(store).articles.map((a) => a.id)).not.toContain(first.id);
  } finally {
    store.db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
it("adds current answers to an existing database without replacing legacy detail URLs", () => {
  const dir = mkdtempSync(join(tmpdir(), "apower-faq-migration-")),
    store = new CmsStore(join(dir, "cms.sqlite"));
  try {
    store.seed([], articles);
    store.seed([], articles, createFaqSeed());
    const catalog = getCatalog(store);
    expect(catalog.faqs).toHaveLength(23);
    expect(catalog.legacyArticles.length).toBeGreaterThan(0);
    const first = catalog.faqs[0];
    const r = store.get("article", first.id)!;
    store.remove("article", r.id, r.version, "admin");
    store.seed([], articles, createFaqSeed());
    expect(getCatalog(store).faqs).toHaveLength(22);
  } finally {
    store.db.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
