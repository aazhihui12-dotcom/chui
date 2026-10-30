// @vitest-environment node
import { afterEach, beforeEach, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { CmsStore } from "@/lib/cms/store";
import { apowerProducts } from "@/content/apower";
import { articles } from "@/content/articles";
import { getCatalog, getRuntimePage } from "@/runtime/lib/catalog";
let dir: string, store: CmsStore;
beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "apower-catalog-"));
  store = new CmsStore(join(dir, "cms.sqlite"));
  store.seed(apowerProducts, articles);
});
afterEach(() => {
  store.db.close();
  rmSync(dir, { recursive: true, force: true });
});
it("removes deleted seed products from every live consumer and never falls back to a static page", () => {
  const r = store.get("product", "AP-G3")!;
  store.remove("product", r.id, r.version, "a");
  expect(getCatalog(store).products.map((p) => p.id)).not.toContain("AP-G3");
  expect(
    getCatalog(store).categories.find((c) => c.id === "682975")!.productIds,
  ).toEqual(["AP-G1", "AP-G11"]);
  expect(
    getRuntimePage("en", ["ProductDetail", "AP-G3.html"], store),
  ).toBeUndefined();
  expect(
    getRuntimePage("cn", ["ProductDetail", "AP-G3.html"], store),
  ).toBeUndefined();
});
it("serves newly published articles in both locales and immediately hides drafts", () => {
  const locales = {
    cn: {
      title: "上线新闻",
      description: "摘要",
      body: "新闻正文",
      images: [],
    },
    en: {
      title: "Live news",
      description: "Intro",
      body: "New body",
      images: [],
    },
  };
  let r = store.save("article", { status: "draft", locales }, "a");
  expect(
    getRuntimePage("cn", ["NewsDetail", `${r.id}.html`], store),
  ).toBeUndefined();
  r = store.save(
    "article",
    { id: r.id, version: r.version, status: "published", locales },
    "a",
  );
  expect(
    getRuntimePage("en", ["NewsDetail", `${r.id}.html`], store)?.title,
  ).toBe("Live news");
  expect(getCatalog(store).articles.map((a) => a.id)).toContain(r.id);
});
